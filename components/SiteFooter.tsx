"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type FooterSettings = {
  contactPhone: string;
  contactEmail: string;
  address: string;
  about: string;
};

export function SiteFooter({ settings }: { settings: FooterSettings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo.png" alt="Mahi Collection" />
          <p>{settings.about}</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/shop">All Products</Link>
          <Link href="/shop?sort=newest">New Arrivals</Link>
          <Link href="/shop?sort=best-selling">Best Selling</Link>
          <Link href="/cart">Shopping Bag</Link>
        </div>
        <div>
          <h3>Information</h3>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/shipping-policy">Shipping Policy</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
        </div>
        <div>
          <h3>Visit & Contact</h3>
          <p>{settings.address}</p>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
          <a href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          <p className="footer-note">Cash on delivery available in Pakistan.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Mahi Collection.</span>
        <span>Designed for graceful everyday dressing.</span>
      </div>
    </footer>
  );
}
