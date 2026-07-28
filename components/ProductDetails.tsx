"use client";

import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  X,
  ZoomIn
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatMoney } from "@/lib/money";

type Variant = {
  id: string;
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  price: number | null;
  stock: number;
  image: string | null;
};

export type ProductDetailsData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "SINGLE" | "VARIABLE";
  mainImage: string;
  images: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  collectionName: string;
  variants: Variant[];
};

export function ProductDetails({ product }: { product: ProductDetailsData }) {
  const gallery = useMemo(
    () =>
      Array.from(
        new Set([
          product.mainImage,
          ...product.images,
          ...product.variants.map((variant) => variant.image).filter(Boolean)
        ])
      ) as string[],
    [product]
  );
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [selectedColor, setSelectedColor] = useState(
    product.variants.find((variant) => variant.stock > 0)?.colorName || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    product.variants.find((variant) => variant.stock > 0)?.size || ""
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

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
                hex: variant.colorHex || "#d8cbb8"
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
  const price = selectedVariant?.price || product.price;
  const stock =
    product.type === "VARIABLE"
      ? selectedVariant?.stock || 0
      : product.stock;
  const currentImage =
    selectedVariant?.image || gallery[activeImage] || product.mainImage;

  function selectColor(name: string) {
    setSelectedColor(name);
    const firstAvailable = product.variants.find(
      (variant) => variant.colorName === name && variant.stock > 0
    );
    setSelectedSize(firstAvailable?.size || "");
    if (firstAvailable?.image) {
      const index = gallery.indexOf(firstAvailable.image);
      if (index >= 0) setActiveImage(index);
    }
  }

  function moveImage(direction: number) {
    setActiveImage((current) => {
      const next = current + direction;
      if (next < 0) return gallery.length - 1;
      return next % gallery.length;
    });
  }

  function addToCart() {
    if (stock < 1) return;
    if (product.type === "VARIABLE" && !selectedVariant) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      variantId: selectedVariant?.id,
      title: product.title,
      image: currentImage,
      price,
      quantity,
      stock,
      variantLabel: selectedVariant
        ? [selectedVariant.colorName, selectedVariant.size]
            .filter(Boolean)
            .join(" / ")
        : undefined
    });
  }

  function updateZoomOrigin(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="product-detail-grid">
      <div className="product-gallery">
        <div
          className="product-gallery__main"
          onMouseMove={updateZoomOrigin}
          onClick={() => setZoomOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Zoom product image"
          onKeyDown={(event) => {
            if (event.key === "Enter") setZoomOpen(true);
          }}
        >
          <img
            src={currentImage}
            alt={product.title}
            style={{ transformOrigin: zoomOrigin }}
          />
          <span className="zoom-hint">
            <ZoomIn size={17} />
            Click to zoom
          </span>
          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--left"
                onClick={(event) => {
                  event.stopPropagation();
                  moveImage(-1);
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={21} />
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow--right"
                onClick={(event) => {
                  event.stopPropagation();
                  moveImage(1);
                }}
                aria-label="Next image"
              >
                <ChevronRight size={21} />
              </button>
            </>
          ) : null}
        </div>

        {gallery.length > 1 ? (
          <div className="product-gallery__thumbs">
            {gallery.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={activeImage === index ? "is-active" : ""}
                onClick={() => setActiveImage(index)}
              >
                <img src={image} alt={`${product.title} view ${index + 1}`} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="product-info">
        <p className="eyebrow">{product.collectionName}</p>
        <h1>{product.title}</h1>
        <div className="price-row product-info__price">
          <strong>{formatMoney(price)}</strong>
          {product.compareAtPrice ? (
            <del>{formatMoney(product.compareAtPrice)}</del>
          ) : null}
        </div>
        <p className={`stock-note ${stock < 1 ? "is-out" : ""}`}>
          {stock > 0 ? `${stock} available` : "Currently unavailable"}
        </p>
        <div className="product-description">
          {product.description.split("\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {product.type === "VARIABLE" ? (
          <div className="product-options">
            {colors.length ? (
              <div className="option-group">
                <div className="option-label">
                  <span>Colour</span>
                  <strong>{selectedColor || "Select colour"}</strong>
                </div>
                <div className="color-options color-options--large">
                  {colors.map((color) => (
                    <button
                      type="button"
                      key={color.name}
                      className={
                        selectedColor === color.name ? "is-selected" : ""
                      }
                      onClick={() => selectColor(color.name)}
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
                  <strong>{selectedSize || "Select size"}</strong>
                </div>
                <div className="size-options size-options--large">
                  {sizes.map((size) => {
                    const variant = product.variants.find(
                      (item) =>
                        (!selectedColor ||
                          item.colorName === selectedColor) &&
                        item.size === size
                    );
                    return (
                      <button
                        type="button"
                        key={size}
                        disabled={!variant || variant.stock < 1}
                        className={selectedSize === size ? "is-selected" : ""}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="product-buy-row">
          <div className="quantity-control quantity-control--large">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((value) =>
                  Math.min(Math.max(1, stock), value + 1)
                )
              }
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            className="button button-dark product-add-button"
            onClick={addToCart}
            disabled={stock < 1}
          >
            <ShoppingBag size={18} />
            {stock < 1 ? "Unavailable" : "Add to Bag"}
          </button>
        </div>

        <div className="product-service-notes">
          <div>
            <strong>Nationwide delivery</strong>
            <span>Carefully packed and dispatched across Pakistan.</span>
          </div>
          <div>
            <strong>Customer support</strong>
            <span>Questions about size or fabric? Contact our team.</span>
          </div>
          {product.sku ? (
            <div>
              <strong>Product code</strong>
              <span>{product.sku}</span>
            </div>
          ) : null}
        </div>
      </div>

      {zoomOpen ? (
        <div className="image-zoom-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="image-zoom-modal__backdrop"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          />
          <button
            type="button"
            className="image-zoom-modal__close"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
          >
            <X size={24} />
          </button>
          <img src={currentImage} alt={product.title} />
        </div>
      ) : null}
    </div>
  );
}
