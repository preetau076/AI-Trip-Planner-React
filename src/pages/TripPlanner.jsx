import { useUser } from "../hooks/useStorage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import { useToast } from "../context/toastContext";
import { recommendDestinations } from "../utils/recommend";
import { saveTripRequest } from "../utils/storage";
import { dateLimits, emailPattern, phonePattern, messages } from "../utils/validation";
import { destinations } from "../data/destinations";
import "../css/common.css";
import "../css/trip-planner.css";

const TRIP_TYPES = [
    ["Beach", "🏖️"], ["Adventure", "🏔️"], ["Nature", "🌿"], ["Historical", "🏛️"],
    ["Family", "👨‍👩‍👧‍👦"], ["Romantic", "❤️"], ["Spiritual", "🛕"], ["Shopping", "🛍️"]
];

const BUDGETS = [
    ["10000", "Under ₹10,000", "Budget"],
    ["25000", "₹10k – ₹25k", "Affordable"],
    ["50000", "₹25k – ₹50k", "Comfortable"],
    ["100000", "₹50k – ₹1L", "Premium"],
    ["200000", "Above ₹1L", "Luxury"]
];

const PREFERENCES = [
    ["Food", "🍜"], ["Photography", "📸"], ["Nightlife", "🌃"],
    ["Shopping", "🛍️"], ["Culture", "🏛️"], ["Relaxation", "🧘"]
];

const INITIAL = {
    name: "", phone: "", email: "", city: "",
    destination: "", suggest: false,
    travelers: "", duration: "", travelDate: "",
    tripTypes: [], budget: "", budgetType: "person",
    preferences: [], accommodation: "", transport: "", special: ""
};

