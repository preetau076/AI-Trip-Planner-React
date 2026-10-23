import { getDestination } from "../data/destinations";

/*
  Budget estimate for a trip.

  The destination `price` is the package price for 2 travelers for `days` days.
  From that we derive a per-person, per-day cost and scale it to the
  traveler count / duration the user asked for. The split between the
  categories is a simple fixed ratio, then the accommodation and transport
  lines are adjusted by the user's choices.

  This is an ESTIMATE, not a quote. The factors below are indicative values
  (3 Star hotel and the package's own transport = 1.0) and can be tuned.
  FUTURE: with PostgreSQL these can live in tables instead of constants.
*/

const SPLIT = [
    { key: "accommodation", label: "Accommodation", share: 0.4 },
    { key: "food", label: "Food", share: 0.2 },
    { key: "transport", label: "Transportation", share: 0.25 },
    { key: "activities", label: "Activities", share: 0.15 }
];

const ACCOMMODATION_FACTORS = {
    "Budget Hotel": 0.7,
    "3 Star Hotel": 1,
    "4 Star Hotel": 1.4,
    "5 Star Hotel": 2.2,
    "Resort": 1.8
};

const TRANSPORT_FACTORS = {
    "Flight": 1.6,
    "Train": 0.7,
    "Bus": 0.6,
    "Car / Cab": 1.2,
    "Own Vehicle": 0.5
};

// "No Preference", empty or unknown values all mean "no change" (factor 1).
const pick = (map, key) => (Object.hasOwn(map, key) ? map[key] : 1);

export const formatINR = (value) => "₹" + Math.round(value).toLocaleString("en-IN");

export function parseTravelers(text) {
    const n = parseInt(text, 10);
    return Number.isNaN(n) || n < 1 ? 2 : n;
}

/** "5 - 7 Days" -> 6 (midpoint); "15+ Days" -> 15; anything else -> null */
export function parseDuration(text) {
    if (!text) return null;
    const nums = String(text).match(/\d+/g);
    if (!nums) return null;
    if (nums.length >= 2) return Math.round((Number(nums[0]) + Number(nums[1])) / 2);
    return Number(nums[0]);
}

export function estimateBudget(destinationId, { travelers, days, accommodation, transport } = {}) {
    const dest = getDestination(destinationId);
    if (!dest) return null;

    const people = travelers || 2;
    const tripDays = days || dest.days;
    const perPersonPerDay = dest.price / 2 / dest.days;
    const base = perPersonPerDay * people * tripDays;

    const factors = {
        accommodation: pick(ACCOMMODATION_FACTORS, accommodation),
        transport: pick(TRANSPORT_FACTORS, transport)
    };

    const lines = SPLIT.map((s) => ({
        ...s,
        amount: base * s.share * (factors[s.key] ?? 1)
    }));
    const total = lines.reduce((sum, line) => sum + line.amount, 0);

    return { people, days: tripDays, lines, total };
}