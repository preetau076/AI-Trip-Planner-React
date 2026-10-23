import { useNavigate } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import DestinationMap from "../components/DestinationMap";
import { destinations, getDestination } from "../data/destinations";
import { formatINR } from "../utils/budget";

import "../css/common.css";
import "../css/home.css";

const FEATURED = ["Goa", "Rajasthan", "Manali", "Kerala"].map(getDestination);
const HERO = getDestination("Kashmir");

function Home() {
    const navigate = useNavigate();

    return (
        <>
            {/* HERO */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">✨ Your journey starts here</div>

                        <h1>
                            Discover Your <span>Perfect Trip</span>
                        </h1>

                        <p>
                            Tell TripSuggest about your budget, interests,
                            travel dates and preferences. We'll help you
                            discover destinations and experiences that match
                            your travel dreams.
                        </p>

                        <div className="hero-buttons">
                            <button className="btn btn-primary" onClick={() => navigate("/trip-planner")}>
                                ✨ Plan My Trip
                            </button>

                            <button className="btn btn-outline" onClick={() => navigate("/destinations")}>
                                Explore Destinations
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-image">
                            <div className="hero-card">
                                <small>✨ Sample Recommendation</small>
                                <h3>{HERO.title}</h3>
                                <small>94% Match • {HERO.days} Days • {formatINR(HERO.price)}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DESTINATIONS PREVIEW */}
            <section className="section">
                <div className="section-header">
                    <div className="tag">Explore</div>
                    <h2>Popular Destinations</h2>
                    <p>Discover some of the destinations loved by travelers.</p>
                </div>

                <div className="destination-grid">
                    {FEATURED.map((destination) => (
                        <DestinationCard
                            key={destination.id}
                            destination={destination}
                            description={destination.tagline}
                        />
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section" style={{ background: "#EDF5F8" }}>
                <div className="section-header">
                    <div className="tag">Simple Process</div>
                    <h2>How TripSuggest Works</h2>
                    <p>Plan your next adventure in just a few simple steps.</p>
                </div>

                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Tell Us</h3>
                        <p>Share your destination, budget, dates and interests.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>We Analyze</h3>
                        <p>Your preferences are matched with suitable destinations.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Get Suggestions</h3>
                        <p>Receive personalized trip recommendations.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <h3>Start Traveling</h3>
                        <p>Choose your favorite trip and start planning.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div
                    style={{
                        maxWidth: "1000px",
                        margin: "auto",
                        background: "linear-gradient(135deg,#071C2C,#102A43)",
                        padding: "55px 30px",
                        textAlign: "center",
                        borderRadius: "20px",
                        color: "white"
                    }}
                >
                    <h2 style={{ fontSize: "34px", marginBottom: "10px" }}>
                        Ready to Find Your Perfect Trip?
                    </h2>

                    <p style={{ color: "#C7D4DF", marginBottom: "25px" }}>
                        Answer a few questions and let TripSuggest create
                        personalized recommendations.
                    </p>

                    <button className="btn btn-orange" onClick={() => navigate("/trip-planner")}>
                        ✨ Suggest My Trip
                    </button>
                </div>
            </section>

            {/* DESTINATION MAP */}
            <DestinationMap destinations={destinations} />
        </>
    );
}

export default Home;
