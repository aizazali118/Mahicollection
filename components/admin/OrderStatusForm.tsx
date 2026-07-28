"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
] as const;

export function OrderStatusForm({
  orderId,
  currentStatus
}: {
  orderId: string;
  currentStatus: (typeof statuses)[number];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error || "Status could not be updated.");
      return;
    }
    setMessage("Order status updated.");
    router.refresh();
  }

  return (
    <div className="order-status-form">
      <label>
        Order status
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as (typeof statuses)[number])
          }
        >
          {statuses.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="admin-primary-button"
        onClick={save}
        disabled={saving}
      >
        {saving ? <Loader2 className="spin" size={17} /> : null}
        {saving ? "Saving..." : "Update Status"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </div>
  );
}
