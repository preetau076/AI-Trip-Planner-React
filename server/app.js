import express from "express";
import { pool } from "./db.js";
import { clearFailures, isBlocked, recordFailure } from "./rateLimit.js";
import { hashPassword, verifyPassword } from "./security.js";
import { currentUser, endSession, startSession } from "./session.js";
import {
    CLIENT_ACTIONS,
    clean,
    destinationIdPattern,
    emailPattern,
    isIsoDate,
    messages,
    parseDurationDays,
    parseTravelers,
    passwordPattern,
    paymentRefPattern,
    phonePattern,
    textList
} from "./validate.js";

/*
  TripSuggest server (Stage 2).

  The website tells the server who the user is by sending the user's id.
  That is fine for a demo, but anyone could send any id, so STAGE 3 replaces
  it with a real login session. Everything is written with parameterised
  queries ($1, $2 ...), so user text can never change the SQL.
*/
export const app = express();
app.disable("x-powered-by");
// Behind Vercel's proxy: trust ONE proxy hop so req.ip is the visitor's address (not Vercel's).
app.set("trust proxy", 1);
app.use(express.json({ limit: "50kb" }));

const bad = (res, error) => res.status(400).json({ error });

// Used to take the same time whether or not an email exists.
const DUMMY_HASH = await hashPassword("not-a-real-password");

const needLogin = (res) => res.status(401).json({ error: "Please log in again." });

/* ---------- health ---------- */
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ ok: true, database: "connected" });
    } catch (err) {
    console.error("Database check failed:", err.message || err.errors || err);
    res.status(503).json({ ok: false, database: "not reachable" });
    }
});

/* ---------- sign up: creates a row in `users` ---------- */
app.post("/api/signup", async (req, res) => {
    const name = clean(req.body.name, 100);
    const email = clean(req.body.email, 200).toLowerCase();
    const phone = clean(req.body.phone, 20);
    const password = String(req.body.password ?? "");

    if (name.length < 2) return bad(res, messages.name);
    if (!emailPattern.test(email)) return bad(res, messages.email);
    if (!phonePattern.test(phone)) return bad(res, messages.phone);
    if (!passwordPattern.test(password) || password.length > 200) return bad(res, messages.password);

    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query(
            `INSERT INTO users (name, email, phone, password_hash, last_login_at)
             VALUES ($1, $2, $3, $4, now())
             RETURNING id, name, email, phone`,
            [name, email, phone, passwordHash]
        );
        await client.query("INSERT INTO activity_log (user_id, action) VALUES ($1, 'signup')", [rows[0].id]);
        await client.query("COMMIT");
        await startSession(res, rows[0].id);
        res.status(201).json({ user: rows[0] });
    } catch (err) {
        await client.query("ROLLBACK");
        if (err.code === "23505") {
            return res.status(409).json({ error: "An account with this email already exists. Please login." });
        }
        throw err;
    } finally {
        client.release();
    }
});

/* ---------- login: checks the password hash ---------- */
app.post("/api/login", async (req, res) => {
    const email = clean(req.body.email, 200).toLowerCase();
    const password = String(req.body.password ?? "").slice(0, 200);
    const invalid = () => res.status(401).json({ error: "Invalid email or password." });

    const attemptKey = `${req.ip}|${email}`;
    if (isBlocked(attemptKey)) {
        return res.status(429).json({ error: "Too many failed attempts. Please try again in 15 minutes." });
    }

    const { rows } = await pool.query(
        "SELECT id, name, email, phone, password_hash FROM users WHERE email = $1",
        [email]
    );
    const user = rows[0];
    const passwordOk = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordOk) {
        recordFailure(attemptKey);
        return invalid();
    }
    clearFailures(attemptKey);

    await pool.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
    await pool.query("INSERT INTO activity_log (user_id, action) VALUES ($1, 'login')", [user.id]);
    await startSession(res, user.id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

/* ---------- who is logged in (checked from the session cookie) ---------- */
app.get("/api/me", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return needLogin(res);
    res.json({ user });
});

/* ---------- logout: ends the session and records it ---------- */
app.post("/api/logout", async (req, res) => {
    const user = await currentUser(req);
    if (user) {
        await pool.query("INSERT INTO activity_log (user_id, action) VALUES ($1, 'logout')", [user.id]);
    }
    await endSession(req, res);
    res.json({ ok: true });
});

/* ---------- small actions: trip viewed ---------- */

app.post("/api/activity", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return needLogin(res);

    const action = String(req.body.action ?? "");
    if (!CLIENT_ACTIONS.includes(action)) return bad(res, "Unknown action.");

    let details = req.body.details && typeof req.body.details === "object" ? req.body.details : {};
    if (JSON.stringify(details).length > 500) details = {};

    await pool.query("INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)", [
        user.id,
        action,
        details
    ]);
    res.status(201).json({ ok: true });
});

