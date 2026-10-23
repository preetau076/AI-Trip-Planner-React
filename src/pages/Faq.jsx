import { useState } from "react";
import PageBanner from "../components/PageBanner";

import "../css/common.css";
import "../css/faq.css";

const FAQS = [
    {
        q: "How does TripSuggest recommend destinations?",
        a: "TripSuggest uses information such as your budget, travel dates, interests, trip type and preferred experiences to match you with suitable destinations."
    },
    {
        q: "Is TripSuggest free?",
        a: "The frontend demonstration is free. In a production version, you can decide whether recommendations, packages or booking services are free or paid."
    },
    {
        q: "Can I change my trip after receiving suggestions?",
        a: "Yes. Users can return to the planning form and change their budget, destination, duration and preferences."
    },
    {
        q: "Does TripSuggest book flights and hotels?",
        a: "This frontend version does not perform real bookings. A future backend can integrate hotel, flight and travel booking APIs."
    },
    {
        q: "Can I save my favorite trips?",
        a: "Yes. The frontend demo uses browser localStorage to simulate saved trips."
    }
];

function Faq() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <>
            <PageBanner
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about TripSuggest."
            />

            <section className="section">
                <div className="faq-container">
                    {FAQS.map((item, index) => {
                        const open = openIndex === index;
                        return (
                            <div className={"faq" + (open ? " open" : "")} key={item.q}>
                                <div
                                    className="faq-question"
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={open}
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            setOpenIndex(open ? null : index);
                                        }
                                    }}
                                >
                                    {item.q}
                                    <span>{open ? "−" : "+"}</span>
                                </div>
                                <div className="faq-answer">{item.a}</div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

export default Faq;
