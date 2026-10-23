/* UPI payment link (what the QR code contains). Works with GPay, PhonePe, Paytm, BHIM... */
export const isValidUpiId = (id) => /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(String(id || ""));

export function buildUpiLink({ upiId, name, amount, note }) {
    return (
        `upi://pay?pa=${upiId}` +
        `&pn=${encodeURIComponent(name)}` +
        `&am=${Number(amount).toFixed(2)}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent(note)}`
    );
}