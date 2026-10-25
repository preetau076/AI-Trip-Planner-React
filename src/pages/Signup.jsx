import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/toastContext";
import { registerAccount } from "../utils/auth";
import { emailPattern, passwordPattern, phonePattern, messages } from "../utils/validation";

import "../css/common.css";
import "../css/signup.css";

/*
  FRONTEND-ONLY DEMO: accounts live only in this browser (password is hashed).
  Replace `registerAccount` in utils/auth.js with a real API call later.
*/
function Signup() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSignup = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const found = {};
        if (!form.name.trim()) found.name = "Please enter your full name.";
        if (!emailPattern.test(form.email.trim())) found.email = messages.email;
        if (!phonePattern.test(form.phone.trim())) found.phone = messages.phone;
        if (!passwordPattern.test(form.password)) found.password = messages.password;
        setErrors(found);
        if (Object.keys(found).length) return;

        setSubmitting(true);
        const result = await registerAccount(form);
        setSubmitting(false);

        if (!result.ok) {
            setErrors({ email: result.error });
            return;
        }

        showToast("Account created (demo mode). 🎉");
        setTimeout(() => navigate("/dashboard"), 700);
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <div className="auth-logo">
                    <div className="logo-icon">✈</div>
                    <h2>Create Account</h2>
                </div>

                <p className="auth-subtitle">Join TripSuggest and save your favorite trips.</p>

                <form className="auth-form" id="signupForm" onSubmit={handleSignup} noValidate>
                    <div>
                        <label htmlFor="signup-name">Full Name</label>
                        <input id="signup-name" type="text" placeholder="Your full name"
                            value={form.name} onChange={set("name")} />
                        {errors.name && <small className="field-error">{errors.name}</small>}
                    </div>

                    <div>
                        <label htmlFor="signup-email">Email Address</label>
                        <input id="signup-email" type="email" placeholder="you@gmail.com"
                            value={form.email} onChange={set("email")} />
                        {errors.email && <small className="field-error">{errors.email}</small>}
                    </div>

                    <div>
                        <label htmlFor="signup-phone">Phone Number</label>
                        <input id="signup-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                            value={form.phone} onChange={set("phone")} />
                        {errors.phone && <small className="field-error">{errors.phone}</small>}
                    </div>

                    <div>
                        <label htmlFor="signup-password">Password</label>
                        <input id="signup-password" type="password" placeholder="Create password"
                            value={form.password} onChange={set("password")} />
                        {errors.password && <small className="field-error">{errors.password}</small>}
                    </div>

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login"><span>Login</span></Link>
                </div>

                <p className="form-note">
                    Demo mode: your account is kept in this browser only until a backend is connected.
                </p>
            </div>
        </div>
    );
}

export default Signup;