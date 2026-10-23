import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite does not resolve Leaflet's default marker images on its own, and Leaflet's
// automatic icon-path detection would put a wrong folder in front of them.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow
});

/* Same Leaflet + OpenStreetMap setup as the original site (no API key). */
function DestinationMap({ destinations }) {
    const navigate = useNavigate();
    const elementRef = useRef(null);

    useEffect(() => {
        if (!elementRef.current) return undefined;

        const map = L.map(elementRef.current).setView([23.5937, 78.9629], 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        destinations.forEach((dest) => {
            const { lat, lng } = dest.coordinates;
            const googleMapsUrl =
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(lat + "," + lng);

            const box = document.createElement("div");
            box.style.minWidth = "190px";

            const title = document.createElement("strong");
            title.style.fontSize = "16px";
            title.textContent = dest.mapName;

            const text = document.createElement("p");
            text.style.cssText = "margin:6px 0 10px;color:#52606D;";
            text.textContent = dest.mapDescription;

            const view = document.createElement("button");
            view.textContent = "View Trip";
            view.style.cssText =
                "padding:7px 11px;background:#00A896;color:white;border:none;border-radius:6px;margin-right:6px;cursor:pointer;font:inherit;";
            view.addEventListener("click", () =>
                navigate(`/trip-details?dest=${encodeURIComponent(dest.id)}`)
            );

            const link = document.createElement("a");
            link.href = googleMapsUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open in Google Maps";
            link.style.cssText =
                "display:inline-block;padding:7px 11px;background:#2563EB;color:white;border-radius:6px;text-decoration:none;";

            box.append(title, text, view, link);
            L.marker([lat, lng]).addTo(map).bindPopup(box);
        });

        const timer = setTimeout(() => map.invalidateSize(), 300);

        return () => {
            clearTimeout(timer);
            map.remove();
        };
    }, [destinations, navigate]);

    return (
        <section className="destination-map-section">
            <div className="section-header">
                <div className="tag">Explore on Map</div>
                <h2>Find Your Destination</h2>
                <p>Explore our featured destinations with their locations pinned on Google Maps.</p>
            </div>

            <div className="destination-map-wrapper">
                <div id="destinationMap" ref={elementRef}></div>
            </div>
        </section>
    );
}

export default DestinationMap;
