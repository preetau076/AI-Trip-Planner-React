import { Link, useNavigate } from "react-router-dom";
import { useSavedTrips, useTripRequests, useUser } from "../hooks/useStorage";
import { useToast } from "../context/toastContext";
import PageBanner from "../components/PageBanner";
import { destinations, getDestination } from "../data/destinations";
import { formatINR } from "../utils/budget";
import { openStoredRequest } from "../utils/storage";
import { todayISO } from "../utils/validation";
import PaymentsList from "../components/PaymentsList";
import "../css/common.css";
import "../css/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const user = useUser();
    const { saved, remove } = useSavedTrips();
    const requests = useTripRequests();

    const name =
        user?.name || (user?.email ? user.email.split("@")[0] : "Traveler");

    const savedTrips = saved.map(getDestination).filter(Boolean);

    const upcoming = requests
        .filter((r) => r.travelDate && r.travelDate >= todayISO())
        .sort((a, b) => a.travelDate.localeCompare(b.travelDate));
    const nextTrip = upcoming[0];

    const latestResults = requests[0]?.results || [];
    const recommended = (
        latestResults.length
            ? latestResults.map((r) => getDestination(r.id)).filter(Boolean)
            : destinations.slice(0, 3)
    ).slice(0, 3);

    const reopen = (entry) => {
        openStoredRequest(entry);
        navigate("/results");
    };

    const handleRemove = (trip) => {
        remove(trip.id);
        showToast(trip.title + " removed from saved trips.");
    };

    return (
        <>
            <PageBanner title="My Dashboard" subtitle="Manage your trips and preferences." />

            <div className="dashboard">
                <div className="dashboard-welcome">
                    <h1>Hello, <span>{name}</span> 👋</h1>
                    <p>Welcome back to your TripSuggest dashboard.</p>
                </div>
                    {user && (
                    <>
                        <p style={{ margin: "20px 0 8px", opacity: 0.7, fontSize: "0.9rem" }}>
                            My Account (set when you signed up, cannot be changed here)
                        </p>
                        <div className="dashboard-grid" style={{ marginBottom: "20px" }}>
                            <div className="dashboard-card">
                                <small>👤 Name</small>
                                <h2 style={{ fontSize: "1.15rem", wordBreak: "break-word" }}>
                                    {user.name || "—"}
                                </h2>
                            </div>
                            <div className="dashboard-card">
                                <small>📧 Email</small>
                                <h2 style={{ fontSize: "1.15rem", wordBreak: "break-word" }}>
                                    {user.email}
                                </h2>
                            </div>
                            <div className="dashboard-card">
                                <small>📞 Mobile</small>
                                <h2 style={{ fontSize: "1.15rem", wordBreak: "break-word" }}>
                                    {user.phone || "—"}
                                </h2>
                            </div>
                        </div>
                    </>
                )}
                <PaymentsList />
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <small>Saved Trips</small>
                        <h2>{savedTrips.length}</h2>
                    </div>
                    <div className="dashboard-card">
                        <small>Trips Planned</small>
                        <h2>{requests.length}</h2>
                    </div>
                    <div className="dashboard-card">
                        <small>Upcoming Trips</small>
                        <h2>{upcoming.length}</h2>
                    </div>
                </div>

                {/* UPCOMING */}
                <div className="dashboard-section">
                    <h2>📅 Upcoming Trip</h2>
                    {nextTrip ? (
                        <div className="trip-list-item">
                            <div>
                                <strong>
                                    {new Date(nextTrip.travelDate + "T00:00:00").toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric"
                                    })}
                                </strong>
                                <br />
                                <small>
                                    {[nextTrip.travelers, nextTrip.duration, nextTrip.city && "from " + nextTrip.city]
                                        .filter(Boolean).join(" • ") || "Trip request"}
                                </small>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ padding: "8px 12px", fontSize: "11px" }}
                                onClick={() => reopen(nextTrip)}
                            >
                                View Suggestions
                            </button>
                        </div>
                    ) : (
                        <p className="dashboard-empty">
                            No upcoming trips yet. Pick a travel date when you{" "}
                            <Link to="/trip-planner" style={{ color: "var(--teal)", fontWeight: 700 }}>plan a trip</Link>.
                        </p>
                    )}
                </div>

                {/* RECOMMENDED */}
                <div className="dashboard-section">
                    <h2>✨ Recommended For You</h2>
                    <div className="trip-list">
                        {recommended.map((trip) => (
                            <div className="trip-list-item" key={trip.id}>
                                <div>
                                    <strong>{trip.title}</strong><br />
                                    <small>{trip.days} Days • {formatINR(trip.price)}</small>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: "8px 12px", fontSize: "11px" }}
                                    onClick={() => navigate(`/trip-details?dest=${encodeURIComponent(trip.id)}`)}
                                >
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SAVED */}
                <div className="dashboard-section">
                    <h2>❤️ Saved Trips</h2>
                    <div className="trip-list">
                        {savedTrips.length === 0 ? (
                            <p className="dashboard-empty">You haven't saved any trips yet.</p>
                        ) : (
                            savedTrips.map((trip) => (
                                <div className="trip-list-item" key={trip.id}>
                                    <div>
                                        <strong>{trip.title}</strong><br />
                                        <small>{trip.days} Days • {formatINR(trip.price)}</small>
                                    </div>
                                    <div className="trip-list-actions">
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: "8px 12px", fontSize: "11px" }}
                                            onClick={() => navigate(`/trip-details?dest=${encodeURIComponent(trip.id)}`)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="save-btn"
                                            style={{ border: "1px solid var(--border)", background: "white", borderRadius: "8px", padding: "8px 12px", fontSize: "11px" }}
                                            onClick={() => handleRemove(trip)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
