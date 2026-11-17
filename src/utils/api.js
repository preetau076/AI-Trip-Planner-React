/*
  Small helper for talking to the Node.js server (everything under /api).
  It never throws: it always returns { ok, status, data } or { ok: false, status, error }.
*/
export async function api(path, { method = "GET", body } = {}) {
    let response;
    try {
        response = await fetch(`/api${path}`, {
            method,
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        return { ok: false, status: 0, error: "Can't reach the server. Please try again." };
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        /* the reply was not JSON */
    }

    if (response.ok) return { ok: true, status: response.status, data };
    return { ok: false, status: response.status, error: data?.error || "Something went wrong. Please try again." };
}