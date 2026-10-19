import { query, pool } from '../config/db.js';
import { uploadImage } from '../services/cloudinary.service.js';

export async function createListing(req, res) {
  const files = req.files || [];
  if (files.length === 0) {
    return res.status(400).json({ error: 'At least one photo is required' });
  }

  const { title, description, price, negotiable, category, condition } = req.body;

  // Upload photos first (in order), collect the URLs
  const imageUrls = await Promise.all(files.map((f) => uploadImage(f.buffer)));

  // Insert listing + image rows together, or not at all
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const listingResult = await client.query(
      `INSERT INTO listings (seller_id, title, description, price, negotiable, category, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, description, price, negotiable, category, condition]
    );
    const listing = listingResult.rows[0];

    for (let i = 0; i < imageUrls.length; i++) {
      await client.query(
        'INSERT INTO listing_images (listing_id, image_url, position) VALUES ($1, $2, $3)',
        [listing.id, imageUrls[i], i]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ listing: { ...listing, images: imageUrls } });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function browseListings(req, res) {
    const {q, category, minPrice, maxPrice, page, limit} = req.validated;
    
    const conditions = ["l.status = 'available'"];
    const params = [];

    if(q){
        const escaped = q.replace(/[%_]/g, '\\$&'); // Escape % and _ for LIKE
        params.push(`%${escaped}%`);
        conditions.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`);
    }

    if(category){
        params.push(category);
        conditions.push(`l.category = $${params.length}`);
    }

    if(minPrice !== undefined){
        params.push(minPrice);
        conditions.push(`l.price >= $${params.length}`);
    }

    if(maxPrice !== undefined){
        params.push(maxPrice);
        conditions.push(`l.price <= $${params.length}`);
    }

    params.push(limit, (page - 1) * limit);
    const limitIdx = params.length - 1;
    const offsetIdx = params.length;

    const result = await query(
    `SELECT l.id, l.title, l.price, l.negotiable, l.category, l.condition,
            l.created_at,
            (SELECT image_url FROM listing_images li
              WHERE li.listing_id = l.id
              ORDER BY li.position LIMIT 1) AS cover_image,
            COUNT(*) OVER() AS total
     FROM listings l
     WHERE ${conditions.join(' AND ')}
     ORDER BY l.created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  const total = result.rows.length ? Number(result.rows[0].total) : 0;
  const listings = result.rows.map(({ total, ...row }) => row);

  res.status(200).json({
    listings,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getListing(req, res) {
  const result = await query(
    `SELECT l.id, l.seller_id, l.title, l.description, l.price, l.negotiable,
            l.category, l.condition, l.status, l.created_at,
            u.name AS seller_name,
            COALESCE(
              json_agg(li.image_url ORDER BY li.position)
                FILTER (WHERE li.id IS NOT NULL),
              '[]'
            ) AS images
     FROM listings l
     JOIN users u ON u.id = l.seller_id
     LEFT JOIN listing_images li ON li.listing_id = l.id
     WHERE l.id = $1
     GROUP BY l.id, u.name`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const { seller_id, seller_name, ...listing } = result.rows[0];
  res.status(200).json({
    listing: {
      ...listing,
      seller: { id: seller_id, name: seller_name },
      isOwner: seller_id === req.user.id,
    },
  });
}