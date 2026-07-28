"use client";

import { CheckCircle2, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";

type CheckoutProps = {
  shippingFlatRate: number;
  freeShippingThreshold: number;
};

export function CheckoutForm({
  shippingFlatRate,
  freeShippingThreshold
}: CheckoutProps) {
  const router = useRouter();
  const { items, subtotal, clearCart, ready } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shipping = useMemo(
    () => (subtotal >= freeShippingThreshold ? 0 : shippingFlatRate),
    [subtotal, freeShippingThreshold, shippingFlatRate]
  );
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponMessage("");

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal })
    });
    const data = (await response.json()) as {
      error?: string;
      discount?: number;
      message?: string;
    };
    setCouponLoading(false);

    if (!response.ok) {
      setDiscount(0);
      setCouponMessage(data.error || "Coupon is not valid.");
      return;
    }

    setDiscount(data.discount || 0);
    setCouponMessage(data.message || "Coupon applied.");
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;

    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      note: String(formData.get("note") || ""),
      couponCode: couponCode.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as {
      error?: string;
      orderNumber?: string;
    };

    if (!response.ok || !data.orderNumber) {
      setSubmitting(false);
      setError(data.error || "Your order could not be placed.");
      return;
    }

    clearCart();
    router.push(`/order-success/${data.orderNumber}`);
    router.refresh();
  }

  if (!ready) return <div className="page-loader">Preparing checkout...</div>;

  if (!items.length) {
    return (
      <div className="empty-state checkout-empty">
        <h2>Your shopping bag is empty</h2>
        <p>Add a product before opening checkout.</p>
        <button
          type="button"
          className="button button-dark"
          onClick={() => router.push("/shop")}
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <form className="checkout-layout" onSubmit={placeOrder}>
      <div className="checkout-fields">
        <div className="checkout-heading">
          <p className="eyebrow">Delivery information</p>
          <h1>Complete your order</h1>
          <p>
            Please enter complete details so our team can confirm and dispatch
            your order without delay.
          </p>
        </div>

        <div className="form-grid">
          <label>
            Full name *
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email address *
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone number *
            <input name="phone" type="tel" required autoComplete="tel" />
          </label>
          <label>
            City *
            <input name="city" required autoComplete="address-level2" />
          </label>
          <label className="full-field">
            Complete delivery address *
            <textarea
              name="address"
              required
              autoComplete="street-address"
              placeholder="House, street, area, landmark"
            />
          </label>
          <label className="full-field">
            Order note
            <textarea
              name="note"
              placeholder="Size guidance, delivery instructions, or any message for our team"
            />
          </label>
        </div>

        <div className="checkout-payment-note">
          <CheckCircle2 size={20} />
          <div>
            <strong>Cash on delivery</strong>
            <p>Your order will be confirmed by the Mahi Collection team.</p>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
      </div>

      <aside className="checkout-summary">
        <h2>Your order</h2>
        <div className="checkout-products">
          {items.map((item) => (
            <div className="checkout-product" key={item.key}>
              <span className="checkout-product__image">
                <img src={item.image} alt={item.title} />
                <em>{item.quantity}</em>
              </span>
              <span>
                <strong>{item.title}</strong>
                {item.variantLabel ? <small>{item.variantLabel}</small> : null}
              </span>
              <b>{formatMoney(item.price * item.quantity)}</b>
            </div>
          ))}
        </div>

        <div className="coupon-box">
          <label htmlFor="coupon">Coupon code</label>
          <div>
            <input
              id="coupon"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value.toUpperCase());
                if (!event.target.value) {
                  setDiscount(0);
                  setCouponMessage("");
                }
              }}
              placeholder="Enter code"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading || !couponCode.trim()}
            >
              {couponLoading ? <Loader2 className="spin" size={17} /> : <Tag size={17} />}
              Apply
            </button>
          </div>
          {couponMessage ? (
            <p className={discount > 0 ? "is-success" : "is-error"}>
              {couponMessage}
            </p>
          ) : null}
        </div>

        <div className="checkout-totals">
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          {discount > 0 ? (
            <div>
              <span>Coupon discount</span>
              <strong>− {formatMoney(discount)}</strong>
            </div>
          ) : null}
          <div>
            <span>Delivery</span>
            <strong>{shipping ? formatMoney(shipping) : "Free"}</strong>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <button
          type="submit"
          className="button button-dark button-block"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="spin" size={18} />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </button>
        <p className="checkout-terms">
          By placing the order, you agree to our terms, privacy policy, and
          shipping policy.
        </p>
      </aside>
    </form>
  );
}
