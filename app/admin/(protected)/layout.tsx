import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminSidebar userName={user.name} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
