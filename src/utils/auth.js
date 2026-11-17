/*
  Sign up, login and logout talk to the Node.js server, which stores the account
  in the PostgreSQL `users` table (the password is hashed there) and keeps the
  login session in a cookie that JavaScript cannot read.
  The website keeps only { id, name, email, phone } so it can show who is logged in.
*/
import { api } from "./api";
import { clearUser, getUser, setUser } from "./storage";

export async function registerAccount({ name, email, phone, password }) {
    const result = await api("/signup", { method: "POST", body: { name, email, phone, password } });
    if (!result.ok) return { ok: false, error: result.error };

    setUser(result.data.user);
    return { ok: true };
}

export async function loginAccount(email, password) {
    const result = await api("/login", { method: "POST", body: { email, password } });
    if (!result.ok) return { ok: false, error: result.error };

    setUser(result.data.user);
    return { ok: true };
}

/** Ends the login session on the server. (The caller also clears the saved user.) */
export const logoutAccount = () => api("/logout", { method: "POST" });

/*
  Asks the server whether the saved login is still valid, for example after the
  session expired. The user is logged out here ONLY when the server answers 401,
  so a stopped server or a bad connection never logs anyone out.
*/
export async function verifySession() {
    if (!getUser()) return;

    const result = await api("/me");
    if (result.status === 401) clearUser();
}
