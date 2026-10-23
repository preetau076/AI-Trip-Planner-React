import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";

import "../css/common.css";
import "../css/about.css";

function About() {
    const navigate = useNavigate();

    return (
        <>
            <PageBanner title="About TripSuggest" subtitle="Travel planning made personal." />

            <section className="section">
                <div className="about-grid">
                    <div className="about-image"></div>

                    <div className="about-text">
                        <h2>Travel should feel personal.</h2>

                        <p>
                            TripSuggest is designed to help travelers discover
                            destinations based on their individual preferences,
                            budget, travel style and interests.
                        </p>

                        <p>
                            Instead of searching through hundreds of
                            destinations, users can simply tell us what kind
                            of experience they want and receive personalized
                            suggestions.
                        </p>

                        <p>
                            Our goal is simple:{" "}
                            <strong>Discover places. Create memories. Travel better.</strong>
                        </p>

                        <button className="btn btn-primary" onClick={() => navigate("/trip-planner")}>
                            Start Planning
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default About;
