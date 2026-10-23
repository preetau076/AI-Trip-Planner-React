import { useState } from "react";
import PageBanner from "../components/PageBanner";
import { useToast } from "../context/toastContext";
import { useUser } from "../hooks/useStorage";
import { CONTACT } from "../config/site";
import { emailPattern, messages } from "../utils/validation";

import "../css/common.css";
import "../css/contact.css";

const MAX_MESSAGE = 1000; // keeps the mailto link a safe length

/*
  No server yet: sending opens the visitor's own email app with the message
  already written, and offers the same message as a Gmail link as a fallback.
  When a user is logged in, name and email come from the account and are locked.
  FUTURE: replace this with a POST to your PostgreSQL backend, where the server
  takes name and email from the logged-in user instead of the form.
*/
function Contact() {
    const { showToast } = useToast();
    const user = useUser();
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);

    // Logged in: use the account's details. Logged out: use what the visitor types.
    const locked = !!user?.email;
    const senderName = locked ? user.name || "" : guestName;
    const senderEmail = locked ? user.email : guestEmail;
    const lockedStyle = locked
        ? { background: "#EEF1F5", color: "#475569", cursor: "not-allowed" }
        : undefined;

    // The same message as an email-app link and as a Gmail-in-the-browser link.
    const subject = `TripSuggest enquiry from ${senderName.trim()}`;
    const body = `${message.trim()}\n\n— ${senderName.trim()}\nReply to: ${senderEmail.trim()}`;
    const mailtoUrl =
        `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT.email)}` +
        `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const sendMessage = (event) => {
        event.preventDefault();

        const found = {};
        if (!senderName.trim()) found.name = "Please enter your name.";
        if (!emailPattern.test(senderEmail.trim())) found.email = messages.email;
        if (message.trim().length < 5) found.message = "Please write a short message.";
        else if (message.trim().length > MAX_MESSAGE) {
            found.message = `Please keep the message under ${MAX_MESSAGE} characters.`;
        }
        setErrors(found);
        if (Object.keys(found).length) return;

        if (!CONTACT.email) {
            showToast("The contact email is not set up yet. ⚠️");
            return;
        }

        window.location.assign(mailtoUrl);
        setSent(true);
        showToast("Opening your email app... 📩");
    };

    return (
        <>
            <PageBanner title="Contact Us" subtitle="Have a question? We'd love to hear from you." />

            <section className="section">
                <div className="contact-container">

                    <div className="contact-info">
                        <h2>Let's Talk</h2>

                        <p>
                            Our team can help you with trip planning,
                            destination recommendations and travel questions.
                        </p>

                        {CONTACT.email && <div className="contact-item">📧 {CONTACT.email}</div>}
                        {CONTACT.phone && <div className="contact-item">📞 {CONTACT.phone}</div>}
                        <div className="contact-item">📍 {CONTACT.address}</div>
                        <div className="contact-item">🕘 {CONTACT.hours}</div>
                    </div>

                    <div className="contact-form">
                        <h2>Send a Message</h2>

                        <form onSubmit={sendMessage} noValidate>
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your name"
                                    value={senderName} readOnly={locked} style={lockedStyle}
                                    onChange={(e) => setGuestName(e.target.value)} />
                                {errors.name && <small className="field-error">{errors.name}</small>}
                            </div>

                            <br />

                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" placeholder="Your email address"
                                    value={senderEmail} readOnly={locked} style={lockedStyle}
                                    onChange={(e) => setGuestEmail(e.target.value)} />
                                {errors.email && <small className="field-error">{errors.email}</small>}
                            </div>

                            {locked && (
                                <p className="form-note">
                                    Name and email come from your account and can't be changed here.
                                </p>
                            )}

                            <br />

                            <div className="input-group">
                                <label>Message</label>
                                <textarea placeholder="Write your message..." maxLength={MAX_MESSAGE}
                                    value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                                {errors.message && <small className="field-error">{errors.message}</small>}
                            </div>

                            <br />

                            <button className="btn btn-primary" type="submit">Send Message</button>
                            <p className="form-note">
                                This opens your email app with the message ready to send.
                            </p>
                            {sent && (
                                <p className="form-note">
                                    Email app didn't open?{" "}
                                    <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
                                        Open the message in Gmail
                                    </a>
                                </p>
                            )}
                        </form>
                    </div>

                </div>
            </section>
        </>
    );
}

export default Contact;