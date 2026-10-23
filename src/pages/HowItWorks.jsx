import PageBanner from "../components/PageBanner";

import "../css/common.css";
import "../css/how-it-works.css";

function HowItWorks() {
    return (
        <>
            <PageBanner
                title="How TripSuggest Works"
                subtitle="Personalized travel planning made simple."
            />

            <section className="section">
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Enter Your Details</h3>
                        <p>Tell us about yourself and who you're traveling with.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Choose Preferences</h3>
                        <p>Select budget, trip type, activities and accommodation.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Get Recommendations</h3>
                        <p>TripSuggest matches your preferences with destinations.</p>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <h3>Explore Your Itinerary</h3>
                        <p>View suggested destinations, activities and estimated costs.</p>
                    </div>
                </div>
            </section>
        </>
    );
}

export default HowItWorks;
