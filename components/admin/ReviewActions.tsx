"use client";

import { Check, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({
  reviewId,
  approved
}: {
  reviewId: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(nextApproved: boolean) {
    setLoading(true);
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: nextApproved })
    });
    setLoading(false);
    if (!response.ok) {
      window.alert("Review could not be updated.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Delete this review permanently?")) return;
    setLoading(true);
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE"
    });
    setLoading(false);
    if (!response.ok) {
      window.alert("Review could not be deleted.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-row-actions">
      <button
        type="button"
        className="admin-secondary-button"
        disabled={loading}
        onClick={() => update(!approved)}
      >
        {approved ? <X size={15} /> : <Check size={15} />}
        {approved ? "Unpublish" : "Approve"}
      </button>
      <button
        type="button"
        className="admin-danger-button"
        disabled={loading}
        onClick={remove}
      >
        <Trash2 size={15} />
        Delete
      </button>
    </div>
  );
}
