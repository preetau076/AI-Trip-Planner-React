import { useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";

import "../css/common.css";

function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <PageBanner title="Page Not Found" subtitle="The page you are looking for does not exist." />

            <section className="section" style={{ textAlign: "center" }}>
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                    Back to Home
                </button>
            </section>
        </>
    );
}

export default NotFound;
