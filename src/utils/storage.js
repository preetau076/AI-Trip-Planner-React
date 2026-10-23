/*
  Thin wrapper around localStorage / sessionStorage.
  Every function is safe: it never throws if storage is empty, blocked or corrupted.

  Saved trips and planner history are stored PER USER (key + ":" + email),
  so two accounts on the same browser never see each other's data.

  FUTURE: replace the bodies of these functions with API calls
  (e.g. GET/POST /api/saved-trips) and the rest of the app will not need to change.
*/

const SAVED_KEY = "savedTrips";       // array of destination ids
const REQUESTS_KEY = "tripRequests";  // history of submitted planner forms
const RESULTS_KEY = "tripResults";    // sessionStorage: last recommendation (ids)
const REQUEST_KEY = "tripRequest";    // sessionStorage: last planner form
const USER_KEY = "tripUser";          // logged-in user (no password is stored)
const ACCOUNTS_KEY = "tripAccounts";  // registered accounts (demo, browser only)
const PAYMENTS_KEY = "payments";      // per user (see userKey)

export const STORAGE_EVENT = "tripsuggest:storage";

function read(store, key, fallback) {
    try {
        const raw = store.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write(store, key, value) {
    try {
        store.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event(STORAGE_EVENT));
        return true;
    } catch {
        return false;
    }
}
/* Contact details are already part of the account, so they are never copied into
   saved planner data. Only trip preferences are kept. */
const PERSONAL_FIELDS = ["name", "phone", "email"];

function stripPersonal(entry) {
    if (!entry || typeof entry !== "object") return entry;
    const clean = { ...entry };
    PERSONAL_FIELDS.forEach((field) => delete clean[field]);
    return clean;
}

/* Remove contact details from history saved by older versions of the app. */
function scrubSavedRequests() {
    try {
        const key = userKey(REQUESTS_KEY);
        const list = read(localStorage, key, []);
        if (!Array.isArray(list) || !list.length) return;
        localStorage.setItem(key, JSON.stringify(list.map(stripPersonal)));
    } catch {
        /* ignore */
    }
}

/* One-time cleanup: the old shared history key held every user's planner details
   (name, phone, email). It is no longer used, so remove it. */
try {
    localStorage.removeItem(REQUESTS_KEY);
} catch {
    /* ignore */
}

/* ---------- logged-in user (frontend only, NOT real authentication) ---------- */

export function getUser() {
    return read(localStorage, USER_KEY, null);
}

export function setUser(user) {
    write(localStorage, USER_KEY, user);
    scrubSavedRequests();
}

export function clearUser() {
    try {
        localStorage.removeItem(USER_KEY);
        // the last planner form / results belong to the user who just left
        sessionStorage.removeItem(REQUEST_KEY);
        sessionStorage.removeItem(RESULTS_KEY);
        window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
        /* ignore */
    }
}

/* Key for the current user. Logged-out visitors use the plain "guest" key. */
function userKey(base) {
    const user = getUser();
    return user?.email ? `${base}:${user.email}` : base;
}

/* ---------- saved trips ---------- */

export function getSavedTrips() {
    const list = read(localStorage, userKey(SAVED_KEY), []);
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
}

export function isTripSaved(id) {
    return getSavedTrips().includes(id);
}

/** Adds the trip if missing, removes it if present. Returns true when it is now saved. */
export function toggleSavedTrip(id) {
    const list = getSavedTrips();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    write(localStorage, userKey(SAVED_KEY), next);
    return next.includes(id);
}

export function removeSavedTrip(id) {
    write(localStorage, userKey(SAVED_KEY), getSavedTrips().filter((x) => x !== id));
}

/* ---------- planner requests ---------- */

/** results = [{ id, match, reasons }] as returned by recommendDestinations() */
export function saveTripRequest(request, results) {
    const trip = stripPersonal(request);
    write(sessionStorage, REQUEST_KEY, trip);
    write(sessionStorage, RESULTS_KEY, results);

    // History is only kept for logged-in users.
    if (!getUser()?.email) return;

    const history = read(localStorage, userKey(REQUESTS_KEY), []);
    const list = Array.isArray(history) ? history : [];
    write(localStorage, userKey(REQUESTS_KEY), [
        { ...trip, results, createdAt: new Date().toISOString() },
        ...list
    ].slice(0, 20));
}

export function getCurrentRequest() {
    return read(sessionStorage, REQUEST_KEY, null);
}

export function getCurrentResults() {
    const list = read(sessionStorage, RESULTS_KEY, null);
    return Array.isArray(list) ? list.filter((r) => r && typeof r.id === "string") : null;
}

/** Re-open an earlier request (from the dashboard) as the current one. */
export function openStoredRequest(entry) {
    const { results, createdAt, ...request } = entry;
    void createdAt;
    write(sessionStorage, REQUEST_KEY, request);
    write(sessionStorage, RESULTS_KEY, Array.isArray(results) ? results : []);
}

export function getTripRequests() {
    if (!getUser()?.email) return [];
    const list = read(localStorage, userKey(REQUESTS_KEY), []);
    return Array.isArray(list) ? list.map(stripPersonal) : [];
}

/* ---------- registered accounts (frontend demo, replace with backend later) ---------- */

export function getAccounts() {
    const list = read(localStorage, ACCOUNTS_KEY, []);
    return Array.isArray(list) ? list : [];
}

export function saveAccounts(list) {
    return write(localStorage, ACCOUNTS_KEY, list);
}

/* ---------- payments (frontend demo: stored per user in this browser) ---------- */

export function getPayments() {
    if (!getUser()?.email) return [];
    const list = read(localStorage, userKey(PAYMENTS_KEY), []);
    return Array.isArray(list) ? list : [];
}

function newPaymentRef() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
    const code = Array.from(
        crypto.getRandomValues(new Uint8Array(4)),
        (b) => alphabet[b % alphabet.length]
    ).join("");
    return `TS-${stamp}-${code}`;
}

/** Reuses an unfinished payment for the same trip, otherwise creates a new one. */
export function findOrCreatePayment({ destinationId, travelers, days, amount }) {
    if (!getUser()?.email) return null;
    const list = getPayments();

    const open = list.find(
        (p) =>
            p.status === "Incomplete" &&
            !p.userPaidClicked &&
            p.destinationId === destinationId &&
            p.travelers === travelers &&
            p.days === days &&
            p.amount === amount
    );
    if (open) return open;

    const payment = {
        paymentRef: newPaymentRef(),
        destinationId,
        travelers,
        days,
        amount,
        status: "Incomplete",
        userPaidClicked: false,
        userDebitConfirmed: false,
        utr: "",
        createdAt: new Date().toISOString()
    };
    return write(localStorage, userKey(PAYMENTS_KEY), [payment, ...list].slice(0, 50)) ? payment : null;
}

/*
  Only what the USER says can be changed here. The website never sets
  status to "Complete": that happens only when you verify the money yourself
  (later: an UPDATE query on the PostgreSQL payments table).
*/
export function updatePayment(ref, patch) {
    const allowed = {};
    if (typeof patch.userPaidClicked === "boolean") allowed.userPaidClicked = patch.userPaidClicked;
    if (typeof patch.userDebitConfirmed === "boolean") allowed.userDebitConfirmed = patch.userDebitConfirmed;
    if (typeof patch.utr === "string") allowed.utr = patch.utr.trim().slice(0, 12);

    let found = false;
    const next = getPayments().map((p) => {
        if (p.paymentRef !== ref) return p;
        found = true;
        return { ...p, ...allowed };
    });
    return found && write(localStorage, userKey(PAYMENTS_KEY), next);
}