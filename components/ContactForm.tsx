"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        subject: String(data.get("subject") || ""),
        message: String(data.get("message") || "")
      })
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
    };
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Could not send your message.");
      return;
    }

    form.reset();
    setMessage(result.message || "Your message has been received.");
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Full name *
          <input name="name" required />
        </label>
        <label>
          Email address *
          <input name="email" type="email" required />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" />
        </label>
        <label>
          Subject
          <input name="subject" />
        </label>
        <label className="full-field">
          Message *
          <textarea
            name="message"
            required
            minLength={10}
            placeholder="Tell us how we can help."
          />
        </label>
      </div>
      <button className="button button-dark" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="spin" size={18} />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
