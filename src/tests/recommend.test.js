import { describe, expect, it } from "vitest";
import { hasDestinationMatch, recommendDestinations } from "../utils/recommend";

const base = { travelers: "2 People", budget: "25000", budgetType: "person" };
const ids = (list) => list.map((r) => r.id);

describe("hasDestinationMatch", () => {
    it("finds full and partial names, ignoring capitals", () => {
        expect(hasDestinationMatch("Goa")).toBe(true);
        expect(hasDestinationMatch("kash")).toBe(true);
    });

    it("is false for unknown or empty text", () => {
        expect(hasDestinationMatch("Paris")).toBe(false);
        expect(hasDestinationMatch("")).toBe(false);
    });
});

describe("recommendDestinations", () => {
    it("recommends by trip type using the destination tags", () => {
        expect(ids(recommendDestinations({ ...base, tripTypes: ["Adventure"] }))).toEqual(["Manali"]);
        expect(ids(recommendDestinations({ ...base, tripTypes: ["Nature"] })).sort()).toEqual(
            ["Kashmir", "Kerala", "Manali"]
        );
        expect(ids(recommendDestinations({ ...base, tripTypes: ["Beach"] })).sort()).toEqual(["Bali", "Goa"]);
    });

    it("returns only the typed destination", () => {
        const result = recommendDestinations({ ...base, destination: "kash" });
        expect(ids(result)).toEqual(["Kashmir"]);
        expect(result[0].reasons).toContain("Matches your destination");
    });

    it("falls back to the other preferences when the typed destination does not exist", () => {
        const result = recommendDestinations({ ...base, destination: "Paris", tripTypes: ["Beach"] });
        expect(ids(result).sort()).toEqual(["Bali", "Goa"]);
    });

    it("lets the hotel choice change the budget fit", () => {
        const cheap = recommendDestinations({
            travelers: "2 People", budget: "10000", budgetType: "person",
            destination: "Goa", accommodation: "Budget Hotel"
        })[0];
        const luxury = recommendDestinations({
            travelers: "2 People", budget: "10000", budgetType: "person",
            destination: "Goa", accommodation: "5 Star Hotel"
        })[0];

        expect(cheap.reasons).toContain("Within your budget");
        expect(luxury.reasons).not.toContain("Within your budget");
        expect(luxury.match).toBeLessThan(cheap.match);
    });

    it("gives a small bonus when the notes mention a destination tag", () => {
        const plain = recommendDestinations({ ...base, tripTypes: ["Beach"] });
        const noted = recommendDestinations({ ...base, tripTypes: ["Beach"], special: "I love food and photography" });

        const goaPlain = plain.find((r) => r.id === "Goa");
        const goaNoted = noted.find((r) => r.id === "Goa");
        expect(goaNoted.match).toBeGreaterThanOrEqual(goaPlain.match);
        expect(noted.some((r) => r.reasons.some((x) => x.startsWith("Fits your notes")))).toBe(true);
    });

    it("sorts by match and keeps every match between 40 and 98", () => {
        const result = recommendDestinations({ ...base, tripTypes: ["Nature", "Romantic"] });
        const matches = result.map((r) => r.match);
        expect(matches).toEqual([...matches].sort((a, b) => b - a));
        matches.forEach((m) => {
            expect(m).toBeGreaterThanOrEqual(40);
            expect(m).toBeLessThanOrEqual(98);
        });
    });

    it("still returns destinations when the form has almost nothing in it", () => {
        expect(recommendDestinations({}).length).toBeGreaterThan(0);
    });
});