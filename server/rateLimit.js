/*
  Stops password guessing: after 5 wrong passwords for the same email from the
  same address, further login attempts are refused for 15 minutes.
  (Kept in memory, which is enough for one server. A hosted version with several
  servers would keep these counts in the database instead.)
*/
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_ENTRIES = 10000;

const failures = new Map(); // key -> { count, resetAt }

function entry(key) {
    const found = failures.get(key);
    if (found && found.resetAt <= Date.now()) {
        failures.delete(key);
        return null;
    }
    return found || null;
}

export const isBlocked = (key) => (entry(key)?.count ?? 0) >= MAX_FAILURES;

export function recordFailure(key) {
    if (failures.size >= MAX_ENTRIES) failures.clear();
    const found = entry(key);
    if (found) found.count += 1;
    else failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
}

export const clearFailures = (key) => failures.delete(key);