import { formatINR } from "../utils/budget";
import { useNavigate } from "react-router-dom";
import { withFallback } from "../utils/image";

/* Same markup/classes as the original destination cards (Home + Destinations pages). */
function DestinationCard({ destination, description, showButton = false }) {
    const navigate = useNavigate();
    const open = () => navigate(`/trip-details?dest=${encodeURIComponent(destination.id)}`);

    return (
        <div
            className="destination-card"
            style={showButton ? undefined : { cursor: "pointer" }}
            onClick={showButton ? undefined : open}
        >
            <div
                className="destination-image"
                style={{ backgroundImage: withFallback(destination.image.replace("w=1200", "w=700")) }}
            ></div>

            <div className="destination-content">
                <h3>{destination.name}</h3>
                <p>{description}</p>

                <div className="destination-meta">
                    <span>{destination.typeLabel}</span>
                    <span
                        className="destination-price"
                        title={`Package price for 2 travelers, ${destination.days} days`}
                    >
                        {formatINR(destination.price)}
                    </span>
                </div>

                {showButton && (
                    <button
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "15px" }}
                        onClick={open}
                    >
                        View Trip
                    </button>
                )}
            </div>
        </div>
    );
}

export default DestinationCard;
