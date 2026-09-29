import pg from "pg";
import { env } from "./env.js";

const pool = new pg.Pool({
    connectionString: env.databaseUrl
});

export const query = (text, params) => pool.query(text, params);
export { pool };