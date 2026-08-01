"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { slugify } from "@/lib/slugify";

type VariantInput = {
  id?: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
  image: string;
};

type InitialProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "SINGLE" | "VARIABLE";
  mainImage: string;
  gallery: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  collectionId: string;
  published: boolean;
  featured: boolean;
  newArrival: boolean;
  bestSelling: boolean;
  variants: VariantInput[];
};

const emptyVariant = (): VariantInput => ({
  colorName: "",
  colorHex: "#d6c4a6",
  size: "",
  sku: "",
  price: "",
  stock: "0",
  image: ""
});

export function AdminProductForm({
  collections,
  initial
}: {
  collections: Array<{ id: string; name: string }>;
  initial?: InitialProduct;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [type, setType] = useState<"SINGLE" | "VARIABLE">(
    initial?.type || "SINGLE"
  );
  const [mainImage, setMainImage] = useState(initial?.mainImage || "");
  const [galleryText, setGalleryText] = useState(
    initial?.gallery.join("\n") || ""
  );
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [collectionId, setCollectionId] = useState(
    initial?.collectionId || collections[0]?.id || ""
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [newArrival, setNewArrival] = useState(initial?.newArrival ?? false);
  const [bestSelling, setBestSelling] = useState(
    initial?.bestSelling ?? false
  );
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants.length ? initial.variants : [emptyVariant()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateVariant(
    index: number,
    field: keyof VariantInput,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);

    const payload = {
      title,
      slug: slug || slugify(title),
      description,
      type,
      mainImage,
      gallery: galleryText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      price: Number(data.get("price") || 0),
      compareAtPrice: data.get("compareAtPrice")
        ? Number(data.get("compareAtPrice"))
        : null,
      stock: Number(data.get("stock") || 0),
      sku: String(data.get("sku") || "") || null,
      collectionId,
      published,
      featured,
      newArrival,
      bestSelling,
      variants:
        type === "VARIABLE"
          ? variants.map((variant) => ({
              colorName: variant.colorName || null,
              colorHex: variant.colorHex || null,
              size: variant.size || null,
              sku: variant.sku || null,
              price: variant.price ? Number(variant.price) : null,
              stock: Number(variant.stock || 0),
              image: variant.image || null
            }))
          : []
    };

    const response = await fetch(
      initial ? `/api/admin/products/${initial.id}` : "/api/admin/products",
      {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error || "Product could not be saved.");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Product information</h2>
            <p>Title, description, collection, images, and base pricing.</p>
          </div>
        </div>

        <div className="admin-form-grid">
          <label className="full-field">
            Product title
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!initial) setSlug(slugify(event.target.value));
              }}
              required
            />
          </label>
          <label>
            URL slug
            <input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              required
            />
          </label>
          <label>
            Collection
            <select
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              required
            >
              {collections.map((collection) => (
                <option value={collection.id} key={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label className="full-field">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={7}
            />
          </label>
          <label>
            Base price (PKR)
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.price || 0}
              required
            />
          </label>
          <label>
            Compare-at price
            <input
              name="compareAtPrice"
              type="number"
              min="0"
              step="1"
              defaultValue={initial?.compareAtPrice || ""}
            />
          </label>
          <label>
            SKU
            <input name="sku" defaultValue={initial?.sku || ""} />
          </label>
          <label>
            Product mode
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "SINGLE" | "VARIABLE")
              }
            >
              <option value="SINGLE">Single product</option>
              <option value="VARIABLE">Variable product</option>
            </select>
          </label>
          {type === "SINGLE" ? (
            <label>
              Stock quantity
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={initial?.stock || 0}
                required
              />
            </label>
          ) : (
            <input type="hidden" name="stock" value="0" />
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Product images</h2>
            <p>
              {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
              process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                ? "Upload through Cloudinary or paste a public/local image URL."
                : "Upload through Vercel Blob or paste a public/local image URL."}
            </p>
          </div>
        </div>
        <ImageField
          label="Main product image"
          value={mainImage}
          onChange={setMainImage}
          required
        />
        <label className="full-field">
          Gallery images
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={galleryUploading}
            >
              {galleryUploading ? "Uploading..." : "Upload gallery image"}
            </button>
            <input
              hidden
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setGalleryUploading(true);
                setError("");
                const uploaded: string[] = [];
                try {
                  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                  for (const file of files) {
                    let url = "";
                    if (cloudName && uploadPreset) {
                      const cloudData = new FormData();
                      cloudData.append("file", file);
                      cloudData.append("upload_preset", uploadPreset);
                      const cloudResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                        method: "POST",
                        body: cloudData
                      });
                      const cloudJson = await cloudResp.json();
                      if (cloudResp.ok && cloudJson.secure_url) {
                        url = cloudJson.secure_url;
                      }
                    }
                    if (!url) {
                      const data = new FormData();
                      data.append("file", file);
                      const resp = await fetch("/api/admin/upload", { method: "POST", body: data });
                      const json = await resp.json();
                      if (!resp.ok || !json.url) throw new Error(json.error || "Upload failed");
                      url = json.url;
                    }
                    uploaded.push(url);
                  }
                  setGalleryText((cur) => (cur ? `${cur}\n${uploaded.join("\n")}` : uploaded.join("\n")));
                } catch (err: any) {
                  setError(err?.message || "Gallery upload failed");
                } finally {
                  setGalleryUploading(false);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
          <textarea
            value={galleryText}
            onChange={(event) => setGalleryText(event.target.value)}
            rows={5}
            placeholder="One image URL per line"
          />

          {/* Thumbnails preview and remove */}
          <div className="gallery-thumbs" style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {galleryText
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((url, idx) => (
                <div key={idx} className="thumb" style={{ position: "relative", width: 96, height: 96, border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}>
                  <img src={url} alt={`gallery-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    className="admin-icon-danger"
                    onClick={() => setGalleryText((cur) => cur.split("\n").filter((u) => u.trim() && u.trim() !== url).join("\n"))}
                    style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,0.9)", borderRadius: 4, padding: 4 }}
                    aria-label="Remove image"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </label>
      </section>

      {type === "VARIABLE" ? (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2>Colour and size variants</h2>
              <p>
                Colours appear as circles on the storefront. Each colour/size
                combination has independent price and stock.
              </p>
            </div>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() =>
                setVariants((current) => [...current, emptyVariant()])
              }
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>

          <div className="variant-list">
            {variants.map((variant, index) => (
              <div className="variant-row" key={index}>
                <label>
                  Colour name
                  <input
                    value={variant.colorName}
                    onChange={(event) =>
                      updateVariant(index, "colorName", event.target.value)
                    }
                    placeholder="Emerald"
                  />
                </label>
                <label>
                  Colour
                  <input
                    type="color"
                    value={variant.colorHex}
                    onChange={(event) =>
                      updateVariant(index, "colorHex", event.target.value)
                    }
                  />
                </label>
                <label>
                  Size
                  <input
                    value={variant.size}
                    onChange={(event) =>
                      updateVariant(index, "size", event.target.value)
                    }
                    placeholder="S, M, L"
                  />
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(index, "price", event.target.value)
                    }
                    placeholder="Uses base price"
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  SKU
                  <input
                    value={variant.sku}
                    onChange={(event) =>
                      updateVariant(index, "sku", event.target.value)
                    }
                  />
                </label>
                <label className="variant-image-url">
                  Variant image URL
                  <input
                    value={variant.image}
                    onChange={(event) =>
                      updateVariant(index, "image", event.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="admin-icon-danger"
                  onClick={() =>
                    setVariants((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  disabled={variants.length === 1}
                  aria-label="Remove variant"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Storefront placement</h2>
            <p>Control visibility and homepage product sections.</p>
          </div>
        </div>
        <div className="admin-checkbox-grid">
          <label>
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            Published
          </label>
          <label>
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            Featured product
          </label>
          <label>
            <input
              type="checkbox"
              checked={newArrival}
              onChange={(event) => setNewArrival(event.target.checked)}
            />
            New arrival
          </label>
          <label>
            <input
              type="checkbox"
              checked={bestSelling}
              onChange={(event) => setBestSelling(event.target.checked)}
            />
            Best selling
          </label>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </button>
        <button className="admin-primary-button" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="spin" size={17} />
              Saving...
            </>
          ) : initial ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}
