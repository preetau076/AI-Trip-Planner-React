import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../components/ErrorBoundary";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Crash() {
    throw new Error("test crash");
}

let container;
let root;

beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(console, "error").mockImplementation(() => {}); // React logs the crash; keep the output clean
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
    it("shows the page normally when nothing goes wrong", () => {
        act(() => root.render(<ErrorBoundary><p>All good</p></ErrorBoundary>));
        expect(container.textContent).toContain("All good");
        expect(container.querySelector("[role=alert]")).toBeNull();
    });

    it("shows a friendly screen instead of a blank page when a page crashes", () => {
        act(() => root.render(<ErrorBoundary><Crash /></ErrorBoundary>));
        const alert = container.querySelector("[role=alert]");
        expect(alert).not.toBeNull();
        expect(alert.textContent).toContain("Something went wrong");
        expect(container.querySelector("a[href='/']")).not.toBeNull();
    });
});