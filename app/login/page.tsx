import { LoginForm } from "@/components/AuthForm";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-visual">
        <img src="/demo/hero-3.jpg" alt="" />
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Your Mahi wardrobe, all in one place.</h1>
        </div>
      </div>
      <div className="auth-panel">
        <div>
          <p className="eyebrow">Customer account</p>
          <h2>Sign in</h2>
          <p>View your orders and leave product reviews.</p>
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
