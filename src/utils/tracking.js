/*
  Records what the user does in the PostgreSQL database (through the Node.js
  server). Every function here is "fire and forget": it never throws and never
  slows or breaks the page. Nothing is sent when nobody is logged in.
*/
import { api } from "./api";
import { getUser } from "./storage";

const REQUEST_ID_KEY = "tripRequestId"; // id of the latest planner request saved in the database

function send(path, body) {
    const user = getUser();
    if (!user?.id) return Promise.resolve(null);

    return api(path, { method: "POST", body: { userId: user.id, ...body } }).then((result) => {
        if (!result.ok) console.warn("Could not record this in the database:", result.error);
        return result;
    });
}

/** The planner answers the server needs (name, phone and email are deliberately NOT sent). */
const pickRequest = (r = {}) => ({
    city: r.city,
    destination: r.destination,
    suggest: r.suggest === true,
    travelers: r.travelers,
    duration: r.duration,
    travelDate: r.travelDate,
    tripTypes: r.tripTypes,
    budget: r.budget,
    budgetType: r.budgetType,
    preferences: r.preferences,
    accommodation: r.accommodation,
    transport: r.transport,
    special: r.special
});

/** Database id of the planner request made in this session, or null. */
export function getTripRequestId() {
    try {
        const id = Number(sessionStorage.getItem(REQUEST_ID_KEY));
        return Number.isInteger(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
}

/** "trip_viewed" or "logout" */
export const trackActivity = (action, details = {}) => send("/activity", { action, details });

/** The heart button: saved = true when the trip was just saved, false when removed. */
export const trackSavedTrip = (destinationId, saved) => send("/saved-trips", { destinationId, saved });

/** Creates the payment row, or updates it when the user clicks "paid" / "money deducted". */
export const trackPayment = (payment) => send("/payments/sync", { payment });

/** Trip Planner submitted. Remembers the new database id so a payment can be linked to it. */
export async function trackTripRequest(request, results) {
    try {
        sessionStorage.removeItem(REQUEST_ID_KEY); // never keep an older request's id
    } catch {
        /* ignore */
    }

    const result = await send("/trip-requests", { request: pickRequest(request), results });
    if (result?.ok && result.data?.id) {
        try {
            sessionStorage.setItem(REQUEST_ID_KEY, String(result.data.id));
        } catch {
            /* ignore */
        }
    }
    return result;
}

/** Contact page message. Works for guests too (no user id). */
export function trackContact({ name, email, message }) {
    const user = getUser();
    return api("/contact", { method: "POST", body: { userId: user?.id ?? null, name, email, message } });
}
