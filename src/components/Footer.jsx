import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer>
            <div className="footer-grid">
                <div className="footer-brand">
                    <h2>✈ Trip<span>Suggest</span></h2>
                    <p>Discover places. Create memories. Travel better.</p>
                </div>

                <div>
                    <h3>Explore</h3>
                    <Link to="/destinations">Destinations</Link>
                    <Link to="/packages">Packages</Link>
                    <Link to="/trip-planner">Plan My Trip</Link>
                </div>

                <div>
                    <h3>Company</h3>
                    <Link to="/about">About Us</Link>
                    <Link to="/how-it-works">How It Works</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                <div>
                    <h3>Support</h3>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/signup">Sign Up</Link>
                    <Link to="/dashboard">Dashboard</Link>
                </div>
            </div>

            <div className="copyright">© 2026 TripSuggest. All rights reserved.</div>
        </footer>
    );
}

export default Footer;
