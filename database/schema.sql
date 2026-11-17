-- =====================================================================
-- TripSuggest database (PostgreSQL)
-- Run this ONCE on an empty database (for example in Neon's SQL Editor).
-- It creates 7 tables and 4 views.
-- =====================================================================

-- 1. USERS: who the person is (the password is stored only as a hash)
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    name           TEXT        NOT NULL,
    email          TEXT        NOT NULL UNIQUE,
    phone          TEXT        NOT NULL,
    city           TEXT        NOT NULL DEFAULT 'Not provided',
    password_hash  TEXT        NOT NULL,
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at  TIMESTAMPTZ,
    CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

-- 2. SESSIONS: who is logged in (only a hash of the login token is stored)
CREATE TABLE sessions (
    token_hash TEXT        PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

-- 3. TRIP_REQUESTS: every time a user fills the Trip Planner
CREATE TABLE trip_requests (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_city    TEXT        NOT NULL DEFAULT 'Not provided',
    destination     TEXT        NOT NULL DEFAULT 'Not specified',
    suggest_for_me  BOOLEAN     NOT NULL DEFAULT FALSE,
    travelers       TEXT        NOT NULL,
    traveler_count  INTEGER     NOT NULL CHECK (traveler_count > 0),
    duration        TEXT        NOT NULL DEFAULT 'Not selected',
    duration_days   INTEGER     CHECK (duration_days > 0),
    travel_date     DATE,
    trip_types      TEXT[]      NOT NULL DEFAULT '{}',
    budget_inr      INTEGER     NOT NULL CHECK (budget_inr > 0),
    budget_type     TEXT        NOT NULL DEFAULT 'person' CHECK (budget_type IN ('person', 'group')),
    preferences     TEXT[]      NOT NULL DEFAULT '{}',
    accommodation   TEXT        NOT NULL DEFAULT 'No Preference',
    transport       TEXT        NOT NULL DEFAULT 'No Preference',
    additional_info TEXT        NOT NULL DEFAULT '' CHECK (char_length(additional_info) <= 2000),
    recommended     JSONB       NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX trip_requests_user_idx ON trip_requests (user_id, created_at DESC);

-- 4. SAVED_TRIPS: the heart button
CREATE TABLE saved_trips (
    user_id        INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, destination_id)
);

-- 5. PAYMENTS: one row per payment; starts as 'Incomplete'
CREATE TABLE payments (
    id                   SERIAL PRIMARY KEY,
    payment_ref          TEXT          NOT NULL UNIQUE,
    user_id              INTEGER       NOT NULL REFERENCES users(id),
    trip_request_id      INTEGER       REFERENCES trip_requests(id) ON DELETE SET NULL,
    destination_id       TEXT          NOT NULL,
    travelers            INTEGER       NOT NULL CHECK (travelers > 0),
    days                 INTEGER       NOT NULL CHECK (days > 0),
    accommodation        TEXT          NOT NULL DEFAULT 'No Preference',
    transport            TEXT          NOT NULL DEFAULT 'No Preference',
    amount_inr           NUMERIC(10,2) NOT NULL CHECK (amount_inr > 0),
    payment_method       TEXT          NOT NULL DEFAULT 'UPI QR',
    status               TEXT          NOT NULL DEFAULT 'Incomplete'
                         CHECK (status IN ('Incomplete', 'Complete')),
    user_paid_clicked    BOOLEAN       NOT NULL DEFAULT FALSE,
    user_debit_confirmed BOOLEAN       NOT NULL DEFAULT FALSE,
    utr                  TEXT          CHECK (utr IS NULL OR utr ~ '^[0-9]{12}$'),
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    verified_at          TIMESTAMPTZ,
    CONSTRAINT payments_verified_matches_status
        CHECK ((status = 'Complete') = (verified_at IS NOT NULL))
);
CREATE INDEX payments_user_idx   ON payments (user_id);
CREATE INDEX payments_status_idx ON payments (status);

-- 6. CONTACT_MESSAGES: messages from the Contact page
CREATE TABLE contact_messages (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    name       TEXT        NOT NULL,
    email      TEXT        NOT NULL,
    message    TEXT        NOT NULL CHECK (char_length(message) BETWEEN 5 AND 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. ACTIVITY_LOG: a timeline of everything a user does
CREATE TABLE activity_log (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    action     TEXT        NOT NULL CHECK (action IN (
                   'signup', 'login', 'logout',
                   'trip_viewed', 'trip_request', 'trip_saved', 'trip_unsaved',
                   'payment_started', 'payment_user_paid', 'payment_debit_confirmed', 'payment_verified',
                   'contact_message')),
    details    JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activity_user_idx ON activity_log (user_id, created_at DESC);

-- ---------- Easy-to-read views for checking the data ----------

-- One row per user with totals (the password hash is left out on purpose)
CREATE VIEW v_user_summary AS
SELECT u.id, u.name, u.email, u.phone, u.city, u.created_at, u.last_login_at,
       (SELECT count(*) FROM trip_requests t WHERE t.user_id = u.id) AS trip_requests,
       (SELECT count(*) FROM saved_trips s   WHERE s.user_id = u.id) AS saved_trips,
       (SELECT count(*) FROM payments p      WHERE p.user_id = u.id) AS payments_started,
       (SELECT count(*) FROM payments p WHERE p.user_id = u.id AND p.status = 'Complete') AS payments_verified,
       (SELECT count(*) FROM payments p WHERE p.user_id = u.id AND p.status = 'Incomplete'
                                          AND p.user_debit_confirmed) AS waiting_for_your_check,
       (SELECT count(*) FROM payments p WHERE p.user_id = u.id AND p.status = 'Incomplete'
                                          AND NOT p.user_debit_confirmed) AS not_paid_yet,
       (SELECT COALESCE(sum(p.amount_inr), 0) FROM payments p
         WHERE p.user_id = u.id AND p.status = 'Complete') AS paid_total_inr,
       (SELECT max(a.created_at) FROM activity_log a WHERE a.user_id = u.id) AS last_activity
FROM users u;

-- One row per planner request, together with who made it
CREATE VIEW v_trip_requests_full AS
SELECT t.id AS request_id, u.name, u.email, u.phone,
       t.current_city, t.destination, t.suggest_for_me, t.travelers, t.duration,
       t.travel_date, t.trip_types, t.budget_inr, t.budget_type, t.preferences,
       t.accommodation, t.transport, t.additional_info, t.created_at
FROM trip_requests t JOIN users u ON u.id = t.user_id;

-- One row per payment, together with who paid and how far it got
CREATE VIEW v_payments_full AS
SELECT p.payment_ref, u.name, u.email, u.phone, p.destination_id, p.travelers, p.days,
       p.accommodation, p.transport, p.amount_inr, p.payment_method, p.status,
       CASE
           WHEN p.status = 'Complete'    THEN 'Payment verified (Complete)'
           WHEN p.user_debit_confirmed   THEN 'User says money deducted, awaiting your check'
           WHEN p.user_paid_clicked      THEN 'User says paid, details pending'
           ELSE                               'Payment page opened, not paid yet'
       END AS payment_progress,
       p.user_paid_clicked, p.user_debit_confirmed, p.utr, p.created_at, p.verified_at
FROM payments p JOIN users u ON u.id = p.user_id;

-- THE MAIN VIEW: one row per planner request with the user, every choice, and the payment
CREATE VIEW v_trip_overview AS
SELECT t.id AS request_id, t.created_at AS requested_at,
       u.name, u.email, u.phone, t.current_city,
       t.destination AS destination_typed, t.suggest_for_me,
       t.travelers, t.duration, t.travel_date, t.trip_types,
       t.budget_inr, t.budget_type, t.preferences,
       t.accommodation AS stay_choice, t.transport AS travel_mode_choice, t.additional_info,
       p.payment_ref, p.destination_id AS booked_destination, p.amount_inr,
       COALESCE(p.status, 'No payment') AS payment_status,
       CASE
           WHEN p.id IS NULL           THEN 'No payment started'
           WHEN p.status = 'Complete'  THEN 'Payment verified (Complete)'
           WHEN p.user_debit_confirmed THEN 'User says money deducted, awaiting your check'
           WHEN p.user_paid_clicked    THEN 'User says paid, details pending'
           ELSE                             'Payment page opened, not paid yet'
       END AS payment_progress
FROM trip_requests t
JOIN users u ON u.id = t.user_id
LEFT JOIN payments p ON p.trip_request_id = t.id;