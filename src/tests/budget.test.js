import { describe, expect, it } from "vitest";
import { estimateBudget, formatINR, parseDuration, parseTravelers } from "../utils/budget";

describe("formatINR", () => {
    it("uses the Indian digit grouping", () => {
        expect(formatINR(22000)).toBe("₹22,000");
        expect(formatINR(1234567)).toBe("₹12,34,567");
    });
});

describe("parseTravelers", () => {
    it("reads the number from the form value", () => {
        expect(parseTravelers("2 People")).toBe(2);
        expect(parseTravelers("5 People")).toBe(5);
        expect(parseTravelers("7+ People")).toBe(7);
    });

    it("falls back to 2 for empty or invalid values", () => {
        expect(parseTravelers("")).toBe(2);
        expect(parseTravelers("abc")).toBe(2);
        expect(parseTravelers("0 People")).toBe(2);
    });
});

describe("parseDuration", () => {
    it("uses the middle of a range", () => {
        expect(parseDuration("5 - 7 Days")).toBe(6);
    });

    it("reads a single number", () => {
        expect(parseDuration("15+ Days")).toBe(15);
    });

    it("returns null when nothing was chosen", () => {
        expect(parseDuration("")).toBeNull();
        expect(parseDuration("Select duration")).toBeNull();
    });
});

describe("estimateBudget", () => {
    it("returns the package price for 2 travelers and the default days", () => {
        const b = estimateBudget("Goa");
        expect(b.people).toBe(2);
        expect(b.days).toBe(4);
        expect(b.total).toBeCloseTo(22000, 5);
        expect(b.lines.map((l) => Math.round(l.amount))).toEqual([8800, 4400, 5500, 3300]);
    });

    it("grows in a straight line with the number of travelers", () => {
        expect(estimateBudget("Goa", { travelers: 5 }).total).toBeCloseTo(55000, 5);
    });

    it("grows with the number of days", () => {
        expect(estimateBudget("Goa", { days: 8 }).total).toBeCloseTo(44000, 5);
    });

    it("changes only the accommodation line when the hotel changes", () => {
        const five = estimateBudget("Goa", { accommodation: "5 Star Hotel" });
        expect(five.total).toBeCloseTo(32560, 5);
        expect(Math.round(five.lines[0].amount)).toBe(19360);
        expect(Math.round(five.lines[1].amount)).toBe(4400);

        expect(estimateBudget("Goa", { accommodation: "Budget Hotel" }).total).toBeCloseTo(19360, 5);
    });

    it("changes only the transport line when the travel mode changes", () => {
        expect(estimateBudget("Goa", { transport: "Flight" }).total).toBeCloseTo(25300, 5);
        expect(estimateBudget("Goa", { transport: "Bus" }).total).toBeCloseTo(19800, 5);
    });

    it("combines travelers, hotel and travel mode", () => {
        const b = estimateBudget("Goa", { travelers: 5, accommodation: "5 Star Hotel", transport: "Flight" });
        expect(b.total).toBeCloseTo(89650, 5);
    });

    it("treats empty or unknown choices as no change", () => {
        expect(estimateBudget("Goa", { accommodation: "", transport: "" }).total).toBeCloseTo(22000, 5);
        expect(estimateBudget("Goa", { accommodation: "constructor" }).total).toBeCloseTo(22000, 5);
    });

    it("returns null for an unknown destination", () => {
        expect(estimateBudget("Atlantis")).toBeNull();
    });
});