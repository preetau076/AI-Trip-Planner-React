/*
  Checks the database connection and prints the REAL reason when it fails.
  Run:  npm.cmd run check-db
*/
import pg from "pg";

const raw = process.env.DATABASE_URL;
if (!raw) {
    console.log("DATABASE_URL is missing in .env.local");
    process.exit(1);
}

try {
    const u = new URL(raw);
    console.log("User     :", decodeURIComponent(u.username));
    console.log("Password :", u.password ? `${decodeURIComponent(u.password).length} characters (hidden)` : "(none!)");
    console.log("Host     :", u.hostname);
    console.log("Port     :", u.port || "5432 (default)");
    console.log("Database :", decodeURIComponent(u.pathname.slice(1)));
} catch {
    console.log("DATABASE_URL is not a valid address.");
    console.log("A special character in the password (@ # / : ? %) probably has to be written as a code, for example @ becomes %40.");
    process.exit(1);
}

const client = new pg.Client({ connectionString: raw });
try {
    await client.connect();
    const db = await client.query("SELECT current_database() AS name");
    const tables = await client.query(
        "SELECT count(*) AS n FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("\nCONNECTED to database:", db.rows[0].name);
    console.log("Tables and views found:", tables.rows[0].n, "(expected 10)");
} catch (err) {
    const detail = err.message || err.errors?.map((e) => e.message || e.code).join(" | ") || err.code || String(err);
    console.log("\nCOULD NOT CONNECT:", detail);
    if (err.code) console.log("Code:", err.code);
    process.exitCode = 1;
} finally {
    await client.end().catch(() => {});
}