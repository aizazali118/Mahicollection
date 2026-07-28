import { RegisterForm } from "@/components/AuthForm";

export const metadata = {
  title: "Create Account"
};

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-visual">
        <img src="/demo/hero-2.jpg" alt="" />
        <div>
          <p className="eyebrow">Join the community</p>
          <h1>Save your details and share your product experience.</h1>
        </div>
      </div>
      <div className="auth-panel">
        <div>
          <p className="eyebrow">Mahi Collection</p>
          <h2>Create an account</h2>
          <p>Registration is free and takes less than a minute.</p>
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
