import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dateLimits, emailPattern, passwordPattern, phonePattern, todayISO } from "../utils/validation";

describe("form patterns", () => {
    it("accepts and rejects emails", () => {
        expect(emailPattern.test("a@b.com")).toBe(true);
        expect(emailPattern.test("abc")).toBe(false);
        expect(emailPattern.test("a@b")).toBe(false);
    });

    it("accepts Indian mobile numbers, with or without +91", () => {
        expect(phonePattern.test("9876543210")).toBe(true);
        expect(phonePattern.test("+91 9876543210")).toBe(true);
        expect(phonePattern.test("1234567890")).toBe(false);
        expect(phonePattern.test("98765")).toBe(false);
    });

    it("needs a strong password", () => {
        expect(passwordPattern.test("Abcdef1@")).toBe(true);
        expect(passwordPattern.test("abcdefgh")).toBe(false);
        expect(passwordPattern.test("Abc1@")).toBe(false);
    });
});

describe("travel date limits", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it("allows today up to 6 months ahead", () => {
        vi.setSystemTime(new Date(2026, 9, 17, 12, 0));
        expect(dateLimits()).toEqual({ min: "2026-10-17", max: "2027-04-17", label: "6 months" });
    });

    it("uses the last day of a shorter month", () => {
        vi.setSystemTime(new Date(2026, 7, 31, 12, 0));
        expect(dateLimits().max).toBe("2027-02-28");
    });

    it("uses the local date, not the UTC date", () => {
        vi.stubEnv("TZ", "Asia/Kolkata");
        vi.setSystemTime(new Date(2026, 9, 17, 2, 0)); // 02:00 local = 16 Oct in UTC
        expect(todayISO()).toBe("2026-10-17");
    });
});