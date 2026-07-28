"use client";

import {
  BadgePercent,
  Boxes,
  CircleGauge,
  Contact,
  Images,
  LogOut,
  Menu,
  MessageSquareText,
  PackageCheck,
  Settings,
  ShoppingBag,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: CircleGauge },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/collections", label: "Collections", icon: Boxes },
  { href: "/admin/slides", label: "Hero Slides", icon: Images },
  { href: "/admin/coupons", label: "Coupons", icon: BadgePercent },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
  { href: "/admin/messages", label: "Messages", icon: Contact },
  { href: "/admin/settings", label: "Store Settings", icon: Settings }
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
      >
        <Menu size={21} />
      </button>
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <button
          type="button"
          className="admin-sidebar__close"
          onClick={() => setOpen(false)}
          aria-label="Close admin navigation"
        >
          <X size={20} />
        </button>
        <Link href="/admin" className="admin-brand" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Mahi Collection" />
          <span>Admin Panel</span>
        </Link>
        <nav>
          {links.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={active ? "is-active" : ""}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar__footer">
          <span>
            Signed in as
            <strong>{userName}</strong>
          </span>
          <button type="button" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
          <Link href="/" target="_blank">
            View Store
          </Link>
        </div>
      </aside>
      {open ? (
        <button
          className="admin-sidebar-backdrop"
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close admin navigation"
        />
      ) : null}
    </>
  );
}
