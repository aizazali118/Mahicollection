"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { passwordRequirementsMessage } from "@/lib/password-policy";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const result = (await response.json()) as { error?: string; message?: string };
    setLoading(false);

    if (!response.ok) {
      setError(result.error || passwordRequirementsMessage);
      return;
    }

    setSuccess(result.message || "Password updated successfully.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <section className="section container auth-panel">
      <div>
        <p className="eyebrow">Account security</p>
        <h2>Set a new password</h2>
        <p>{passwordRequirementsMessage}</p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            New password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}
          <button className="button button-dark button-block" disabled={loading || !token}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
