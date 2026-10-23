import { useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { useSavedTrips, useUser } from "../hooks/useStorage";
import { useToast } from "../context/toastContext";
import { DEFAULT_DESTINATION_ID, getDestination } from "../data/destinations";
import { estimateBudget, formatINR, parseDuration, parseTravelers } from "../utils/budget";
import { buildItinerary } from "../utils/itinerary";
import { findOrCreatePayment, getCurrentRequest } from "../utils/storage";
import WeatherNow from "../components/WeatherNow";
import "../css/common.css";
import "../css/trip-details.css";
import { withFallback } from "../utils/image";

function TripDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const { showToast } = useToast();
    const { isSaved, toggle } = useSavedTrips();
    const user = useUser();

    const id = params.get("dest") || DEFAULT_DESTINATION_ID;
    const trip = getDestination(id);

    useEffect(() => {
        document.title = trip ? "TripSuggest | " + trip.title : "TripSuggest | Trip Not Found";
    }, [trip]);

    if (!trip) {
        return (
            <>
                <PageBanner title="Trip Details" subtitle="Explore your recommended itinerary." />
                <div className="details-container" style={{ textAlign: "center" }}>
                    <h2 style={{ color: "var(--navy)", marginBottom: "10px" }}>Destination not found</h2>
                    <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                        We couldn't find “{id}”. Please pick one of our destinations.
                    </p>
                    <Link className="btn btn-primary" to="/destinations">Explore Destinations</Link>
                </div>
            </>
        );
    }

    // Use the planner answers only when we arrived from the Results page.
    const request = location.state?.fromPlanner ? getCurrentRequest() : null;
    const travelers = request ? parseTravelers(request.travelers) : undefined;
    const days = request ? parseDuration(request.duration) : undefined;
        const chosen = (value) => value && value !== "No Preference";
    const choices = request
        ? [
              request.city?.trim() && `Travelling from ${request.city.trim()}`,
              chosen(request.accommodation) && `Stay: ${request.accommodation}`,
              chosen(request.transport) && `Travel by: ${request.transport}`
          ].filter(Boolean)
        : [];
    const notes = request?.special?.trim() || "";

        const budget = estimateBudget(trip.id, {
        travelers,
        days,
        accommodation: request?.accommodation,
        transport: request?.transport
    });
    const itinerary = buildItinerary(trip, budget.days);
    const saved = isSaved(trip.id);
    
    const handlePay = () => {
    if (!user) {
        navigate("/login", { state: { from: location.pathname + location.search } });
        return;
    }
    const payment = findOrCreatePayment({
        destinationId: trip.id,
        travelers: budget.people,
        days: budget.days,
        amount: Math.round(budget.total)
    });
    if (!payment) {
        showToast("Could not start the payment. Please try again.");
        return;
    }
    navigate(`/payment?ref=${encodeURIComponent(payment.paymentRef)}`);
    };

    const handleSave = () => {
        const nowSaved = toggle(trip.id);
        showToast(
            nowSaved
                ? trip.title + " saved to your dashboard ❤️"
                : trip.title + " removed from saved trips."
        );
    };

    return (
        <>
            <PageBanner title="Trip Details" subtitle="Explore your recommended itinerary." />

            <div className="details-container">
                <div className="trip-detail-header">
                    <div
                        className="trip-detail-image"
                        style={{ backgroundImage: withFallback(trip.image) }}
                    ></div>

                    <div className="trip-detail-info">
                        <h1>{trip.title}</h1>
                        <p>{trip.description}</p>
                        <p style={{ fontSize: "13px", marginTop: "8px" }}>
                            📍 Best time to visit: <strong>{trip.bestTime}</strong>
                        </p>
                        <WeatherNow key={trip.id} coordinates={trip.coordinates} place={trip.name} />

                        <div className="detail-stats">
                            <div className="stat">
                                <small>Duration</small>
                                <strong>{budget.days} Days</strong>
                            </div>
                            <div className="stat">
                                <small>Travelers</small>
                                <strong>{budget.people} {budget.people === 1 ? "Person" : "People"}</strong>
                            </div>
                            <div className="stat">
                                <small>Estimated Cost</small>
                                <strong>{formatINR(budget.total)}</strong>
                            </div>
                            <div className="stat">
                                <small>Best For</small>
                                <strong>{trip.type}</strong>
                            </div>
                        </div>
                        
                        <div className="detail-actions">
                            <button className="btn btn-primary" onClick={handleSave}>
                                {saved ? "❤️ Saved — Remove" : "🤍 Save Trip"}
                            </button>

                            {/* NEW (Edit D): the payment button */}
                            <button className="btn btn-primary" onClick={handlePay}>
                                💳 Proceed to Payment
                            </button>

                            <button className="btn btn-orange" onClick={() => navigate("/contact")}>
                                Contact Us
                            </button>

                            <button
                                className="btn"
                                style={{ background: "#EEF3F7", color: "#243B53" }}
                                onClick={() => navigate("/trip-planner")}
                            >
                                Modify Trip
                            </button>
                        </div>
                    </div>
                </div>

                {/* ITINERARY */}
                <div className="itinerary">
                    <h2>📅 Sample Itinerary</h2>

                    {itinerary.map((day, index) => (
                        <div className="day" key={index}>
                            <h3>Day {index + 1} — {day.title}</h3>
                            <p>{day.plan}</p>
                        </div>
                    ))}
                </div>

                {/* BUDGET */}
                <div className="budget-section">
                    <h2>💰 Estimated Budget</h2>

                    <div className="budget-card">
                        {budget.lines.map((line) => (
                            <div className="budget-row" key={line.key}>
                                <span>{line.label}</span>
                                <strong>{formatINR(line.amount)}</strong>
                            </div>
                        ))}
                        <div className="budget-row total">
                            <span>Total estimated cost</span>
                            <strong>{formatINR(budget.total)}</strong>
                        </div>
                    </div>

                    <p className="budget-note">
                        Indicative estimate for {budget.people} {budget.people === 1 ? "traveler" : "travelers"} for {budget.days} days,
                        based on the package price. Actual prices will vary.
                    </p>
                                        {(choices.length > 0 || notes) && (
                        <p className="budget-note">
                            {choices.join(" • ")}
                            {choices.length > 0 && notes ? " — " : ""}
                            {notes && `Your notes: ${notes}`}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

export default TripDetails;
