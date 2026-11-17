/* The same rules as the website's forms (src/utils/validation.js). The server re-checks everything. */
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^(\+91[\s-]?)?[6-9]\d{9}$/;
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&])[A-Za-z\d@#$&]{8,}$/;

export const messages = {
    name: "Please enter your full name.",
    email: "Please enter a valid email address.",
    phone: "Enter a valid 10-digit Indian mobile number (optionally starting with +91).",
    password:
        "Password needs a capital letter, a small letter, a number, a symbol (@, #, $, &) and at least 8 characters."
};

/** Trim text and cut it to a maximum length. */
export const clean = (value, max) => String(value ?? "").trim().slice(0, max);

/** A list of short texts (trip types, preferences). */
export const textList = (value, maxItems = 20, maxLength = 50) =>
    Array.isArray(value)
        ? value
              .filter((v) => typeof v === "string")
              .map((v) => v.trim().slice(0, maxLength))
              .filter(Boolean)
              .slice(0, maxItems)
        : [];

/** "2 People" -> 2, "7+ People" -> 7, anything else -> 2 */
export function parseTravelers(text) {
    const n = parseInt(text, 10);
    return Number.isNaN(n) || n < 1 ? 2 : Math.min(n, 100);
}

/** "5 - 7 Days" -> 6, "15+ Days" -> 15, empty -> null */
export function parseDurationDays(text) {
    const nums = String(text ?? "").match(/\d+/g);
    if (!nums) return null;
    const days = nums.length >= 2 ? Math.round((Number(nums[0]) + Number(nums[1])) / 2) : Number(nums[0]);
    return days >= 1 && days <= 365 ? days : null;
}

export const isIsoDate = (text) =>
    /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`));

export const paymentRefPattern = /^TS-\d{8}-[A-Z2-9]{4}$/;
export const destinationIdPattern = /^[A-Za-z0-9 _-]{1,50}$/;

/** Only these actions may be reported by the website. The others are written by the server itself. */
export const CLIENT_ACTIONS = ["trip_viewed"];