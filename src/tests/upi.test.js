import { describe, expect, it } from "vitest";
import { buildUpiLink, isValidUpiId } from "../utils/upi";

describe("isValidUpiId", () => {
    it("accepts normal UPI IDs", () => {
        expect(isValidUpiId("name@okaxis")).toBe(true);
        expect(isValidUpiId("first.last-1@ybl")).toBe(true);
    });

    it("rejects wrong shapes", () => {
        expect(isValidUpiId("")).toBe(false);
        expect(isValidUpiId("name")).toBe(false);
        expect(isValidUpiId("a@b")).toBe(false);
        expect(isValidUpiId("na me@bank")).toBe(false);
    });
});

describe("buildUpiLink", () => {
    it("builds the link the QR code contains", () => {
        const link = buildUpiLink({
            upiId: "test.user@okaxis",
            name: "Test User",
            amount: 19360,
            note: "TripSuggest TS-20261017-ABCD"
        });
        expect(link).toBe(
            "upi://pay?pa=test.user@okaxis&pn=Test%20User&am=19360.00&cu=INR&tn=TripSuggest%20TS-20261017-ABCD"
        );
    });
});