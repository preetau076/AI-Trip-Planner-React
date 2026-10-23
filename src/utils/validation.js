/* Shared form validation rules (taken from the original login/signup scripts). */

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian mobile number, optionally prefixed with +91
export const phonePattern = /^(\+91[\s-]?)?[6-9]\d{9}$/;

// 8+ chars with upper, lower, digit and one of @ # $ &
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&])[A-Za-z\d@#$&]{8,}$/;

export const messages = {
    email: "Please enter a valid email address.",
    phone: "Enter a valid 10-digit Indian mobile number (optionally starting with +91).",
    password:
        "Password needs a capital letter, a small letter, a number, a symbol (@, #, $, &) and at least 8 characters."
};

/* ---------- dates (always the user's LOCAL date, never UTC) ---------- */

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Today as YYYY-MM-DD in the user's own time zone. */
export const todayISO = () => toISO(new Date());

/* How far ahead a trip can be planned. Change this one number
   (12 = 1 year, 6 = six months) and the form and its message follow. */
const MAX_MONTHS_AHEAD = 6;

/** Allowed range for a travel date: today up to MAX_MONTHS_AHEAD months ahead. */
export function dateLimits() {
    const now = new Date();

    // Same day number in the target month, or that month's last day (e.g. 31 Aug + 6 months = 28 Feb).
    const target = new Date(now.getFullYear(), now.getMonth() + MAX_MONTHS_AHEAD, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(now.getDate(), lastDay));

    const years = MAX_MONTHS_AHEAD / 12;
    const label =
        MAX_MONTHS_AHEAD % 12 === 0
            ? `${years} year${years === 1 ? "" : "s"}`
            : `${MAX_MONTHS_AHEAD} months`;

    return { min: toISO(now), max: toISO(target), label };
}