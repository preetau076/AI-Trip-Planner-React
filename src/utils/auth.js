/*
  Frontend-only account check. Passwords are salted + hashed (SHA-256) before
  being stored, but this is still NOT real security: anyone can open DevTools
  and edit localStorage. Replace both functions with API calls when a backend exists.
*/
import { getAccounts, saveAccounts, setUser } from "./storage";

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

function newSalt() {
    return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + password);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(new Uint8Array(digest));
}

export async function registerAccount({ name, email, phone, password }) {
    try {
        const key = email.trim().toLowerCase();
        const accounts = getAccounts();

        if (accounts.some((a) => a.email === key)) {
            return { ok: false, error: "An account with this email already exists. Please login." };
        }

        const salt = newSalt();
        const passwordHash = await hashPassword(password, salt);
        const saved = saveAccounts([
            ...accounts,
            { name: name.trim(), email: key, phone: phone.trim(), salt, passwordHash }
        ]);
        if (!saved) return { ok: false, error: "Could not save the account in this browser." };

        setUser({ name: name.trim(), email: key, phone: phone.trim() });
        return { ok: true };
    } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
    }
}

export async function loginAccount(email, password) {
    try {
        const key = email.trim().toLowerCase();
        const account = getAccounts().find((a) => a.email === key);
        const invalid = { ok: false, error: "Invalid email or password." };

        if (!account) return invalid;
        if ((await hashPassword(password, account.salt)) !== account.passwordHash) return invalid;

        setUser({ name: account.name, email: account.email, phone: account.phone });
        return { ok: true };
    } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
    }
}