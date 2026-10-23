import { destinations } from "../data/destinations";
import { estimateBudget, parseDuration, parseTravelers } from "./budget";

/*
  CONTENT-BASED RECOMMENDER (no network, no hardcoded destination names).

  Every destination is scored against the planner form using its own data
  (tags + price from data/destinations.js):

      score = weighted average of the signals the user actually provided

      signal            weight   value (0 to 1)
      ----------------  ------   ---------------------------------------------
      typed destination   30     1 if the name matches, else 0
      trip types          35     share of the selected types the place has
      preferences         15     share of the selected preferences it has
      budget              20     1 if within budget, fading to 0 at 2x budget

  The budget signal uses the same estimate shown on the Results page, so it
  includes travelers, duration, accommodation and transport.
  The "special requirements" text gives a small bonus (+3 per destination tag
  mentioned, max +6). Signals the user did not fill in are skipped.
  The ratio is mapped to a 40-98% "match" and the list is sorted by it.

  This is an explainable, score based model, not machine learning.
  FUTURE: with PostgreSQL, the same data can come from a destinations table
  (tags, price) and saved trips can be used to learn which tags users prefer.
  Keep the same input and return shape and nothing else must change.
*/

const WEIGHTS = { destination: 30, tripType: 35, preference: 15, budget: 20 };

const norm = (s) => String(s || "").trim().toLowerCase();

const hasTag = (dest, label) =>
    norm(dest.type) === norm(label) || dest.tags.some((t) => norm(t) === norm(label));

/** Cost the user's budget is compared with (same estimate as the Results page). */
function estimatedSpend(dest, request) {
    const estimate = estimateBudget(dest.id, {
        travelers: parseTravelers(request.travelers),
        days: parseDuration(request.duration) || undefined,
        accommodation: request.accommodation,
        transport: request.transport
    });
    return request.budgetType === "group" ? estimate.total : estimate.total / estimate.people;
}

const matchesDestination = (dest, typed) =>
    !!typed && (norm(dest.id).includes(typed) || norm(dest.name).includes(typed));

/** True when the text typed in "Where would you like to go?" matches a destination we have. */
export function hasDestinationMatch(text) {
    const typed = norm(text);
    return destinations.some((dest) => matchesDestination(dest, typed));
}

function evaluate(dest, request) {
    const parts = [];
    const reasons = [];

    const typed = norm(request.destination);
        const typedHit = matchesDestination(dest, typed);
    if (typed) {
        parts.push({ weight: WEIGHTS.destination, value: typedHit ? 1 : 0 });
        if (typedHit) reasons.push("Matches your destination");
    }

    const types = request.tripTypes || [];
    const matchedTypes = types.filter((t) => hasTag(dest, t));
    if (types.length) {
        parts.push({ weight: WEIGHTS.tripType, value: matchedTypes.length / types.length });
        if (matchedTypes.length) reasons.push(`Matches ${matchedTypes.join(", ")}`);
    }

    // Special requirements: bonus for each destination tag the user's text mentions.
    const notes = norm(request.special);
    const noteTags = notes ? dest.tags.filter((tag) => notes.includes(norm(tag))) : [];
    if (noteTags.length) reasons.push(`Fits your notes (${noteTags.join(", ").toLowerCase()})`);

    const prefs = request.preferences || [];
    const matchedPrefs = prefs.filter((p) => hasTag(dest, p));
    if (prefs.length) {
        parts.push({ weight: WEIGHTS.preference, value: matchedPrefs.length / prefs.length });
        if (matchedPrefs.length) {
            reasons.push(`Great for ${matchedPrefs.join(", ").toLowerCase()}`);
        }
    }

    const budget = parseInt(request.budget, 10);
    let budgetFit = null;
    if (budget > 0) {
        const spend = estimatedSpend(dest, request);
        budgetFit = spend <= budget ? 1 : Math.max(0, 1 - (spend - budget) / budget);
        parts.push({ weight: WEIGHTS.budget, value: budgetFit });
        if (budgetFit === 1) reasons.push("Within your budget");
        else if (budgetFit >= 0.5) reasons.push("Slightly above your budget");
    }

    const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
    const earned = parts.reduce((sum, p) => sum + p.weight * p.value, 0);
    const ratio = totalWeight ? earned / totalWeight : 0.5;
    const bonus = Math.min(6, noteTags.length * 3);

    return {
        dest,
        match: Math.min(98, Math.round(40 + 58 * ratio) + bonus),
        reasons,
        typedHit,
        typeHits: matchedTypes.length,
        prefHits: matchedPrefs.length,
        budgetFit
    };
}

/**
 * @param {object} request  planner form values
 * @returns {{id:string, match:number, reasons:string[]}[]} ranked recommendations (max 6)
 */
export function recommendDestinations(request) {
    const scored = destinations.map((dest) => evaluate(dest, request));

    // Narrow the list using the strongest thing the user told us.
    let pool = [];
    if (norm(request.destination)) pool = scored.filter((s) => s.typedHit);
    if (!pool.length && (request.tripTypes || []).length) {
        pool = scored.filter((s) => s.typeHits > 0);
    }
    if (!pool.length && (request.preferences || []).length) {
        pool = scored.filter((s) => s.prefHits > 0);
    }
    if (!pool.length && parseInt(request.budget, 10) > 0) {
        pool = scored.filter((s) => s.budgetFit > 0);
    }
    if (!pool.length) pool = scored;

    return pool
        .sort((a, b) => b.match - a.match || a.dest.price - b.dest.price)
        .slice(0, 6)
        .map(({ dest, match, reasons }) => ({ id: dest.id, match, reasons }));
}