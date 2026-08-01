"use client";

import { CheckCircle2, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";
import { passwordRequirementsMessage } from "@/lib/password-policy";

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
  const [accountMessage, setAccountMessage] = useState("");
  const [createAccount, setCreateAccount] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");

  const shipping = useMemo(
    () => (subtotal >= freeShippingThreshold ? 0 : shippingFlatRate),
    [subtotal, freeShippingThreshold, shippingFlatRate]
  );
  const total = Math.max(0, subtotal - discount + shipping);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const user = data?.user || null;
        const last = data?.lastOrder || null;
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          // if we have recent order contact info, prefer it
          if (last) {
            setPhone(last.phone || "");
            setAddress(last.address || "");
            setCity(last.city || "");
            setName(last.name || user.name || "");
            setEmail(last.email || user.email || "");
          }
          // hide create-account option for logged-in users
          setCreateAccount(false);
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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
    const whatsappWindow = window.open("", "mahi-order-whatsapp");
    const payload = {
      name: String(name || ""),
      email: String(email || ""),
      phone: String(phone || ""),
      address: String(address || ""),
      city: String(city || ""),
      note: String(note || ""),
      couponCode: couponCode.trim() || undefined,
      createAccount,
      password: password ? String(password) : undefined,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    };

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      window.clearTimeout(timeout);

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        orderNumber?: string;
        whatsappUrl?: string | null;
        accountCreated?: boolean;
        resetSent?: boolean;
        message?: string;
      };

      if (!response.ok || !data.orderNumber) {
        whatsappWindow?.close();
        setError(data.error || "Your order could not be placed.");
        return;
      }

      setAccountMessage(
        data.accountCreated && data.resetSent
          ? "Account created. A password reset link has been sent to your email so you can set your password."
          : data.message || ""
      );
      clearCart();
      if (data.whatsappUrl) {
        if (whatsappWindow) {
          whatsappWindow.location.href = data.whatsappUrl;
        } else {
          window.location.href = data.whatsappUrl;
          return;
        }
      } else {
        whatsappWindow?.close();
      }
      router.push(`/order-success/${data.orderNumber}`);
      router.refresh();
    } catch (requestError) {
      whatsappWindow?.close();
      setError(
        requestError instanceof DOMException && requestError.name === "AbortError"
          ? "The server took too long to respond. Please check your internet connection and try again."
          : "The order could not be placed. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
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
            <input name="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email address *
            <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Phone number *
            <input name="phone" type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            City *
            <input name="city" required autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="full-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span>Create account for this order</span>
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(event) => setCreateAccount(event.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
            </div>
          </label>
          {createAccount ? (
            <>
              <label className="full-field">
                Password for account
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Set a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <p className="form-message">{passwordRequirementsMessage}</p>
            </>
          ) : null}
          <label className="full-field">
            Complete delivery address *
            <textarea
              name="address"
              required
              autoComplete="street-address"
              placeholder="House, street, area, landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="full-field">
            Order note
            <textarea
              name="note"
              placeholder="Size guidance, delivery instructions, or any message for our team"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
        {accountMessage ? <p className="form-success">{accountMessage}</p> : null}
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