/* ---------- Trip Planner submitted: creates a row in `trip_requests` ---------- */
app.post("/api/trip-requests", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return needLogin(res);

    const r = req.body.request && typeof req.body.request === "object" ? req.body.request : {};
    const budget = parseInt(r.budget, 10);
    if (!(budget > 0 && budget <= 100000000)) return bad(res, "Please choose a trip budget.");

    const travelers = clean(r.travelers, 30);
    if (!travelers) return bad(res, "Please choose the number of travelers.");

    const travelDate = clean(r.travelDate, 10);
    if (travelDate && !isIsoDate(travelDate)) return bad(res, "The travel date is not valid.");

    const city = clean(r.city, 100) || "Not provided";
    const duration = clean(r.duration, 40);
    const results = Array.isArray(req.body.results)
        ? req.body.results.slice(0, 6).map((x) => ({
              id: clean(x?.id, 50),
              match: Number(x?.match) || 0,
              reasons: textList(x?.reasons, 5, 100)
          }))
        : [];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query(
            `INSERT INTO trip_requests
               (user_id, current_city, destination, suggest_for_me, travelers, traveler_count,
                duration, duration_days, travel_date, trip_types, budget_inr, budget_type,
                preferences, accommodation, transport, additional_info, recommended)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
             RETURNING id`,
            [
                user.id,
                city,
                clean(r.destination, 100) || "Not specified",
                r.suggest === true,
                travelers,
                parseTravelers(travelers),
                duration || "Not selected",
                parseDurationDays(duration),
                travelDate || null,
                textList(r.tripTypes),
                budget,
                r.budgetType === "group" ? "group" : "person",
                textList(r.preferences),
                clean(r.accommodation, 50) || "No Preference",
                clean(r.transport, 50) || "No Preference",
                clean(r.special, 2000),
                JSON.stringify(results)
            ]
        );
        if (city !== "Not provided") {
            await client.query("UPDATE users SET city = $2 WHERE id = $1", [user.id, city]);
        }
        await client.query("INSERT INTO activity_log (user_id, action, details) VALUES ($1, 'trip_request', $2)", [
            user.id,
            { request_id: rows[0].id }
        ]);
        await client.query("COMMIT");
        res.status(201).json({ id: rows[0].id });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

/* ---------- saved trips (the heart button) ---------- */
app.post("/api/saved-trips", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return needLogin(res);

    const destinationId = clean(req.body.destinationId, 50);
    if (!destinationIdPattern.test(destinationId)) return bad(res, "Unknown trip.");

    let changed;
    if (req.body.saved === true) {
        const result = await pool.query(
            `INSERT INTO saved_trips (user_id, destination_id) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [user.id, destinationId]
        );
        changed = result.rowCount > 0;
    } else {
        const result = await pool.query("DELETE FROM saved_trips WHERE user_id = $1 AND destination_id = $2", [
            user.id,
            destinationId
        ]);
        changed = result.rowCount > 0;
    }

    if (changed) {
        await pool.query("INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)", [
            user.id,
            req.body.saved === true ? "trip_saved" : "trip_unsaved",
            { destination: destinationId }
        ]);
    }
    res.json({ ok: true });
});

/*
  ---------- payments: creates / updates a row in `payments` ----------
  The website can only say "I clicked paid" and "money was deducted".
  The status is NEVER changed here: it stays 'Incomplete' until YOU run the
  UPDATE query after checking your UPI app.
*/
app.post("/api/payments/sync", async (req, res) => {
    const user = await currentUser(req);
    if (!user) return needLogin(res);

    const p = req.body.payment && typeof req.body.payment === "object" ? req.body.payment : {};
    const paymentRef = clean(p.paymentRef, 30);
    const destinationId = clean(p.destinationId, 50);
    const travelers = Number(p.travelers);
    const days = Number(p.days);
    const amount = Number(p.amount);

    if (!paymentRefPattern.test(paymentRef)) return bad(res, "Invalid payment reference.");
    if (!destinationIdPattern.test(destinationId)) return bad(res, "Unknown trip.");
    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 100) return bad(res, "Invalid travelers.");
    if (!Number.isInteger(days) || days < 1 || days > 365) return bad(res, "Invalid number of days.");
    if (!(amount > 0 && amount <= 10000000)) return bad(res, "Invalid amount.");

    const paid = p.userPaidClicked === true;
    const debit = p.userDebitConfirmed === true;
    const utr = /^\d{12}$/.test(String(p.utr ?? "")) ? String(p.utr) : null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Link to the planner request only if it belongs to this user
        let tripRequestId = null;
        if (Number.isInteger(Number(p.tripRequestId)) && Number(p.tripRequestId) > 0) {
            const found = await client.query("SELECT id FROM trip_requests WHERE id = $1 AND user_id = $2", [
                Number(p.tripRequestId),
                user.id
            ]);
            tripRequestId = found.rows[0]?.id ?? null;
        }

        const existing = (
            await client.query("SELECT * FROM payments WHERE payment_ref = $1 FOR UPDATE", [paymentRef])
        ).rows[0];
        if (existing && existing.user_id !== user.id) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "This payment belongs to another user." });
        }

        const log = (action, details = {}) =>
            client.query("INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)", [
                user.id,
                action,
                { ref: paymentRef, ...details }
            ]);

        if (!existing) {
            await client.query(
                `INSERT INTO payments
                   (payment_ref, user_id, trip_request_id, destination_id, travelers, days,
                    accommodation, transport, amount_inr, user_paid_clicked, user_debit_confirmed, utr)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
                [
                    paymentRef, user.id, tripRequestId, destinationId, travelers, days,
                    clean(p.accommodation, 50) || "No Preference",
                    clean(p.transport, 50) || "No Preference",
                    amount, paid, debit, debit ? utr : null
                ]
            );
            await log("payment_started", { amount });
            if (paid) await log("payment_user_paid");
            if (debit) await log("payment_debit_confirmed", { utr });
        } else {
            const newPaid = existing.user_paid_clicked || paid;
            const newDebit = existing.user_debit_confirmed || debit;
            await client.query(
                `UPDATE payments
                    SET user_paid_clicked = $2, user_debit_confirmed = $3, utr = COALESCE($4, utr)
                  WHERE payment_ref = $1`,
                [paymentRef, newPaid, newDebit, newDebit ? utr : null]
            );
            if (newPaid && !existing.user_paid_clicked) await log("payment_user_paid");
            if (newDebit && !existing.user_debit_confirmed) await log("payment_debit_confirmed", { utr });
        }

        await client.query("COMMIT");
        res.json({ ok: true });
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
});

/* ---------- contact page: creates a row in `contact_messages` ---------- */
app.post("/api/contact", async (req, res) => {
    const user = await currentUser(req); // optional: guests can write too
    const name = clean(req.body.name, 100);
    const email = clean(req.body.email, 200).toLowerCase();
    const message = clean(req.body.message, 1000);

    if (name.length < 1) return bad(res, "Please enter your name.");
    if (!emailPattern.test(email)) return bad(res, messages.email);
    if (message.length < 5) return bad(res, "Please write a short message.");

    await pool.query(
        "INSERT INTO contact_messages (user_id, name, email, message) VALUES ($1, $2, $3, $4)",
        [user?.id ?? null, name, email, message]
    );
    if (user) {
        await pool.query("INSERT INTO activity_log (user_id, action) VALUES ($1, 'contact_message')", [user.id]);
    }
    res.status(201).json({ ok: true });
});

/* ---------- unknown /api addresses and errors ---------- */
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

app.use((err, req, res, next) => {
    void next;
    if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
        return res.status(400).json({ error: "Invalid request." });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server." });
});