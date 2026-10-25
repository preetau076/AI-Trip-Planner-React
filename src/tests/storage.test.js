import { beforeEach, describe, expect, it } from "vitest";
import {
    findOrCreatePayment,
    getPayments,
    getSavedTrips,
    getTripRequests,
    saveTripRequest,
    setUser,
    toggleSavedTrip,
    updatePayment
} from "../utils/storage";

const goa = { destinationId: "Goa", travelers: 2, days: 4, amount: 22000 };
const userA = { name: "A", email: "a@test.com", phone: "9876543210" };
const userB = { name: "B", email: "b@test.com", phone: "9000000000" };

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe("payments", () => {
    it("needs a logged-in user", () => {
        expect(getPayments()).toEqual([]);
        expect(findOrCreatePayment(goa)).toBeNull();
    });

    it("creates an Incomplete payment with a reference", () => {
        setUser(userA);
        const p = findOrCreatePayment(goa);
        expect(p.paymentRef).toMatch(/^TS-\d{8}-[A-Z2-9]{4}$/);
        expect(p.status).toBe("Incomplete");
        expect(p.userPaidClicked).toBe(false);
        expect(p.userDebitConfirmed).toBe(false);
    });

    it("reuses an unfinished payment for the same trip", () => {
        setUser(userA);
        const first = findOrCreatePayment(goa);
        const second = findOrCreatePayment(goa);
        expect(second.paymentRef).toBe(first.paymentRef);
        expect(getPayments()).toHaveLength(1);
    });

    it("creates a new payment for a different trip", () => {
        setUser(userA);
        findOrCreatePayment(goa);
        findOrCreatePayment({ ...goa, travelers: 5, amount: 55000 });
        expect(getPayments()).toHaveLength(2);
    });

    it("never lets the website mark a payment Complete or change its amount", () => {
        setUser(userA);
        const p = findOrCreatePayment(goa);
        updatePayment(p.paymentRef, { userPaidClicked: true });
        updatePayment(p.paymentRef, { status: "Complete", amount: 1, destinationId: "Hack" });

        const saved = getPayments()[0];
        expect(saved.userPaidClicked).toBe(true);
        expect(saved.status).toBe("Incomplete");
        expect(saved.amount).toBe(22000);
        expect(saved.destinationId).toBe("Goa");
    });

    it("keeps the UTR to at most 12 characters", () => {
        setUser(userA);
        const p = findOrCreatePayment(goa);
        updatePayment(p.paymentRef, { userDebitConfirmed: true, utr: " 123456789012999 " });
        expect(getPayments()[0].utr).toBe("123456789012");
    });

    it("keeps each user's payments separate", () => {
        setUser(userA);
        findOrCreatePayment(goa);
        setUser(userB);
        expect(getPayments()).toEqual([]);
        setUser(userA);
        expect(getPayments()).toHaveLength(1);
    });
});

describe("per-user data", () => {
    it("keeps saved trips separate for each user", () => {
        setUser(userA);
        toggleSavedTrip("Goa");
        setUser(userB);
        expect(getSavedTrips()).toEqual([]);
        setUser(userA);
        expect(getSavedTrips()).toEqual(["Goa"]);
    });

    it("never stores name, phone or email in the planner history", () => {
        setUser(userA);
        saveTripRequest(
            { name: "A", phone: "9876543210", email: "a@test.com", travelers: "2 People" },
            [{ id: "Goa", match: 90, reasons: [] }]
        );

        const entry = getTripRequests()[0];
        expect(entry.travelers).toBe("2 People");
        expect(entry).not.toHaveProperty("name");
        expect(entry).not.toHaveProperty("phone");
        expect(entry).not.toHaveProperty("email");
        expect(sessionStorage.getItem("tripRequest")).not.toContain("9876543210");
    });
});