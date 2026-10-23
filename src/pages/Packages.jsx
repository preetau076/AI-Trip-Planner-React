import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { getDestination } from "../data/destinations";
import { formatINR } from "../utils/budget";
import { withFallback } from "../utils/image";
import "../css/common.css";
import "../css/packages.css";

/*
  Only the marketing text lives here. Days, price and image are read from
  data/destinations.js so every page always shows the same numbers.
  (A destination's package price is for 2 travelers.)
*/
const packages = [
    {
        name: "Goa Weekend Escape",
        description: "Beaches, nightlife and local cuisine.",
        destination: "Goa"
    },
    {
        name: "Manali Adventure",
        description: "Mountains, snow and adventure activities.",
        destination: "Manali"
    },
    {
        name: "Kashmir Paradise",
        description: "Lakes, mountains and beautiful valleys.",
        destination: "Kashmir"
    }
].map((pkg) => {
    const dest = getDestination(pkg.destination);
    return {
        ...pkg,
        days: `${dest.days} Days`,
        people: "2 People",
        price: formatINR(dest.price),
        image: dest.image.replace("w=1200", "w=800")
    };
});

function Packages() {
    const navigate = useNavigate();

    return (
        <>
            <PageBanner
                title="Popular Packages"
                subtitle="Ready-made trips for different travel styles."
            />

            <section className="section">
                <div className="package-grid">
                    {packages.map((pkg) => (
                        <div className="package-card" key={pkg.destination}>
                            <div
                                className="package-image"
                                style={{ backgroundImage: withFallback(pkg.image) }}
                            ></div>

                            <div className="package-body">
                                <h3>{pkg.name}</h3>
                                <p>{pkg.description}</p>

                                <div className="package-details">
                                    <span>📅 {pkg.days}</span>
                                    <span>👥 {pkg.people}</span>
                                </div>

                                <div className="package-price">{pkg.price}</div>

                                <button
                                    className="btn btn-primary"
                                    style={{ width: "100%", marginTop: "15px" }}
                                    onClick={() =>
                                        navigate(`/trip-details?dest=${encodeURIComponent(pkg.destination)}`)
                                    }
                                >
                                    View Package
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default Packages;