import type { ProductCardData } from "@/lib/serializers";

export const demoMode = process.env.DEMO_MODE === "true";

export const demoSettings = {
  announcement: "Summer Edit is live — complimentary delivery on orders over Rs. 10,000",
  contactPhone: "+92 300 0000000",
  contactEmail: "hello@mahicollection.pk",
  address: "Pakistan",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  about:
    "Mahi Collection celebrates graceful Pakistani silhouettes with thoughtful details, wearable colour, and effortless comfort."
};

export const demoCollections = [
  {
    id: "summer",
    name: "Summer",
    slug: "summer",
    description: "Lightweight silhouettes for warm, effortless days.",
    image: "/demo/collection-summer.jpg"
  },
  {
    id: "embroidered",
    name: "Embroidered",
    slug: "embroidered",
    description: "Artful threadwork for elevated everyday dressing.",
    image: "/demo/collection-embroidered.jpg"
  },
  {
    id: "printed",
    name: "Printed",
    slug: "printed",
    description: "Fresh patterns and expressive seasonal colour.",
    image: "/demo/collection-printed.jpg"
  },
  {
    id: "lawn",
    name: "Lawn",
    slug: "lawn",
    description: "Breathable Pakistani lawn designed for modern wardrobes.",
    image: "/demo/collection-lawn.jpg"
  }
];

export const demoSlides = [
  {
    id: "summer-edit",
    title: "The Summer Edit",
    subtitle:
      "Breathable lawn, soft colour, and graceful silhouettes made for luminous days.",
    image: "/demo/hero-1.jpg",
    buttonText: "Shop New Arrivals",
    buttonLink: "/shop?sort=newest"
  },
  {
    id: "embroidered-edit",
    title: "Quiet Luxury, Beautifully Embroidered",
    subtitle:
      "Thoughtful threadwork and modern cuts for celebrations, gatherings, and everything between.",
    image: "/demo/hero-2.jpg",
    buttonText: "Explore Embroidered",
    buttonLink: "/shop?collection=embroidered"
  },
  {
    id: "lawn-edit",
    title: "Rich Colour. Effortless Grace.",
    subtitle:
      "Discover polished three-piece looks designed to move beautifully from day to evening.",
    image: "/demo/hero-3.jpg",
    buttonText: "Shop Lawn",
    buttonLink: "/shop?collection=lawn"
  }
];

function product(
  id: string,
  title: string,
  slug: string,
  collectionSlug: string,
  mainImage: string,
  hoverImage: string,
  price: number,
  compareAtPrice: number | null,
  variable = false
): ProductCardData {
  const collection = demoCollections.find((item) => item.slug === collectionSlug)!;
  return {
    id,
    title,
    slug,
    description:
      "A graceful Mahi Collection ensemble crafted in breathable fabric with thoughtful details and an effortlessly polished silhouette.",
    type: variable ? "VARIABLE" : "SINGLE",
    mainImage,
    hoverImage,
    price,
    compareAtPrice,
    stock: variable ? 0 : 18,
    collectionName: collection.name,
    collectionSlug,
    variants: variable
      ? ["S", "M", "L"].map((size, index) => ({
          id: `${id}-${size.toLowerCase()}`,
          colorName: collectionSlug === "lawn" ? "Emerald" : "Ivory",
          colorHex: collectionSlug === "lawn" ? "#0E5A49" : "#F4E7C9",
          size,
          price: index === 2 ? price + 300 : price,
          stock: 5 + index,
          image: null
        }))
      : []
  };
}

export const demoProducts: ProductCardData[] = [
  product("ayla", "Ayla Blue Lawn Co-ord", "ayla-blue-lawn-co-ord", "lawn", "/demo/product-blue-lawn.jpg", "/demo/product-blue-lawn-detail.jpg", 6999, 7799),
  product("noor", "Noor Ivory Embroidered Suit", "noor-ivory-embroidered-suit", "embroidered", "/demo/product-ivory-embroidered.jpg", "/demo/product-ivory-embroidered-detail.jpg", 8499, 9499, true),
  product("mehr", "Mehr Emerald Three Piece", "mehr-emerald-three-piece", "lawn", "/demo/product-emerald-lawn.jpg", "/demo/product-emerald-lawn-detail.jpg", 6999, null, true),
  product("zara", "Zara Midnight Summer Suit", "zara-midnight-summer-suit", "summer", "/demo/product-summer.jpg", "/demo/product-summer-detail.jpg", 6499, 7299),
  product("elara", "Elara Pastel Embroidered Set", "elara-pastel-embroidered-set", "embroidered", "/demo/product-embroidered.jpg", "/demo/product-embroidered-detail.jpg", 7999, 8999, true),
  product("saira", "Saira Rose Printed Kurta", "saira-rose-printed-kurta", "printed", "/demo/product-printed.jpg", "/demo/product-printed-detail.jpg", 4999, null),
  product("abeer", "Abeer Lime Chikankari Suit", "abeer-lime-chikankari-suit", "lawn", "/demo/product-lawn.jpg", "/demo/product-lawn-detail.jpg", 7499, 8299, true)
];

export function findDemoProduct(slug: string) {
  return demoProducts.find((item) => item.slug === slug);
}
