import { createHash, randomBytes } from "node:crypto";
import { pool } from "./db.js";

/*
  Login sessions.
  After a successful signup or login the server creates a random token, keeps
  only its SHA-256 hash in the `sessions` table, and sends the token to the
  browser in a cookie that JavaScript cannot read (HttpOnly). On every request
  the server looks the cookie up to learn who is logged in, so the website can
  no longer pretend to be another user.
*/
export const COOKIE_NAME = "ts_session";
const SESSION_DAYS = 7;
const MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

function readCookie(req, name) {
    for (const part of (req.headers.cookie || "").split(";")) {
        const at = part.indexOf("=");
        if (at === -1 || part.slice(0, at).trim() !== name) continue;
        try {
            return decodeURIComponent(part.slice(at + 1).trim());
        } catch {
            return null; // broken cookie text
        }
    }
    return null;
}

const attributes = () => `Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

/** Creates a session for this user and sets the cookie. */
export async function startSession(res, userId) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);

    await pool.query("DELETE FROM sessions WHERE expires_at < now()"); // tidy up old ones
    await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
        hashToken(token),
        userId,
        expiresAt
    ]);
    res.append("Set-Cookie", `${COOKIE_NAME}=${token}; Max-Age=${MAX_AGE_SECONDS}; ${attributes()}`);
}

/** The logged-in user ({ id, name, email, phone }) or null. */
export async function currentUser(req) {
    const token = readCookie(req, COOKIE_NAME);
    if (!token || token.length > 200) return null;

    const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone
           FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [hashToken(token)]
    );
    return rows[0] || null;
}

/** Deletes this browser's session and clears the cookie. */
export async function endSession(req, res) {
    const token = readCookie(req, COOKIE_NAME);
    if (token && token.length <= 200) {
        await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
    }
    res.append("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; ${attributes()}`);
}