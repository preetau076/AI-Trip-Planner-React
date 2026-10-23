import { Link } from "react-router-dom";
import { usePayments } from "../hooks/useStorage";
import { getDestination } from "../data/destinations";
import { formatINR } from "../utils/budget";

function describe(p) {
    if (p.status === "Complete") return { text: "Complete ✅", bg: "#DCFCE7", color: "#166534" };
    if (p.userDebitConfirmed) return { text: "Incomplete · awaiting verification", bg: "#FFEDD5", color: "#9A3412" };
    if (p.userPaidClicked) return { text: "Incomplete · details pending", bg: "#FFEDD5", color: "#9A3412" };
    return { text: "Incomplete · not paid yet", bg: "#FFEDD5", color: "#9A3412" };
}

function PaymentsList() {
    const payments = usePayments();

    return (
        <div style={{ margin: "20px 0" }}>
            <p style={{ margin: "0 0 8px", opacity: 0.7, fontSize: "0.9rem" }}>My Payments</p>

            {payments.length === 0 && (
                <p style={{ margin: 0, opacity: 0.7 }}>
                    No payments yet. Open a trip and choose "Proceed to Payment".
                </p>
            )}

            {payments.map((p) => {
                const trip = getDestination(p.destinationId);
                const badge = describe(p);
                return (
                    <div
                        key={p.paymentRef}
                        className="dashboard-card"
                        style={{ textAlign: "left", marginBottom: "10px" }}
                    >
                        <strong>{trip ? trip.title : p.destinationId}</strong>
                        <p style={{ margin: "4px 0" }}>
                            {formatINR(p.amount)} · {p.travelers} traveler(s) · {p.days} days
                        </p>
                        <small>Reference: {p.paymentRef}</small>
                        <div style={{ marginTop: "8px" }}>
                            <span
                                style={{
                                    background: badge.bg,
                                    color: badge.color,
                                    padding: "3px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.8rem"
                                }}
                            >
                                {badge.text}
                            </span>
                            {p.status !== "Complete" && !p.userDebitConfirmed && (
                                <Link
                                    to={`/payment?ref=${encodeURIComponent(p.paymentRef)}`}
                                    style={{ marginLeft: "12px", fontSize: "0.85rem" }}
                                >
                                    Continue payment
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default PaymentsList;