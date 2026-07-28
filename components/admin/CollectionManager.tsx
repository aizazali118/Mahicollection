"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { slugify } from "@/lib/slugify";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  featured: boolean;
  displayOrder: number;
  productCount: number;
};

const empty = {
  id: "",
  name: "",
  slug: "",
  description: "",
  image: "",
  featured: true,
  displayOrder: 0
};

export function CollectionManager({
  collections
}: {
  collections: CollectionItem[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function edit(item: CollectionItem) {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      image: item.image,
      featured: item.featured,
      displayOrder: item.displayOrder
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(
      form.id ? `/api/admin/collections/${form.id}` : "/api/admin/collections",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || null,
          image: form.image,
          featured: form.featured,
          displayOrder: Number(form.displayOrder)
        })
      }
    );
    const result = (await response.json()) as { error?: string };
    setSaving(false);

    if (!response.ok) {
      setError(result.error || "Collection could not be saved.");
      return;
    }

    setForm(empty);
    router.refresh();
  }

  async function remove(item: CollectionItem) {
    if (
      !window.confirm(
        `Delete “${item.name}”? Collections with products cannot be deleted.`
      )
    )
      return;
    const response = await fetch(`/api/admin/collections/${item.id}`, {
      method: "DELETE"
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      window.alert(result.error || "Collection could not be deleted.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-two-column">
      <form className="admin-panel admin-form sticky-panel" onSubmit={submit}>
        <div className="admin-panel__head">
          <div>
            <h2>{form.id ? "Edit collection" : "Add collection"}</h2>
            <p>
              Menu and homepage collection sections update automatically.
            </p>
          </div>
        </div>
        <label>
          Collection name
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
                slug: current.id ? current.slug : slugify(event.target.value)
              }))
            }
            required
          />
        </label>
        <label>
          URL slug
          <input
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                slug: slugify(event.target.value)
              }))
            }
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            rows={4}
          />
        </label>
        <ImageField
          label="Collection image"
          value={form.image}
          onChange={(image) =>
            setForm((current) => ({ ...current, image }))
          }
          required
        />
        <label>
          Display order
          <input
            type="number"
            value={form.displayOrder}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayOrder: Number(event.target.value)
              }))
            }
          />
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                featured: event.target.checked
              }))
            }
          />
          Show on homepage
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
            {saving ? "Saving..." : form.id ? "Update" : "Add Collection"}
          </button>
        </div>
      </form>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>All collections</h2>
            <p>
              The first four appear as a grid; additional collections become a
              slider automatically.
            </p>
          </div>
        </div>
        <div className="admin-card-list">
          {collections.map((item) => (
            <article className="admin-media-card" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{item.description || "No description"}</p>
                <small>
                  {item.productCount} product{item.productCount === 1 ? "" : "s"} ·
                  Order {item.displayOrder} ·{" "}
                  {item.featured ? "Homepage" : "Menu only"}
                </small>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => edit(item)}
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={() => remove(item)}
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
