import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ToastProvider from "./ToastProvider";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
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
            <Header />
            <Outlet />
            {!NO_FOOTER.includes(pathname) && <Footer />}
        </ToastProvider>
    );
}

export default Layout;
