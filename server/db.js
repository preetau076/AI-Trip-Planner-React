import pg from "pg";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local (see .env.example).");
}

// One shared set of connections to PostgreSQL.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });