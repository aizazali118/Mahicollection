"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";

export function CartPageClient() {
  const {
    items,
    subtotal,
    ready,
    updateQuantity,
    removeItem
  } = useCart();

  if (!ready) {
    return <div className="page-loader">Loading your bag...</div>;
  }

  if (!items.length) {
    return (
      <section className="section container empty-cart">
        <ShoppingBag size={42} strokeWidth={1.2} />
        <p className="eyebrow">Your bag is waiting</p>
        <h1>No pieces added yet</h1>
        <p>Explore the latest Mahi Collection edit and find a look you love.</p>
        <Link className="button button-dark" href="/shop">
          Start Shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="section container cart-page">
      <div className="section-heading">
        <p className="eyebrow">Shopping bag</p>
        <h1>Your selected pieces</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.key}>
              <Link href={`/product/${item.slug}`} className="cart-item__image">
                <img src={item.image} alt={item.title} />
              </Link>
              <div className="cart-item__content">
                <h3>{item.title}</h3>
                {item.variantLabel ? <p>{item.variantLabel}</p> : null}
                <strong>{formatMoney(item.price)}</strong>
                <div className="cart-item__controls">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus size={15} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeItem(item.key)}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
              <strong className="cart-item__line-total">
                {formatMoney(item.price * item.quantity)}
              </strong>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <p>
            Delivery and coupon discounts are calculated on the checkout page.
          </p>
          <Link className="button button-dark button-block" href="/checkout">
            Proceed to Checkout
          </Link>
          <Link className="text-link cart-continue" href="/shop">
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
