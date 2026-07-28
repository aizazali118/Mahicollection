"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

type SlideItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  displayOrder: number;
};

const empty = {
  id: "",
  title: "",
  subtitle: "",
  image: "",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  active: true,
  displayOrder: 0
};

export function SlideManager({ slides }: { slides: SlideItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function edit(slide: SlideItem) {
    setForm(slide);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(
      form.id ? `/api/admin/slides/${form.id}` : "/api/admin/slides",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          image: form.image,
          buttonText: form.buttonText,
          buttonLink: form.buttonLink,
          active: form.active,
          displayOrder: Number(form.displayOrder)
        })
      }
    );
    const data = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Slide could not be saved.");
      return;
    }
    setForm(empty);
    router.refresh();
  }

  async function remove(slide: SlideItem) {
    if (!window.confirm(`Delete hero slide “${slide.title}”?`)) return;
    const response = await fetch(`/api/admin/slides/${slide.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error || "Slide could not be deleted.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-two-column">
      <form className="admin-panel admin-form sticky-panel" onSubmit={submit}>
        <div className="admin-panel__head">
          <div>
            <h2>{form.id ? "Edit hero slide" : "Add hero slide"}</h2>
            <p>Maximum five slides. Dots and automatic movement are built in.</p>
          </div>
        </div>
        <label>
          Heading
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
          />
        </label>
        <label>
          Supporting text
          <textarea
            value={form.subtitle}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                subtitle: event.target.value
              }))
            }
            rows={4}
            required
          />
        </label>
        <ImageField
          label="Wide slide image"
          value={form.image}
          onChange={(image) =>
            setForm((current) => ({ ...current, image }))
          }
          required
        />
        <label>
          Button text
          <input
            value={form.buttonText}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                buttonText: event.target.value
              }))
            }
            required
          />
        </label>
        <label>
          Button link
          <input
            value={form.buttonLink}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                buttonLink: event.target.value
              }))
            }
            required
          />
        </label>
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
            checked={form.active}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                active: event.target.checked
              }))
            }
          />
          Active on storefront
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
            {saving ? "Saving..." : form.id ? "Update Slide" : "Add Slide"}
          </button>
        </div>
      </form>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Current slides ({slides.length}/5)</h2>
            <p>Drag ordering is not required; set the numeric display order.</p>
          </div>
        </div>
        <div className="admin-card-list">
          {slides.map((slide) => (
            <article className="admin-media-card admin-slide-card" key={slide.id}>
              <img src={slide.image} alt={slide.title} />
              <div>
                <h3>{slide.title}</h3>
                <p>{slide.subtitle}</p>
                <small>
                  Order {slide.displayOrder} ·{" "}
                  {slide.active ? "Active" : "Inactive"}
                </small>
              </div>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => edit(slide)}
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={() => remove(slide)}
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
