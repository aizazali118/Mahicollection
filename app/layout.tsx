import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store";
import {
  demoCollections,
  demoMode,
  demoSettings
} from "@/lib/demo-store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mahi Collection | Pakistani Women’s Clothing",
    template: "%s | Mahi Collection"
  },
  description:
    "Shop graceful lawn, embroidered, printed, and seasonal Pakistani women’s clothing from Mahi Collection.",
  icons: {
    icon: "/logo.png"
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collections, settings, user] = demoMode
    ? [demoCollections, demoSettings, null]
    : await Promise.all([
        prisma.collection.findMany({
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
          select: { name: true, slug: true }
        }),
        getStoreSettings(),
        getCurrentUser()
      ]);

  return (
    <html lang="en">
      <body>
        <CartProvider>
          <StoreHeader
            collections={collections}
            settings={{
              announcement: settings.announcement,
              contactPhone: settings.contactPhone,
              contactEmail: settings.contactEmail,
              facebook: settings.facebook,
              instagram: settings.instagram,
              tiktok: settings.tiktok
            }}
            user={
              user
                ? { id: user.id, name: user.name, role: user.role }
                : null
            }
          />
          <main>{children}</main>
          <SiteFooter
            settings={{
              contactPhone: settings.contactPhone,
              contactEmail: settings.contactEmail,
              address: settings.address,
              about: settings.about
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
