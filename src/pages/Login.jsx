import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/toastContext";
import { loginAccount } from "../utils/auth";
import { emailPattern, messages } from "../utils/validation";

import "../css/common.css";
import "../css/login.css";

/*
  FRONTEND-ONLY DEMO: checks against accounts created on the Signup page in this browser.
  Replace `loginAccount` in utils/auth.js with a real API call when a backend exists.
*/
function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = location.state?.from || "/dashboard";

    const handleLogin = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const found = {};
        if (!emailPattern.test(email.trim())) found.email = messages.email;
        if (!password) found.password = "Please enter your password.";
        setErrors(found);
        if (Object.keys(found).length) return;

        setSubmitting(true);
        const result = await loginAccount(email, password);
        setSubmitting(false);

        if (!result.ok) {
            setErrors({ password: result.error });
            return;
        }

        showToast("Logged in. 👋");
        setTimeout(() => navigate(redirectTo, { replace: true }), 700);
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <div className="auth-logo">
                    <div className="logo-icon">✈</div>
                    <h2>Welcome Back</h2>
                </div>

                <p className="auth-subtitle">
                    Login to manage your trips and saved destinations.
                </p>

                <form className="auth-form" id="loginForm" onSubmit={handleLogin} noValidate>
                    <div>
                        <label htmlFor="login-email">Email Address</label>
                        <input 
                            id="login-email"
                            type="email"
                            placeholder="you@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <small className="field-error">{errors.email}</small>}
                    </div>

                    <div>
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && <small className="field-error">{errors.password}</small>}
                    </div>

                    <button className="auth-submit" type="submit" disabled={submitting}>
                        {submitting ? "Checking..." : "Login"}
                    </button>
                </form>

                <div className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/signup"><span>Create Account</span></Link>
                </div>

                <p className="form-note">
                    Demo mode: accounts are stored in this browser only until a backend is connected.
                </p>
            </div>
        </div>
    );
}

export default Login;