"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { passwordRequirementsMessage } from "@/lib/password-policy";

export function LoginForm({ adminOnly = false }: { adminOnly?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: String(data.get("identifier") || ""),
        password: String(data.get("password") || ""),
        adminOnly
      })
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error || "Login failed.");
      setLoading(false);
      return;
    }

    router.push(adminOnly ? "/admin" : "/account");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Email or username
        <input
          name="identifier"
          required
          autoComplete="username"
          placeholder={adminOnly ? "mahiadmin" : "you@example.com"}
        />
      </label>
      <label className="password-field">
        Password
        <div className="password-field__wrap">
          <input
            name="password"
            type={passwordVisible ? "text" : "password"}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-dark button-block" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="spin" size={18} />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
      {!adminOnly ? (
        <>
          <p className="auth-switch">
            New to Mahi Collection? <Link href="/register">Create an account</Link>
          </p>
          <p className="auth-switch">
            <Link href="/reset-password">Reset password</Link>
          </p>
        </>
      ) : null}
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/.test(password)) {
      setError(passwordRequirementsMessage);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") || ""),
        username: String(data.get("username") || ""),
        email: String(data.get("email") || ""),
        password
      })
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error || "Registration failed.");
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Full name
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Username
        <input
          name="username"
          required
          minLength={3}
          pattern="[A-Za-z0-9_-]+"
          autoComplete="username"
          placeholder="mahilover"
        />
      </label>
      <label>
        Email address
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="password-field">
        Password
        <div className="password-field__wrap">
          <input
            name="password"
            type={passwordVisible ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <label className="password-field">
        Confirm password
        <div className="password-field__wrap">
          <input
            name="confirmPassword"
            type={confirmVisible ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setConfirmVisible((current) => !current)}
            aria-label={confirmVisible ? "Hide password" : "Show password"}
          >
            {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <p className="form-message">{passwordRequirementsMessage}</p>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-dark button-block" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="spin" size={18} />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
      <p className="auth-switch">
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
