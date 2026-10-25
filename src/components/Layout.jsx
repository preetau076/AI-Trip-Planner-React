import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ToastProvider from "./ToastProvider";
import ErrorBoundary from "./ErrorBoundary";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

/* One title per page. Trip Details and Payment set their own title inside the page. */
const TITLES = {
    "/": "TripSuggest | Personalized Travel Planning",
    "/destinations": "TripSuggest | Destinations",
    "/trip-planner": "TripSuggest | Plan Your Trip",
    "/results": "TripSuggest | Your Recommendations",
    "/packages": "TripSuggest | Packages",
    "/how-it-works": "TripSuggest | How It Works",
    "/about": "TripSuggest | About Us",
    "/faq": "TripSuggest | FAQ",
    "/contact": "TripSuggest | Contact Us",
    "/login": "TripSuggest | Login",
    "/signup": "TripSuggest | Create Account",
    "/dashboard": "TripSuggest | My Dashboard"
};
const OWN_TITLE = ["/trip-details", "/payment"];

function PageTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        // "/destinations/" and "/destinations" are the same page
        const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
        if (OWN_TITLE.includes(path)) return;
        document.title = TITLES[path] || "TripSuggest | Page Not Found";
    }, [pathname]);
    return null;
}

/* The original login / signup pages have a header only, no footer. */
const NO_FOOTER = ["/login", "/signup"];

function Layout() {
    const { pathname } = useLocation();
    return (
        <ToastProvider>
            <ScrollToTop />
            <PageTitle />
            <a className="skip-link" href="#main-content">Skip to main content</a>
            <Header />
            <main id="main-content" tabIndex={-1}>
                <ErrorBoundary key={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>
            {!NO_FOOTER.includes(pathname) && <Footer />}
        </ToastProvider>
    );
}

export default Layout;