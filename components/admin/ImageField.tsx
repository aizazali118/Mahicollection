"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export function ImageField({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const canUseCloudinary = Boolean(cloudName && uploadPreset);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      // Prefer Cloudinary unsigned uploads if configured via NEXT_PUBLIC_ env vars
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
          onChange(cloudJson.secure_url);
          return;
        }
        // fallthrough to server upload if cloudinary fails
      }

      const data = new FormData();
      data.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: data
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setError(result.error || "Upload failed. You can still paste a public image URL below.");
        return;
      }
      onChange(result.url);
    } catch (e) {
      setError("Upload failed. You can still paste a public image URL below.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-image-field">
      <label>
        {label}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder="/demo/image.jpg or https://..."
        />
      </label>
      <div className="admin-image-field__row">
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="spin" size={17} />
          ) : (
            <ImagePlus size={17} />
          )}
          {uploading
            ? "Uploading..."
            : canUseCloudinary
            ? "Upload to Cloudinary"
            : "Upload image"}
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
          }}
        />
        {value ? <img src={value} alt="Selected preview" /> : null}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
