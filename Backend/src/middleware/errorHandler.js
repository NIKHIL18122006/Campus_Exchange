export function errorHandler(err, req, res, next) {
  // Malformed JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Invalid UUID syntax from Postgres
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}