import { query, pool } from '../config/db.js';
import { emitToUser } from '../socket/index.js';

export async function expressInterest(req, res) {
  const listingResult = await query(
    'SELECT id, seller_id, title, status FROM listings WHERE id = $1',
    [req.params.id]
  );
  const listing = listingResult.rows[0];

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.seller_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot express interest in your own listing' });
  }
  if (listing.status !== 'available') {
    return res.status(409).json({ error: 'This item has already been sold' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inserted = await client.query(
      `INSERT INTO conversations (listing_id, buyer_id)
       VALUES ($1, $2)
       ON CONFLICT (listing_id, buyer_id) DO NOTHING
       RETURNING id`,
      [listing.id, req.user.id]
    );

    // Already interested earlier: return the existing chat, create nothing
    if (inserted.rows.length === 0) {
      await client.query('ROLLBACK');
      const existing = await query(
        'SELECT id FROM conversations WHERE listing_id = $1 AND buyer_id = $2',
        [listing.id, req.user.id]
      );
      return res.status(200).json({ conversationId: existing.rows[0].id, created: false });
    }

    const conversationId = inserted.rows[0].id;

    const messageResult = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, body, created_at`,
      [conversationId, req.user.id, `Hi, I'm interested in "${listing.title}".`]
    );

    await client.query('COMMIT');

    emitToUser(listing.seller_id, 'message:new', {
      conversationId,
      isNew: true,
      message: messageResult.rows[0],
    });

    res.status(201).json({ conversationId, created: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Finds a conversation only if the user is the buyer or the seller
async function getConversationForUser(conversationId, userId) {
  const result = await query(
    `SELECT c.id, c.buyer_id, l.seller_id,
            l.id AS listing_id, l.title AS listing_title, l.status AS listing_status,
            CASE WHEN c.buyer_id = $2 THEN s.id   ELSE b.id   END AS other_id,
            CASE WHEN c.buyer_id = $2 THEN s.name ELSE b.name END AS other_name
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users b ON b.id = c.buyer_id
     JOIN users s ON s.id = l.seller_id
     WHERE c.id = $1 AND (c.buyer_id = $2 OR l.seller_id = $2)`,
    [conversationId, userId]
  );
  return result.rows[0];
}

export async function listConversations(req, res) {
  const result = await query(
    `SELECT c.id, c.listing_id,
            l.title AS listing_title, l.status AS listing_status,
            (SELECT image_url FROM listing_images li
              WHERE li.listing_id = l.id ORDER BY li.position LIMIT 1) AS cover_image,
            CASE WHEN c.buyer_id = $1 THEN 'buyer' ELSE 'seller' END AS my_role,
            other.id AS other_user_id, other.name AS other_user_name,
            lm.body AS last_message, lm.created_at AS last_message_at,
            (SELECT COUNT(*) FROM messages m
              WHERE m.conversation_id = c.id
                AND m.sender_id <> $1
                AND m.created_at > CASE WHEN c.buyer_id = $1
                                        THEN c.buyer_last_read_at
                                        ELSE c.seller_last_read_at END
            )::int AS unread_count
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users other ON other.id = CASE WHEN c.buyer_id = $1 THEN l.seller_id ELSE c.buyer_id END
     JOIN LATERAL (
       SELECT body, created_at FROM messages
       WHERE conversation_id = c.id
       ORDER BY created_at DESC LIMIT 1
     ) lm ON TRUE
     WHERE c.buyer_id = $1 OR l.seller_id = $1
     ORDER BY lm.created_at DESC`,
    [req.user.id]
  );

  res.status(200).json({ conversations: result.rows });
}

export async function getUnreadCount(req, res) {
  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM messages m
     JOIN conversations c ON c.id = m.conversation_id
     JOIN listings l ON l.id = c.listing_id
     WHERE (c.buyer_id = $1 OR l.seller_id = $1)
       AND m.sender_id <> $1
       AND m.created_at > CASE WHEN c.buyer_id = $1
                               THEN c.buyer_last_read_at
                               ELSE c.seller_last_read_at END`,
    [req.user.id]
  );

  res.status(200).json({ count: result.rows[0].count });
}

export async function getMessages(req, res) {
  const conv = await getConversationForUser(req.params.id, req.user.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // latest 200 messages, returned oldest first
  const messages = await query(
    `SELECT id, sender_id, body, created_at FROM (
       SELECT id, sender_id, body, created_at FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC LIMIT 200
     ) recent
     ORDER BY created_at ASC`,
    [conv.id]
  );

  await markRead(conv, req.user.id);

  res.status(200).json({
    conversation: {
      id: conv.id,
      listing: { id: conv.listing_id, title: conv.listing_title, status: conv.listing_status },
      otherUser: { id: conv.other_id, name: conv.other_name },
      canSend: conv.listing_status === 'available',
    },
    messages: messages.rows,
  });
}

export async function sendMessage(req, res) {
  const conv = await getConversationForUser(req.params.id, req.user.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (conv.listing_status !== 'available') {
    return res.status(409).json({ error: 'This item is sold. The chat is read-only.' });
  }

  const result = await query(
    `INSERT INTO messages (conversation_id, sender_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, body, created_at`,
    [conv.id, req.user.id, req.body.body]
  );

  await markRead(conv, req.user.id);   // replying means you've seen the chat

  emitToUser(conv.other_id, 'message:new', {
    conversationId: conv.id,
    isNew: false,
    message: result.rows[0],
  });
  // Socket.io push to the other person is added in the next step
  res.status(201).json({ message: result.rows[0] });
}

async function markRead(conv, userId) {
  // the column name comes from one of two fixed strings, never from user input
  const column = conv.buyer_id === userId ? 'buyer_last_read_at' : 'seller_last_read_at';
  await query(`UPDATE conversations SET ${column} = NOW() WHERE id = $1`, [conv.id]);
}

export async function markConversationRead(req, res) {
  const conv = await getConversationForUser(req.params.id, req.user.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  await markRead(conv, req.user.id);
  res.status(204).send();
}