function TripPlanner() {
    const navigate = useNavigate();
    const { showToast } = useToast();
        const user = useUser();
    const [form, setForm] = useState(() => ({
        ...INITIAL,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || ""
    }));
    const [errors, setErrors] = useState({});
    const { min: minDate, max: maxDate, label: maxLabel } = dateLimits();

    const set = (field) => (event) =>
        setForm((f) => ({ ...f, [field]: event.target.value }));

    const toggleIn = (field, value) =>
        setForm((f) => ({
            ...f,
            [field]: f[field].includes(value)
                ? f[field].filter((v) => v !== value)
                : [...f[field], value]
        }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Please enter your full name.";
        if (!phonePattern.test(form.phone.trim())) e.phone = messages.phone;
        if (form.email.trim() && !emailPattern.test(form.email.trim())) e.email = messages.email;
        if (!form.travelers) e.travelers = "Please select the number of travelers.";
        if (!form.budget) e.budget = "Please choose a budget.";
        if (form.travelDate && form.travelDate < minDate) {
            e.travelDate = "Please choose today or a future date.";
        } else if (form.travelDate && form.travelDate > maxDate) {
            e.travelDate = `Please choose a date within the next ${maxLabel}.`;
        }
        return e;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const found = validate();
        setErrors(found);

        if (Object.keys(found).length) {
            showToast("Please fix the highlighted fields. ⚠️");
            return;
        }

        // "Suggest a destination for me" ignores any typed destination.
        const request = { ...form, destination: form.suggest ? "" : form.destination.trim() };

        // Rule-based engine (see utils/recommend.js). Swap it for an API call later.
        const results = recommendDestinations(request);

        saveTripRequest(request, results);
        navigate("/results");
    };

    return (
        <>
            <PageBanner
                title="Plan Your Perfect Trip"
                subtitle="Tell us your preferences and we'll suggest destinations for you."
            />

            <main className="form-container">
                <form id="tripForm" onSubmit={handleSubmit} noValidate>

                    {/* PERSONAL DETAILS */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">👤</div>
                            <div><h2>Personal Details</h2><p>Tell us a little about yourself</p></div>
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="planner-name">Full Name <span>*</span></label>
                                <input id="planner-name" type="text" placeholder="Enter your full name"
                                    value={form.name} onChange={set("name")} />
                                {errors.name && <small className="field-error">{errors.name}</small>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-phone">Phone Number <span>*</span></label>
                                <input id="planner-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                                    value={form.phone} onChange={set("phone")} />
                                {errors.phone && <small className="field-error">{errors.phone}</small>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-email">Email Address</label>
                                <input id="planner-email" type="email" placeholder="you@gmail.com"
                                    value={form.email} onChange={set("email")} />
                                {errors.email && <small className="field-error">{errors.email}</small>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-city">Current City</label>
                                <input id="planner-city" type="text" placeholder="e.g. Ahmedabad"
                                    value={form.city} onChange={set("city")} />
                            </div>
                        </div>
                    </div>

                    {/* TRIP DETAILS */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">🌍</div>
                            <div><h2>Trip Details</h2><p>Tell us about your dream trip</p></div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="planner-destination">Where would you like to go?</label>
                            <input id="planner-destination" type="text" list="destination-options" placeholder="Enter destination or leave blank"
                                value={form.destination} onChange={set("destination")}
                                disabled={form.suggest} />
                                <datalist id="destination-options">
                                {destinations.map((d) => <option key={d.id} value={d.name} />)}
                            </datalist>
                        </div>
                        <label className="suggest-destination">
                            <input type="checkbox" checked={form.suggest}
                                onChange={(e) => setForm((f) => ({ ...f, suggest: e.target.checked }))} />
                            <span>✨ I'm not sure — suggest a destination for me</span>
                        </label>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="planner-travelers">Number of Travelers <span>*</span></label>
                                <select id="planner-travelers" value={form.travelers} onChange={set("travelers")}>
                                    <option value="">Select travelers</option>
                                    {["1 Person", "2 People", "3 People", "4 People", "5 People", "6 People", "7+ People"].map((o) => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                                {errors.travelers && <small className="field-error">{errors.travelers}</small>}
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-duration">Trip Duration</label>
                                <select id="planner-duration" value={form.duration} onChange={set("duration")}>
                                    <option value="">Select duration</option>
                                    {["1 - 2 Days", "3 - 4 Days", "5 - 7 Days", "8 - 14 Days", "15+ Days"].map((o) => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-date">Preferred Travel Date</label>
                                <input id="planner-date" 
                                    type="date"
                                    value={form.travelDate}
                                    onChange={set("travelDate")}
                                    min={minDate}
                                    max={maxDate}
                                />
                                {errors.travelDate && <small className="field-error">{errors.travelDate}</small>}
                            </div>
                        </div>
                    </div>

                    {/* TRIP TYPE */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">🧭</div>
                            <div><h2>Trip Type</h2><p>What kind of experience are you looking for?</p></div>
                        </div>
                        <div className="trip-types">
                            {TRIP_TYPES.map(([value, icon]) => (
                                <label className="trip-option" key={value}>
                                    <input type="checkbox" checked={form.tripTypes.includes(value)}
                                        onChange={() => toggleIn("tripTypes", value)} />
                                    <span className="option-card">
                                        <span className="option-icon">{icon}</span>{value}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* BUDGET */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">💰</div>
                            <div><h2>Trip Budget</h2><p>Help us find options within your budget</p></div>
                        </div>
                        <div className="budget-options">
                            {BUDGETS.map(([value, label, hint]) => (
                                <label key={value}>
                                    <input type="radio" name="budget" value={value}
                                        checked={form.budget === value} onChange={set("budget")} />
                                    <span><strong>{label}</strong><small>{hint}</small></span>
                                </label>
                            ))}
                        </div>
                        {errors.budget && <small className="field-error">{errors.budget}</small>}
                        <div className="budget-type">
                            <p>Budget is for:</p>
                            <label><input type="radio" name="budgetType" value="person"
                                checked={form.budgetType === "person"} onChange={set("budgetType")} /> Per Person</label>
                            <label><input type="radio" name="budgetType" value="group"
                                checked={form.budgetType === "group"} onChange={set("budgetType")} /> Entire Group</label>
                        </div>
                    </div>

                    {/* PREFERENCES */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">✨</div>
                            <div><h2>Travel Preferences</h2><p>Choose the experiences you enjoy</p></div>
                        </div>
                        <div className="preference-grid">
                            {PREFERENCES.map(([value, icon]) => (
                                <label key={value}>
                                    <input type="checkbox" checked={form.preferences.includes(value)}
                                        onChange={() => toggleIn("preferences", value)} />
                                    {icon} {value}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* STAY & TRANSPORT */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">🏨</div>
                            <div><h2>Stay & Transport</h2><p>Choose your preferred arrangements</p></div>
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="planner-accommodation">Accommodation</label>
                                <select id="planner-accommodation" value={form.accommodation} onChange={set("accommodation")}>
                                    <option value="">Select accommodation</option>
                                    {["Budget Hotel", "3 Star Hotel", "4 Star Hotel", "5 Star Hotel", "Resort", "No Preference"].map((o) => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="planner-transport">Transportation</label>
                                <select id="planner-transport" value={form.transport} onChange={set("transport")}>
                                    <option value="">Select transportation</option>
                                    {["Flight", "Train", "Bus", "Car / Cab", "Own Vehicle", "No Preference"].map((o) => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ADDITIONAL */}
                    <div className="form-section">
                        <div className="section-title">
                            <div className="section-icon">📝</div>
                            <div><h2>Additional Information</h2><p>Anything else we should know?</p></div>
                        </div>
                        <div className="input-group">
                            <label htmlFor="planner-special">Special Requirements</label>
                            <textarea id="planner-special" 
                                placeholder="Tell us about food preferences, activities or special requirements..."
                                value={form.special} onChange={set("special")}></textarea>
                        </div>
                    </div>

                    <div className="submit-area">
                        <button type="submit" className="submit-btn">✨ Suggest My Trip →</button>
                        <p>🔒 Your information is safe and will only be used to create your personalized trip suggestion.</p>
                    </div>
                </form>
            </main>
        </>
    );
}

export default TripPlanner;