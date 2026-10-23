/*
  Public contact details shown on the Contact page.
  Email and phone come from .env.local (VITE_ variables), so they are not
  written inside the source code. If a value is empty, that line is hidden.
  Note: anything in a VITE_ variable ends up in the built website, so only
  put details here that you are happy to show publicly.
*/
export const CONTACT = {
    email: (import.meta.env.VITE_CONTACT_EMAIL || "").trim(),
    phone: (import.meta.env.VITE_CONTACT_PHONE || "").trim(),
    address: "Ahmedabad, Gujarat, India",
    hours: "Monday - Saturday, 9 AM - 6 PM"
};

/* UPI account that receives the trip payments (shown to the payer inside the QR code). */
export const UPI = {
    id: (import.meta.env.VITE_UPI_ID || "").trim(),
    name: (import.meta.env.VITE_UPI_NAME || "").trim()
};