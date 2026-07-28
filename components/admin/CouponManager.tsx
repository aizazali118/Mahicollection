"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/money";

type CouponItem = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
};

type CouponForm = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: string;
  maxDiscount: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  usageLimit: string;
};

const empty: CouponForm = {
  id: "",
  code: "",
  type: "PERCENT",
  value: 10,
  minOrder: "",
  maxDiscount: "",
  startsAt: "",
  endsAt: "",
  active: true,
  usageLimit: ""
};

export function CouponManager({ coupons }: { coupons: CouponItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CouponForm>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function edit(coupon: CouponItem) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder === null ? "" : String(coupon.minOrder),
      maxDiscount:
        coupon.maxDiscount === null ? "" : String(coupon.maxDiscount),
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : "",
      endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 16) : "",
      active: coupon.active,
      usageLimit:
        coupon.usageLimit === null ? "" : String(coupon.usageLimit)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(
      form.id ? `/api/admin/coupons/${form.id}` : "/api/admin/coupons",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrder: form.minOrder === "" ? null : Number(form.minOrder),
          maxDiscount:
            form.maxDiscount === "" ? null : Number(form.maxDiscount),
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          active: form.active,
          usageLimit:
            form.usageLimit === "" ? null : Number(form.usageLimit)
        })
      }
    );
    const data = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Coupon could not be saved.");
      return;
    }
    setForm(empty);
    router.refresh();
  }

  async function remove(coupon: CouponItem) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error || "Coupon could not be deleted.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-two-column">
      <form className="admin-panel admin-form sticky-panel" onSubmit={submit}>
        <div className="admin-panel__head">
          <div>
            <h2>{form.id ? "Edit coupon" : "Create coupon"}</h2>
            <p>Configure percentage or fixed cart discounts.</p>
          </div>
        </div>
        <label>
          Coupon code
          <input
            value={form.code}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                code: event.target.value.toUpperCase()
              }))
            }
            required
          />
        </label>
        <label>
          Discount type
          <select
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as "PERCENT" | "FIXED"
              }))
            }
          >
            <option value="PERCENT">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </label>
        <label>
          {form.type === "PERCENT" ? "Percentage value" : "Discount amount"}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                value: Number(event.target.value)
              }))
            }
            required
          />
        </label>
        <label>
          Minimum order
          <input
            type="number"
            min="0"
            value={form.minOrder}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                minOrder: event.target.value
              }))
            }
          />
        </label>
        <label>
          Maximum discount
          <input
            type="number"
            min="0"
            value={form.maxDiscount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                maxDiscount: event.target.value
              }))
            }
            disabled={form.type === "FIXED"}
          />
        </label>
        <label>
          Usage limit
          <input
            type="number"
            min="1"
            value={form.usageLimit}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                usageLimit: event.target.value
              }))
            }
          />
        </label>
        <label>
          Starts at
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startsAt: event.target.value
              }))
            }
          />
        </label>
        <label>
          Ends at
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                endsAt: event.target.value
              }))
            }
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                active: event.target.checked
              }))
            }
          />
          Active coupon
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="admin-form-actions">
          {form.id ? (
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setForm(empty)}
            >
              Cancel
            </button>
          ) : null}
          <button className="admin-primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : (
              <Plus size={17} />
            )}
            {saving ? "Saving..." : form.id ? "Update Coupon" : "Add Coupon"}
          </button>
        </div>
      </form>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Coupon codes</h2>
            <p>Checkout validates limits, dates, minimums, and usage counts.</p>
          </div>
        </div>
        <div className="admin-card-list">
          {coupons.map((coupon) => (
            <article className="admin-coupon-card" key={coupon.id}>
              <div>
                <span className="coupon-code">{coupon.code}</span>
                <h3>
                  {coupon.type === "PERCENT"
                    ? `${coupon.value}% off`
                    : `${formatMoney(coupon.value)} off`}
                </h3>
                <p>
                  Used {coupon.usedCount}
                  {coupon.usageLimit ? ` of ${coupon.usageLimit}` : " times"}
                  {coupon.minOrder
                    ? ` · Minimum ${formatMoney(coupon.minOrder)}`
                    : ""}
                </p>
                <small>{coupon.active ? "Active" : "Inactive"}</small>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => edit(coupon)}
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={() => remove(coupon)}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
