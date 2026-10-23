import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import TripDetails from "./pages/TripDetails";
import TripPlanner from "./pages/TripPlanner";
import Results from "./pages/Results";
import Packages from "./pages/Packages";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";            // NEW (Edit A)
import NotFound from "./pages/NotFound";

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/trip-details" element={<TripDetails />} />
                <Route path="/trip-planner" element={<TripPlanner />} />
                <Route path="/results" element={<Results />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                {/* NEW (Edit B): the payment page, login required */}
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;