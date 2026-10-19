export function errorHandler(err, req, res, next) {
  // Malformed JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Invalid UUID syntax from Postgres
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Each photo must be under 5 MB' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'You can upload at most 4 photos' });
  }
  if (err.message === 'INVALID_FILE_TYPE') {
   return res.status(400).json({ error: 'Only image files are allowed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}