"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({
  endpoint,
  label = "Delete",
  confirmText = "Are you sure you want to delete this item?"
}: {
  endpoint: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!window.confirm(confirmText)) return;
    setLoading(true);
    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error || "Could not delete this item.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      className="admin-danger-button"
      onClick={remove}
      disabled={loading}
    >
      <Trash2 size={15} />
      {loading ? "Deleting..." : label}
    </button>
  );
}
