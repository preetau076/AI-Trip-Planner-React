/*
  Live weather from Open-Meteo (https://open-meteo.com): free for
  non-commercial use, no API key. Only the destination's coordinates are sent.
  Terms ask for attribution, which WeatherNow shows.

  Returns { temperature, condition, icon, wind, humidity } or null when the
  weather can't be loaded. Nothing is ever faked.
*/
const ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const CACHE_MS = 10 * 60 * 1000; // reuse a result for 10 minutes
const TIMEOUT_MS = 8000;
const cache = new Map();

// WMO weather codes used by Open-Meteo -> [text, icon]
const CONDITIONS = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Freezing fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌦️"],
    56: ["Freezing drizzle", "🌧️"],
    57: ["Heavy freezing drizzle", "🌧️"],
    61: ["Light rain", "🌧️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"],
    67: ["Heavy freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "❄️"],
    77: ["Snow grains", "❄️"],
    80: ["Light rain showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Violent rain showers", "⛈️"],
    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "🌨️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Thunderstorm with heavy hail", "⛈️"]
};

const round = (value) => (Number.isFinite(value) ? Math.round(value) : null);

export async function getWeather(coordinates) {
    const lat = Number(coordinates?.lat);
    const lng = Number(coordinates?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const key = `${lat},${lng}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < CACHE_MS) return hit.data;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const params = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lng),
            current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
            timezone: "auto"
        });
        const response = await fetch(`${ENDPOINT}?${params}`, { signal: controller.signal });
        if (!response.ok) return null;

        const current = (await response.json())?.current;
        if (!current || !Number.isFinite(current.temperature_2m)) return null;

        const [condition, icon] = CONDITIONS[current.weather_code] || ["Current conditions", "🌡️"];
        const data = {
            temperature: round(current.temperature_2m),
            condition,
            icon,
            wind: round(current.wind_speed_10m),
            humidity: round(current.relative_humidity_2m)
        };
        cache.set(key, { time: Date.now(), data });
        return data;
    } catch {
        return null; // offline, blocked or timed out
    } finally {
        clearTimeout(timer);
    }
}