import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    getTripRequestId,
    trackActivity,
    trackContact,
    trackPayment,
    trackSavedTrip,
    trackTripRequest
} from "../utils/tracking";
import { clearUser, setUser } from "../utils/storage";

let calls;
let reply;

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    calls = [];
    reply = { status: 201, body: { ok: true } };
    vi.stubGlobal("fetch", async (url, options) => {
        calls.push({ url, body: options?.body ? JSON.parse(options.body) : null });
        return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
    });
});
afterEach(() => vi.unstubAllGlobals());

describe("nothing is sent when nobody is logged in", () => {
    it("skips every tracking call", async () => {
        await trackActivity("trip_viewed", { destination: "Goa" });
        await trackSavedTrip("Goa", true);
        await trackPayment({ paymentRef: "TS-1" });
        await trackTripRequest({ travelers: "2 People", budget: "25000" }, []);
        expect(calls).toHaveLength(0);
    });
});

describe("when a user is logged in", () => {
    beforeEach(() => setUser({ id: 7, name: "A", email: "a@test.com", phone: "9876543210" }));

    it("records an activity with the user id", async () => {
        await trackActivity("trip_viewed", { destination: "Goa" });
        expect(calls[0]).toEqual({
            url: "/api/activity",
            body: { userId: 7, action: "trip_viewed", details: { destination: "Goa" } }
        });
    });

    it("records saving and removing a trip", async () => {
        await trackSavedTrip("Goa", true);
        await trackSavedTrip("Goa", false);
        expect(calls.map((c) => c.body)).toEqual([
            { userId: 7, destinationId: "Goa", saved: true },
            { userId: 7, destinationId: "Goa", saved: false }
        ]);
    });

    it("sends the planner answers but never name, phone or email", async () => {
        reply = { status: 201, body: { id: 42 } };
        const form = {
            name: "A", phone: "9876543210", email: "a@test.com",
            city: "Ahmedabad", destination: "Goa", suggest: false, travelers: "5 People",
            duration: "3 - 4 Days", travelDate: "2027-01-10", tripTypes: ["Beach"],
            budget: "50000", budgetType: "group", preferences: ["Food"],
            accommodation: "5 Star Hotel", transport: "Flight", special: "Vegetarian"
        };
        await trackTripRequest(form, [{ id: "Goa", match: 98, reasons: [] }]);

        expect(calls[0].url).toBe("/api/trip-requests");
        const sent = calls[0].body;
        expect(sent.userId).toBe(7);
        expect(sent.request).not.toHaveProperty("name");
        expect(sent.request).not.toHaveProperty("phone");
        expect(sent.request).not.toHaveProperty("email");
        expect(sent.request).toMatchObject({
            city: "Ahmedabad", destination: "Goa", travelers: "5 People", budget: "50000",
            budgetType: "group", accommodation: "5 Star Hotel", transport: "Flight", special: "Vegetarian"
        });
        expect(sent.results).toHaveLength(1);
        expect(JSON.stringify(sent)).not.toContain("9876543210");
    });

    it("remembers the request id and clears an old one when saving fails", async () => {
        reply = { status: 201, body: { id: 42 } };
        await trackTripRequest({ travelers: "2 People", budget: "1000" }, []);
        expect(getTripRequestId()).toBe(42);

        reply = { status: 400, body: { error: "Please choose a trip budget." } };
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        await trackTripRequest({ travelers: "2 People", budget: "" }, []);
        expect(getTripRequestId()).toBeNull();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("sends the whole payment so the server can create or update it", async () => {
        const payment = {
            paymentRef: "TS-20261026-ABCD", destinationId: "Goa", travelers: 5, days: 4, amount: 89650,
            accommodation: "5 Star Hotel", transport: "Flight", tripRequestId: 42,
            userPaidClicked: true, userDebitConfirmed: true, utr: "123456789012", status: "Incomplete"
        };
        await trackPayment(payment);
        expect(calls[0].url).toBe("/api/payments/sync");
        expect(calls[0].body).toEqual({ userId: 7, payment });
    });

    it("never throws when the server is down", async () => {
        vi.stubGlobal("fetch", () => Promise.reject(new Error("down")));
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        await expect(trackActivity("trip_viewed")).resolves.toMatchObject({ ok: false });
        warn.mockRestore();
    });

    it("forgets the request id when the user logs out", async () => {
        reply = { status: 201, body: { id: 42 } };
        await trackTripRequest({ travelers: "2 People", budget: "1000" }, []);
        clearUser();
        expect(getTripRequestId()).toBeNull();
    });
});

describe("contact messages", () => {
    it("are recorded for guests without a user id", async () => {
        await trackContact({ name: "Guest", email: "g@test.com", message: "Hello there" });
        expect(calls[0]).toEqual({
            url: "/api/contact",
            body: { userId: null, name: "Guest", email: "g@test.com", message: "Hello there" }
        });
    });

    it("include the user id when logged in", async () => {
        setUser({ id: 7, name: "A", email: "a@test.com", phone: "9876543210" });
        await trackContact({ name: "A", email: "a@test.com", message: "Hello there" });
        expect(calls[0].body.userId).toBe(7);
    });
});