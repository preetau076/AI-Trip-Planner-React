import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginAccount, logoutAccount, registerAccount, verifySession } from "../utils/auth";
import { getUser, setUser } from "../utils/storage";

let calls;
let reply;

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    calls = [];
    reply = { status: 200, body: { user: { id: 3, name: "Asha", email: "asha@test.com", phone: "9876543210" } } };
    vi.stubGlobal("fetch", async (url, options) => {
        calls.push({ url, method: options?.method, body: options?.body ? JSON.parse(options.body) : null });
        if (reply.reject) throw new Error("down");
        return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
    });
});
afterEach(() => vi.unstubAllGlobals());

describe("sign up and login", () => {
    it("remember only the safe user details", async () => {
        const r = await loginAccount("asha@test.com", "Abcdef1@");
        expect(r).toEqual({ ok: true });
        expect(getUser()).toEqual({ id: 3, name: "Asha", email: "asha@test.com", phone: "9876543210" });
        expect(JSON.stringify(getUser())).not.toMatch(/pass|hash|token/i);
    });

    it("show the server's message when it says no", async () => {
        reply = { status: 429, body: { error: "Too many failed attempts. Please try again in 15 minutes." } };
        const r = await loginAccount("asha@test.com", "Wrong1234@");
        expect(r).toEqual({ ok: false, error: "Too many failed attempts. Please try again in 15 minutes." });
        expect(getUser()).toBeNull();
    });

    it("send the sign up details to /api/signup", async () => {
        await registerAccount({ name: "Asha", email: "asha@test.com", phone: "9876543210", password: "Abcdef1@" });
        expect(calls[0]).toMatchObject({ url: "/api/signup", method: "POST" });
    });
});

describe("logout", () => {
    it("tells the server to end the session", async () => {
        await logoutAccount();
        expect(calls[0]).toMatchObject({ url: "/api/logout", method: "POST" });
    });
});

describe("verifySession", () => {
    const loggedIn = () => setUser({ id: 3, name: "Asha", email: "asha@test.com", phone: "9876543210" });

    it("does nothing when nobody is logged in", async () => {
        await verifySession();
        expect(calls).toHaveLength(0);
    });

    it("keeps the user when the server says the session is valid", async () => {
        loggedIn();
        await verifySession();
        expect(calls[0].url).toBe("/api/me");
        expect(getUser()).not.toBeNull();
    });

    it("logs the user out when the server says 401", async () => {
        loggedIn();
        reply = { status: 401, body: { error: "Please log in again." } };
        await verifySession();
        expect(getUser()).toBeNull();
    });

    it("keeps the user when the server is down or has an error", async () => {
        loggedIn();
        reply = { reject: true };
        await verifySession();
        expect(getUser()).not.toBeNull();

        reply = { status: 500, body: { error: "Something went wrong on the server." } };
        await verifySession();
        expect(getUser()).not.toBeNull();
    });
});