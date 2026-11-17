import { beforeEach, describe, expect, it } from "vitest";
import { findOrCreatePayment, getPayments, setUser, updatePayment } from "../utils/storage";

const goa = { destinationId: "Goa", travelers: 2, days: 4, amount: 22000 };

beforeEach(() => {
    localStorage.clear();
    setUser({ id: 1, name: "A", email: "a@test.com", phone: "9876543210" });
});

describe("payment record keeps the choices the database needs", () => {
    it("stores hotel, travel mode and the planner request id", () => {
        const p = findOrCreatePayment({ ...goa, accommodation: "5 Star Hotel", transport: "Flight", tripRequestId: 42 });
        expect(p).toMatchObject({ accommodation: "5 Star Hotel", transport: "Flight", tripRequestId: 42, status: "Incomplete" });
    });

    it("uses No Preference and no request id when nothing was chosen", () => {
        const p = findOrCreatePayment(goa);
        expect(p).toMatchObject({ accommodation: "No Preference", transport: "No Preference", tripRequestId: null });
    });

    it("treats a different hotel as a different payment", () => {
        findOrCreatePayment({ ...goa, accommodation: "Resort" });
        findOrCreatePayment({ ...goa, accommodation: "Budget Hotel" });
        expect(getPayments()).toHaveLength(2);
    });

    it("reuses an unfinished payment and links it to the newest request", () => {
        const first = findOrCreatePayment({ ...goa, tripRequestId: 1 });
        const again = findOrCreatePayment({ ...goa, tripRequestId: 2 });
        expect(again.paymentRef).toBe(first.paymentRef);
        expect(getPayments()).toHaveLength(1);
        expect(getPayments()[0].tripRequestId).toBe(2);
    });

    it("starts a new payment once the user has said they paid", () => {
        const first = findOrCreatePayment(goa);
        updatePayment(first.paymentRef, { userPaidClicked: true });
        const second = findOrCreatePayment(goa);
        expect(second.paymentRef).not.toBe(first.paymentRef);
    });
});