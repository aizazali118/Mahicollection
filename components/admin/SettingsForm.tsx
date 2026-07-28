"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

type SettingsData = {
  announcement: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsappNumber: string;
  currency: string;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  about: string;
};

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const data = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        announcement: String(data.get("announcement") || ""),
        contactPhone: String(data.get("contactPhone") || ""),
        contactEmail: String(data.get("contactEmail") || ""),
        address: String(data.get("address") || ""),
        facebook: String(data.get("facebook") || ""),
        instagram: String(data.get("instagram") || ""),
        tiktok: String(data.get("tiktok") || ""),
        whatsappNumber: String(data.get("whatsappNumber") || ""),
        currency: String(data.get("currency") || "PKR"),
        shippingFlatRate: Number(data.get("shippingFlatRate") || 0),
        freeShippingThreshold: Number(
          data.get("freeShippingThreshold") || 0
        ),
        about: String(data.get("about") || "")
      })
    });
    const result = (await response.json()) as {
      error?: string;
      message?: string;
    };
    setSaving(false);
    if (!response.ok) {
      setError(result.error || "Settings could not be saved.");
      return;
    }
    setMessage(result.message || "Store settings updated.");
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Announcement & contact</h2>
            <p>These details update the storefront header and footer.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label className="full-field">
            Marquee announcement
            <input
              name="announcement"
              defaultValue={initial.announcement}
              required
            />
          </label>
          <label>
            Contact phone
            <input
              name="contactPhone"
              defaultValue={initial.contactPhone}
              required
            />
          </label>
          <label>
            Contact email
            <input
              name="contactEmail"
              type="email"
              defaultValue={initial.contactEmail}
              required
            />
          </label>
          <label className="full-field">
            Address / location
            <input name="address" defaultValue={initial.address} required />
          </label>
          <label className="full-field">
            Short brand description
            <textarea name="about" defaultValue={initial.about} rows={4} required />
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Social & WhatsApp</h2>
            <p>Use complete public social URLs and an international WhatsApp number.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Facebook URL
            <input name="facebook" defaultValue={initial.facebook} required />
          </label>
          <label>
            Instagram URL
            <input name="instagram" defaultValue={initial.instagram} required />
          </label>
          <label>
            TikTok URL
            <input name="tiktok" defaultValue={initial.tiktok} required />
          </label>
          <label>
            WhatsApp number
            <input
              name="whatsappNumber"
              defaultValue={initial.whatsappNumber}
              placeholder="923001234567"
              required
            />
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Checkout & delivery</h2>
            <p>Shipping is calculated automatically from the product subtotal.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Currency
            <select name="currency" defaultValue={initial.currency}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </label>
          <label>
            Flat shipping rate
            <input
              name="shippingFlatRate"
              type="number"
              min="0"
              defaultValue={initial.shippingFlatRate}
              required
            />
          </label>
          <label>
            Free shipping threshold
            <input
              name="freeShippingThreshold"
              type="number"
              min="0"
              defaultValue={initial.freeShippingThreshold}
              required
            />
          </label>
        </div>
      </section>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="admin-form-actions">
        <button className="admin-primary-button" disabled={saving}>
          {saving ? <Loader2 className="spin" size={17} /> : null}
          {saving ? "Saving..." : "Save Store Settings"}
        </button>
      </div>
    </form>
  );
}
