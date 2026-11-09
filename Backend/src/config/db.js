import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({ connectionString: env.databaseUrl });

// A dropped idle connection must not crash the server
pool.on('error', (err) => {
  console.error('Unexpected database error on an idle connection:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export { pool };