"use client";

import { useEffect, useState } from "react";

export default function AccountProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || ""),
          username: String(fd.get("username") || ""),
          email: String(fd.get("email") || "")
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setUser(json.user);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile…</p>;
  if (!user) return <p>Please sign in to edit your profile.</p>;

  return (
    <form className="auth-form" onSubmit={save}>
      <label>
        Full name
        <input name="name" defaultValue={user.name} required />
      </label>
      <label>
        Username
        <input name="username" defaultValue={user.username || ""} />
      </label>
      <label>
        Email address
        <input name="email" type="email" defaultValue={user.email} required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-dark" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
      <p>
        To change your password, use the <a href="/reset-password">reset link</a> or the change password form in your account.
      </p>
    </form>
  );
}
