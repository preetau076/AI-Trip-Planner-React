/* If a photo fails to load, this gradient is shown instead of an empty box. */
export const FALLBACK_GRADIENT = "linear-gradient(135deg, #0ea5e9, #6366f1)";

export const withFallback = (url) => `url("${url}"), ${FALLBACK_GRADIENT}`;