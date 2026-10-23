import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { useSavedTrips } from "../hooks/useStorage";
import { useToast } from "../context/toastContext";
import { destinations, getDestination } from "../data/destinations";
import { hasDestinationMatch } from "../utils/recommend";
import { estimateBudget, formatINR, parseDuration, parseTravelers } from "../utils/budget";
import { getCurrentRequest, getCurrentResults } from "../utils/storage";
import { withFallback } from "../utils/image";
import "../css/common.css";
import "../css/results.css";

function Results() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isSaved, toggle } = useSavedTrips();

    const { request, items } = useMemo(() => {
        const req = getCurrentRequest();
        const stored = getCurrentResults();
        const rows = (stored || [])
            .map((r) => ({ ...r, destination: getDestination(r.id) }))
            .filter((r) => r.destination);
        return { request: req, items: rows };
    }, []);

    const travelers = request ? parseTravelers(request.travelers) : undefined;
    const days = request ? parseDuration(request.duration) : undefined;
        const chosen = (value) => value && value !== "No Preference";
        const summary = request
        ? [
              request.city?.trim() && `From ${request.city.trim()}`,
              chosen(request.accommodation) && `Stay: ${request.accommodation}`,
              chosen(request.transport) && `Travel by: ${request.transport}`
          ].filter(Boolean).join(" • ")
        : "";

    const handleSave = (destination) => {
        const nowSaved = toggle(destination.id);
        showToast(
            nowSaved
                ? destination.title + " saved to your dashboard ❤️"
                : destination.title + " removed from saved trips."
        );
    };

    const message = items.length
        ? `${items.length} destination${items.length === 1 ? " was" : "s were"} selected based on your preferences.`
        : "No results found. Please go back and fill in the trip planner.";
    const typedName = request?.destination?.trim() || "";
    const destinationMissing = typedName && !hasDestinationMatch(typedName);

    return (
        <>
            <PageBanner
                title="Your Trip Suggestions"
                subtitle="We found destinations that match your preferences."
            />

            <div className="results-container">
                <div className="result-heading">
                    <h2>✨ Recommended For You</h2>
                    <p>{message}</p>
                        {destinationMissing && (
                        <p
                            style={{
                                background: "#FFF4E5",
                                color: "#8A4B00",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                margin: "10px 0"
                            }}
                        >
                            We don't have "{typedName}" yet, so we're showing other trips that match
                            your preferences. Available destinations:{" "}
                            {destinations.map((d) => d.name).join(", ")}.
                        </p>
                    )}
                    {summary && <p>{summary}</p>}
                    <div className="result-actions">
                        <Link
                            className="btn btn-primary"
                            style={{ padding: "8px 14px", fontSize: "12px" }}
                            to="/trip-planner"
                        >
                            {items.length ? "Modify Trip" : "Plan My Trip"}
                        </Link>
                    </div>
                </div>

                <div className="result-grid">
                    {items.map(({ id, match, reasons, destination }) => {
                            const budget = estimateBudget(id, {
                            travelers,
                            days,
                            accommodation: request?.accommodation,
                            transport: request?.transport
                        });
                        return (
                            <div className="result-card" key={id}>
                                <div
                                    className="result-image"
                                    style={{ backgroundImage: withFallback(destination.image) }}
                                >
                                    <div className="match">{match}% Match</div>
                                </div>

                                <div className="result-body">
                                    <h3>{destination.title}</h3>
                                    <p>{destination.description}</p>

                                    <div className="result-tags">
                                        <span>{destination.type}</span>
                                        <span>{budget.days} Days</span>
                                        <span>Personalized</span>
                                        {reasons.slice(0, 2).map((reason) => (
                                            <span key={reason}>{reason}</span>
                                        ))}
                                    </div>

                                    <div className="result-bottom">
                                        <div className="result-price">{formatINR(budget.total)}</div>

                                        <div>
                                            <button className="save-btn" onClick={() => handleSave(destination)}>
                                                {isSaved(id) ? "❤️ Saved" : "🤍 Save"}
                                            </button>{" "}
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: "8px 10px", fontSize: "11px" }}
                                                onClick={() =>
                                                    navigate(`/trip-details?dest=${encodeURIComponent(id)}`, {
                                                        state: { fromPlanner: true }
                                                    })
                                                }
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default Results;
