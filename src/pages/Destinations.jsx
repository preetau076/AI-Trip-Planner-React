import { useMemo, useState } from "react";
import DestinationCard from "../components/DestinationCard";
import DestinationMap from "../components/DestinationMap";
import PageBanner from "../components/PageBanner";
import { destinations, destinationTypes } from "../data/destinations";

import "../css/common.css";
import "../css/destinations.css";

const BUDGETS = [
    { value: "all", label: "Any budget", test: () => true },
    { value: "low", label: "Under ₹25,000", test: (p) => p < 25000 },
    { value: "mid", label: "₹25,000 – ₹40,000", test: (p) => p >= 25000 && p <= 40000 },
    { value: "high", label: "Above ₹40,000", test: (p) => p > 40000 }
];

function Destinations() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("All");
    const [budget, setBudget] = useState("all");

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        const budgetRule = BUDGETS.find((b) => b.value === budget);

        return destinations.filter((d) => {
            const matchesSearch =
                !q ||
                d.name.toLowerCase().includes(q) ||
                d.blurb.toLowerCase().includes(q) ||
                d.tags.some((tag) => tag.toLowerCase().includes(q));
            const matchesType = type === "All" || d.tags.includes(type);
            return matchesSearch && matchesType && budgetRule.test(d.price);
        });
    }, [search, type, budget]);

    const clear = () => {
        setSearch("");
        setType("All");
        setBudget("all");
    };

    return (
        <>
            <PageBanner
                title="Explore Destinations"
                subtitle="Find destinations for every type of traveler."
            />

            <section className="section">
                <div className="filter-bar">
                    <input
                        type="search"
                        placeholder="Search destinations, e.g. Goa or beach"
                        aria-label="Search destinations"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        aria-label="Filter by budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    >
                        {BUDGETS.map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>

                    <div className="filter-chips">
                        {["All", ...destinationTypes].map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={type === t ? "active" : ""}
                                onClick={() => setType(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {visible.length === 0 ? (
                    <div className="empty-message">
                        <p>No destinations match your search.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: "15px" }}
                            onClick={clear}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="destination-grid">
                        {visible.map((destination) => (
                            <DestinationCard
                                key={destination.id}
                                destination={destination}
                                description={destination.blurb}
                                showButton
                            />
                        ))}
                    </div>
                )}
            </section>

            <DestinationMap destinations={destinations} />
        </>
    );
}

export default Destinations;
