import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import PageBanner from "../components/PageBanner";
import { useToast } from "../context/toastContext";
import { usePayments } from "../hooks/useStorage";
import { UPI } from "../config/site";
import { getDestination } from "../data/destinations";
import { formatINR } from "../utils/budget";
import { updatePayment } from "../utils/storage";
import { buildUpiLink, isValidUpiId } from "../utils/upi";

import "../css/common.css";

const card = {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(16, 42, 67, 0.08)",
    padding: "24px",
    marginBottom: "20px"
};

/*
  FRONTEND-ONLY DEMO. The QR code pays your UPI account. The two buttons are
  what the user SAYS (nothing is verified here), so the status always stays
  "Incomplete" until you check your bank/UPI app yourself and mark it Complete.
  FUTURE: this record lives in the PostgreSQL `payments` table.
*/
function Payment() {
    const [params] = useSearchParams();
    const ref = params.get("ref") || "";
    const payments = usePayments();
    const payment = payments.find((p) => p.paymentRef === ref) || null;
    const trip = payment ? getDestination(payment.destinationId) : null;

    const { showToast } = useToast();
    const [utr, setUtr] = useState("");
    const [utrError, setUtrError] = useState("");
    const [qr, setQr] = useState(""); // "" = loading, "error", or the image data

    const configured = isValidUpiId(UPI.id) && !!UPI.name;
    const upiLink =
        payment && configured
            ? buildUpiLink({
                  upiId: UPI.id,
                  name: UPI.name,
                  amount: payment.amount,
                  note: `TripSuggest ${payment.paymentRef}`
              })
            : "";

    useEffect(() => {
        document.title = "TripSuggest | Payment";
    }, []);

    useEffect(() => {
        if (!upiLink) return undefined;
        let cancelled = false;
        QRCode.toDataURL(upiLink, { width: 260, margin: 2, errorCorrectionLevel: "M" })
            .then((data) => {
                if (!cancelled) setQr(data);
            })
            .catch(() => {
                if (!cancelled) setQr("error");
            });
        return () => {
            cancelled = true;
        };
    }, [upiLink]);

    if (!payment || !trip) {
        return (
            <>
                <PageBanner title="Payment" subtitle="Complete your trip booking." />
                <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
                    <h2 style={{ color: "var(--navy)", marginBottom: "10px" }}>Payment not found</h2>
                    <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                        We couldn't find this payment. Please start from a trip.
                    </p>
                    <Link className="btn btn-primary" to="/destinations">Explore Destinations</Link>
                </div>
            </>
        );
    }

    const handlePaid = () => {
        updatePayment(payment.paymentRef, { userPaidClicked: true });
        showToast("Thanks! One more step below. 👇");
    };

    const handleDebit = () => {
        const value = utr.trim();
        if (value && !/^\d{12}$/.test(value)) {
            setUtrError("The UPI transaction number (UTR) has 12 digits. Leave it empty if you don't have it.");
            return;
        }
        setUtrError("");
        updatePayment(payment.paymentRef, { userDebitConfirmed: true, utr: value });
        showToast("Payment details recorded. ✅");
    };

    const stage = payment.userDebitConfirmed ? 2 : payment.userPaidClicked ? 1 : 0;

    return (
        <>
            <PageBanner title="Payment" subtitle="Scan the QR code with any UPI app to pay for your trip." />

            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}>

                <div style={card}>
                    <h3 style={{ color: "var(--navy)", marginBottom: "12px" }}>Trip summary</h3>
                    <p><strong>{trip.title}</strong></p>
                    <p>{payment.travelers} traveler(s) · {payment.days} days</p>
                    <p style={{ fontSize: "1.4rem", margin: "10px 0 4px" }}>
                        <strong>{formatINR(payment.amount)}</strong>
                    </p>
                    <small style={{ color: "var(--muted)" }}>
                        Estimated amount · Reference: <strong>{payment.paymentRef}</strong>
                    </small>
                </div>

                {stage < 2 && (
                    <div style={{ ...card, textAlign: "center" }}>
                        <h3 style={{ color: "var(--navy)", marginBottom: "12px" }}>Scan to pay</h3>

                        {!configured && (
                            <p style={{ color: "#9A3412" }}>
                                Payment is not set up yet. The site owner needs to add the UPI details.
                            </p>
                        )}
                        {configured && qr === "" && <p>Preparing the QR code…</p>}
                        {configured && qr === "error" && (
                            <p style={{ color: "#9A3412" }}>The QR code could not be created. Please try again.</p>
                        )}
                        {configured && qr && qr !== "error" && (
                            <>
                                <img
                                    src={qr}
                                    alt={`UPI QR code to pay ${formatINR(payment.amount)}`}
                                    width="260"
                                    height="260"
                                    style={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}
                                />
                                <p style={{ marginTop: "10px" }}>
                                    Pay to <strong>{UPI.name}</strong> ({UPI.id})
                                </p>
                                <small style={{ color: "var(--muted)" }}>
                                    The amount and reference {payment.paymentRef} are already filled in.
                                </small>
                            </>
                        )}

                        {configured && stage === 0 && (
                            <div style={{ marginTop: "20px" }}>
                                <button className="btn btn-primary" onClick={handlePaid}>
                                    I have completed the payment
                                </button>
                            </div>
                        )}

                        {configured && stage === 1 && (
                            <div style={{ marginTop: "20px", textAlign: "left" }}>
                                <p style={{ marginBottom: "10px" }}>
                                    ✔ You said you have paid. One last step:
                                </p>
                                <label style={{ display: "block", marginBottom: "6px" }}>
                                    UPI transaction number (UTR), optional
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={12}
                                    placeholder="12-digit number from your UPI app"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    style={{ width: "100%", padding: "10px", marginBottom: "6px" }}
                                />
                                {utrError && (
                                    <small className="field-error" style={{ display: "block", marginBottom: "10px" }}>
                                        {utrError}
                                    </small>
                                )}
                                <button className="btn btn-orange" onClick={handleDebit}>
                                    The money has been deducted from my account
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {stage === 2 && (
                    <div style={card}>
                        <h3 style={{ color: "var(--navy)", marginBottom: "10px" }}>✅ Thank you!</h3>
                        <p>We have recorded your payment details.</p>
                        <p style={{ margin: "12px 0" }}>
                            <strong>Payment status: Incomplete (awaiting verification)</strong>
                        </p>
                        <p style={{ color: "var(--muted)" }}>
                            We will mark it as Complete after we check that the money has reached our account.
                        </p>
                        <p style={{ margin: "12px 0" }}>
                            Reference: <strong>{payment.paymentRef}</strong>
                            {payment.utr && <> · UTR: <strong>{payment.utr}</strong></>}
                        </p>
                        <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
                    </div>
                )}

                <small style={{ color: "var(--muted)" }}>
                    College project demo: payments are checked manually, so the status stays Incomplete until then.
                </small>
            </div>
        </>
    );
}

export default Payment;