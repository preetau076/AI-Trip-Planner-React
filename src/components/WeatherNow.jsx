import { useEffect, useState } from "react";
import { getWeather } from "../utils/weather";

/* Shows the current weather for a destination. Use key={destination.id} so it
   starts fresh when the destination changes. */
function WeatherNow({ coordinates, place }) {
    const [state, setState] = useState({ status: "loading", data: null });

    useEffect(() => {
        let cancelled = false;
        getWeather(coordinates).then((data) => {
            if (cancelled) return;
            setState(data ? { status: "ready", data } : { status: "error", data: null });
        });
        return () => {
            cancelled = true;
        };
    }, [coordinates]);

    const style = { fontSize: "13px", marginTop: "6px" };

    if (state.status === "loading") {
        return <p style={style}>🌡️ Checking current weather…</p>;
    }
    if (state.status === "error") {
        return <p style={style}>🌡️ Live weather isn't available right now.</p>;
    }

    const w = state.data;
    const details = [
        w.wind !== null && `Wind ${w.wind} km/h`,
        w.humidity !== null && `Humidity ${w.humidity}%`
    ].filter(Boolean);

    return (
        <p style={style}>
            {w.icon} Now in {place}: <strong>{w.temperature}°C</strong>, {w.condition}
            {details.length > 0 && ` · ${details.join(" · ")}`}
            <br />
            <small>
                Weather data by{" "}
                <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                    Open-Meteo.com
                </a>
            </small>
        </p>
    );
}

export default WeatherNow;