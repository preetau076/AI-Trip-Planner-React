import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
    STORAGE_EVENT,
    getPayments,          // NEW (Edit A)
    getSavedTrips,
    getTripRequests,
    getUser,
    toggleSavedTrip,
    removeSavedTrip
} from "../utils/storage";

function subscribe(callback) {
    window.addEventListener(STORAGE_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(STORAGE_EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

/* useSyncExternalStore needs a stable snapshot, so we compare serialised strings. */
const savedSnapshot = () => JSON.stringify(getSavedTrips());
const userSnapshot = () => JSON.stringify(getUser());
const requestsSnapshot = () => JSON.stringify(getTripRequests());
const paymentsSnapshot = () => JSON.stringify(getPayments());   // NEW (Edit B)

export function useSavedTrips() {
    const raw = useSyncExternalStore(subscribe, savedSnapshot, () => "[]");
    const saved = useMemo(() => JSON.parse(raw), [raw]);

    const isSaved = useCallback((id) => saved.includes(id), [saved]);
    return { saved, isSaved, toggle: toggleSavedTrip, remove: removeSavedTrip };
}

export function useUser() {
    const raw = useSyncExternalStore(subscribe, userSnapshot, () => "null");
    return useMemo(() => JSON.parse(raw), [raw]);
}

export function useTripRequests() {
    const raw = useSyncExternalStore(subscribe, requestsSnapshot, () => "[]");
    return useMemo(() => JSON.parse(raw), [raw]);
}

// NEW (Edit C): this whole function at the bottom of the file
export function usePayments() {
    const raw = useSyncExternalStore(subscribe, paymentsSnapshot, () => "[]");
    return useMemo(() => JSON.parse(raw), [raw]);
}
