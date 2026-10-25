import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useStorage";
import { clearUser } from "../utils/storage";
import { useToast } from "../context/toastContext";

function Header() {
    const [open, setOpen] = useState(false);
    const user = useUser();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const logout = () => {
        clearUser();
        showToast("You have been logged out. 👋");
        navigate("/");
    };

    return (
        <header className="header">
            <Link to="/" className="logo">
                <div className="logo-icon">✈</div>
                Trip<span>Suggest</span>
            </Link>

            <nav className={"nav" + (open ? " open" : "")} id="mainNav" onClick={() => setOpen(false)}>
                <Link to="/">Home</Link>
                <Link to="/destinations">Destinations</Link>
                <Link to="/how-it-works">How It Works</Link>
                <Link to="/packages">Packages</Link>
                <Link to="/about">About</Link>
                {user ? (
                    <>
                        <Link className="nav-login" to="/dashboard">Dashboard</Link>
                        <button type="button" className="nav-signup" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="nav-login" to="/login">Login</Link>
                        <Link className="nav-signup" to="/signup">Sign Up</Link>
                    </>
                )}
            </nav>

            <button
                className="menu-btn"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                ☰
            </button>
        </header>
    );
}

export default Header;
