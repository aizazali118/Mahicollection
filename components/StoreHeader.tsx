"use client";

import {
  Facebook,
  Instagram,
  LogOut,
  Menu,
  Music2,
  Search,
  ShoppingBag,
  UserRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { SearchOverlay } from "@/components/SearchOverlay";

type HeaderCollection = {
  name: string;
  slug: string;
};

type HeaderSettings = {
  announcement: string;
  contactPhone: string;
  contactEmail: string;
  facebook: string;
  instagram: string;
  tiktok: string;
};

type HeaderUser = {
  id: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
} | null;

export function StoreHeader({
  collections,
  settings,
  user
}: {
  collections: HeaderCollection[];
  settings: HeaderSettings;
  user: HeaderUser;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-track" aria-label={settings.announcement}>
          <span>{settings.announcement}</span>
          <span aria-hidden="true">✦</span>
          <span>{settings.announcement}</span>
          <span aria-hidden="true">✦</span>
          <span>{settings.announcement}</span>
          <span aria-hidden="true">✦</span>
          <span>{settings.announcement}</span>
        </div>
      </div>

      <div className="top-bar">
        <div className="container top-bar__inner">
          <div className="top-contact">
            <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
            <span />
            <a href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </div>
          <div className="social-links" aria-label="Social links">
            <a href={settings.facebook} target="_blank" rel="noreferrer">
              <Facebook size={15} />
              <span className="sr-only">Facebook</span>
            </a>
            <a href={settings.tiktok} target="_blank" rel="noreferrer">
              <Music2 size={15} />
              <span className="sr-only">TikTok</span>
            </a>
            <a href={settings.instagram} target="_blank" rel="noreferrer">
              <Instagram size={15} />
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container nav-grid">
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <Link href="/" className="brand-logo" aria-label="Mahi Collection">
            <img src="/logo.png" alt="Mahi Collection" />
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <div className="nav-dropdown">
              <button type="button">Collections</button>
              <div className="nav-dropdown__menu">
                {collections.map((collection) => (
                  <Link
                    href={`/shop?collection=${collection.slug}`}
                    key={collection.slug}
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <button
              className="nav-action"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={21} />
            </button>
            <Link className="nav-action cart-action" href="/cart">
              <ShoppingBag size={21} />
              {count > 0 ? <span>{count}</span> : null}
              <span className="sr-only">Cart</span>
            </Link>
            {user ? (
              <div className="account-menu">
                <Link
                  className="nav-action nav-account"
                  href={user.role === "ADMIN" ? "/admin" : "/account"}
                >
                  <UserRound size={20} />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button type="button" onClick={logout} aria-label="Log out">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link className="nav-action" href="/login" aria-label="Login">
                <UserRound size={21} />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${mobileOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="mobile-drawer__backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
        <aside>
          <div className="mobile-drawer__head">
            <img src="/logo.png" alt="Mahi Collection" />
            <button
              type="button"
              className="icon-button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
          <nav>
            <Link href="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/shop" onClick={() => setMobileOpen(false)}>
              Shop All
            </Link>
            <p>Collections</p>
            {collections.map((collection) => (
              <Link
                href={`/shop?collection=${collection.slug}`}
                key={collection.slug}
                onClick={() => setMobileOpen(false)}
              >
                {collection.name}
              </Link>
            ))}
            <Link href="/about" onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              Contact Us
            </Link>
          </nav>
          <div className="mobile-drawer__footer">
            <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
            <a href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </div>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
