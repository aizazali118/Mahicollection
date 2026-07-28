import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Admin Login"
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <img src="/logo.png" alt="Mahi Collection" />
        <p className="eyebrow">Secure administration</p>
        <h1>Admin sign in</h1>
        <p>Manage products, collections, orders, coupons, and store content.</p>
        <LoginForm adminOnly />
        <small>
          Demo username: <strong>mahiadmin</strong>
        </small>
      </div>
    </section>
  );
}
