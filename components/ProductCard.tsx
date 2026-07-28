"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";
import type { ProductCardData } from "@/lib/serializers";

export function ProductCard({ product }: { product: ProductCardData }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const { addItem } = useCart();
  const soldOut =
    product.type === "VARIABLE"
      ? product.variants.every((variant) => variant.stock < 1)
      : product.stock < 1;

  function quickAdd() {
    if (soldOut) return;
    if (product.type === "VARIABLE") {
      setQuickOpen(true);
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.mainImage,
      price: product.price,
      stock: product.stock
    });
  }

  return (
    <>
      <article className="product-card">
        <div className="product-card__media">
          <Link href={`/product/${product.slug}`}>
            <img
              className="product-card__main"
              src={product.mainImage}
              alt={product.title}
              loading="lazy"
            />
            {product.hoverImage ? (
              <img
                className="product-card__hover"
                src={product.hoverImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
              />
            ) : null}
          </Link>
          {product.compareAtPrice ? (
            <span className="product-badge">Sale</span>
          ) : null}
          {soldOut ? <span className="product-badge sold">Sold out</span> : null}
        </div>
        <div className="product-card__content">
          <Link href={`/shop?collection=${product.collectionSlug}`}>
            <small>{product.collectionName}</small>
          </Link>
          <Link href={`/product/${product.slug}`}>
            <h3>{product.title}</h3>
          </Link>
          <div className="price-row">
            <strong>{formatMoney(product.price)}</strong>
            {product.compareAtPrice ? (
              <del>{formatMoney(product.compareAtPrice)}</del>
            ) : null}
          </div>
          <button
            className="product-card__quick"
            type="button"
            onClick={quickAdd}
            disabled={soldOut}
          >
            {soldOut
              ? "Sold Out"
              : product.type === "VARIABLE"
                ? "Choose Options"
                : "Quick Add"}
          </button>
        </div>
      </article>

      {quickOpen ? (
        <QuickView product={product} onClose={() => setQuickOpen(false)} />
      ) : null}
    </>
  );
}

function QuickView({
  product,
  onClose
}: {
  product: ProductCardData;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(
    product.variants.find((variant) => variant.stock > 0)?.colorName || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants.find((variant) => variant.stock > 0)?.size || ""
  );
  const [quantity, setQuantity] = useState(1);

  const colors = useMemo(
    () =>
      Array.from(
        new Map(
          product.variants
            .filter((variant) => variant.colorName)
            .map((variant) => [
              variant.colorName as string,
              {
                name: variant.colorName as string,
                hex: variant.colorHex || "#d7c6ad"
              }
            ])
        ).values()
      ),
    [product.variants]
  );

  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants
            .filter(
              (variant) =>
                (!selectedColor || variant.colorName === selectedColor) &&
                variant.size
            )
            .map((variant) => variant.size as string)
        )
      ),
    [product.variants, selectedColor]
  );

  const selectedVariant = product.variants.find(
    (variant) =>
      (!selectedColor || variant.colorName === selectedColor) &&
      (!selectedSize || variant.size === selectedSize)
  );

  const displayPrice = selectedVariant?.price || product.price;
  const displayImage = selectedVariant?.image || product.mainImage;
  const stock =
    product.type === "VARIABLE"
      ? selectedVariant?.stock || 0
      : product.stock;

  function add() {
    if (product.type === "VARIABLE" && !selectedVariant) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      variantId: selectedVariant?.id,
      title: product.title,
      image: displayImage,
      price: displayPrice,
      quantity,
      stock,
      variantLabel: selectedVariant
        ? [selectedVariant.colorName, selectedVariant.size]
            .filter(Boolean)
            .join(" / ")
        : undefined
    });
    onClose();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <button
        className="modal__backdrop"
        type="button"
        onClick={onClose}
        aria-label="Close quick view"
      />
      <div className="quick-view">
        <button
          className="quick-view__close"
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
        >
          <X size={21} />
        </button>
        <div className="quick-view__image">
          <img src={displayImage} alt={product.title} />
        </div>
        <div className="quick-view__content">
          <p className="eyebrow">{product.collectionName}</p>
          <h2>{product.title}</h2>
          <div className="price-row price-row--large">
            <strong>{formatMoney(displayPrice)}</strong>
            {product.compareAtPrice ? (
              <del>{formatMoney(product.compareAtPrice)}</del>
            ) : null}
          </div>
          <p className="quick-view__description">
            {product.description.slice(0, 180)}
            {product.description.length > 180 ? "…" : ""}
          </p>

          {product.type === "VARIABLE" ? (
            <>
              {colors.length ? (
                <div className="option-group">
                  <div className="option-label">
                    <span>Colour</span>
                    <strong>{selectedColor}</strong>
                  </div>
                  <div className="color-options">
                    {colors.map((color) => (
                      <button
                        type="button"
                        key={color.name}
                        className={
                          selectedColor === color.name ? "is-selected" : ""
                        }
                        onClick={() => {
                          setSelectedColor(color.name);
                          const first = product.variants.find(
                            (variant) =>
                              variant.colorName === color.name &&
                              variant.stock > 0
                          );
                          setSelectedSize(first?.size || "");
                        }}
                        title={color.name}
                        aria-label={color.name}
                      >
                        <span style={{ backgroundColor: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {sizes.length ? (
                <div className="option-group">
                  <div className="option-label">
                    <span>Size</span>
                    <strong>{selectedSize}</strong>
                  </div>
                  <div className="size-options">
                    {sizes.map((size) => {
                      const variant = product.variants.find(
                        (item) =>
                          item.colorName === selectedColor && item.size === size
                      );
                      return (
                        <button
                          type="button"
                          key={size}
                          disabled={!variant || variant.stock < 1}
                          className={
                            selectedSize === size ? "is-selected" : ""
                          }
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="quantity-add-row">
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))
                }
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="button button-dark grow"
              onClick={add}
              disabled={stock < 1}
            >
              {stock < 1 ? "Unavailable" : "Add to Bag"}
            </button>
          </div>
          <Link
            className="text-link"
            href={`/product/${product.slug}`}
            onClick={onClose}
          >
            View full product details
          </Link>
        </div>
      </div>
    </div>
  );
}
