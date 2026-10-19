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