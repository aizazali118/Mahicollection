import { PrismaClient, ProductType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    title: "Ayla Blue Lawn Co-ord",
    slug: "ayla-blue-lawn-co-ord",
    description:
      "A graceful two-piece lawn co-ord with delicate botanical motifs, a relaxed straight shirt, and matching trousers. Designed for polished everyday wear in warm weather.",
    type: ProductType.SINGLE,
    mainImage: "/demo/product-blue-lawn.jpg",
    gallery: ["/demo/product-blue-lawn-detail.jpg"],
    price: 6999,
    compareAtPrice: 7799,
    stock: 18,
    sku: "MC-AYLA-BLUE",
    collection: "lawn",
    newArrival: true,
    bestSelling: true,
    featured: true
  },
  {
    title: "Noor Ivory Embroidered Suit",
    slug: "noor-ivory-embroidered-suit",
    description:
      "A refined ivory two-piece suit finished with pastel floral embroidery and scalloped sleeve details. Soft, feminine, and suitable for daytime gatherings.",
    type: ProductType.VARIABLE,
    mainImage: "/demo/product-ivory-embroidered.jpg",
    gallery: ["/demo/product-ivory-embroidered-detail.jpg"],
    price: 8499,
    compareAtPrice: 9499,
    stock: 0,
    sku: "MC-NOOR-IVORY",
    collection: "embroidered",
    newArrival: true,
    bestSelling: true,
    featured: true,
    variants: [
      { colorName: "Ivory", colorHex: "#F4E7C9", size: "S", stock: 7, price: 8499 },
      { colorName: "Ivory", colorHex: "#F4E7C9", size: "M", stock: 8, price: 8499 },
      { colorName: "Ivory", colorHex: "#F4E7C9", size: "L", stock: 5, price: 8799 }
    ]
  },
  {
    title: "Mehr Emerald Three Piece",
    slug: "mehr-emerald-three-piece",
    description:
      "A statement three-piece lawn suit in deep emerald with tonal embroidery, wide-leg trousers, and a flowing printed dupatta.",
    type: ProductType.VARIABLE,
    mainImage: "/demo/product-emerald-lawn.jpg",
    gallery: ["/demo/product-emerald-lawn-detail.jpg"],
    price: 6999,
    compareAtPrice: null,
    stock: 0,
    sku: "MC-MEHR-EMERALD",
    collection: "lawn",
    newArrival: true,
    bestSelling: true,
    featured: true,
    variants: [
      { colorName: "Emerald", colorHex: "#0E5A49", size: "S", stock: 4, price: 6999 },
      { colorName: "Emerald", colorHex: "#0E5A49", size: "M", stock: 9, price: 6999 },
      { colorName: "Emerald", colorHex: "#0E5A49", size: "L", stock: 6, price: 7299 }
    ]
  },
  {
    title: "Zara Midnight Summer Suit",
    slug: "zara-midnight-summer-suit",
    description:
      "A breathable summer suit in midnight teal with fine all-over motifs and a richly printed dupatta for an effortlessly coordinated look.",
    type: ProductType.SINGLE,
    mainImage: "/demo/product-summer.jpg",
    gallery: ["/demo/product-summer-detail.jpg"],
    price: 6499,
    compareAtPrice: 7299,
    stock: 22,
    sku: "MC-ZARA-MIDNIGHT",
    collection: "summer",
    newArrival: true,
    bestSelling: false,
    featured: false
  },
  {
    title: "Elara Pastel Embroidered Set",
    slug: "elara-pastel-embroidered-set",
    description:
      "A soft pastel ensemble with floral embroidery, elegant scalloped neckline details, and an airy printed dupatta.",
    type: ProductType.VARIABLE,
    mainImage: "/demo/product-embroidered.jpg",
    gallery: ["/demo/product-embroidered-detail.jpg"],
    price: 7999,
    compareAtPrice: 8999,
    stock: 0,
    sku: "MC-ELARA-PASTEL",
    collection: "embroidered",
    newArrival: false,
    bestSelling: true,
    featured: true,
    variants: [
      { colorName: "Lemon", colorHex: "#EFE7A9", size: "S", stock: 6, price: 7999 },
      { colorName: "Lemon", colorHex: "#EFE7A9", size: "M", stock: 8, price: 7999 },
      { colorName: "Lemon", colorHex: "#EFE7A9", size: "L", stock: 3, price: 8299 }
    ]
  },
  {
    title: "Saira Rose Printed Kurta",
    slug: "saira-rose-printed-kurta",
    description:
      "A contemporary printed kurta in soft rose with artisan-inspired motifs and a comfortable silhouette made for everyday elegance.",
    type: ProductType.SINGLE,
    mainImage: "/demo/product-printed.jpg",
    gallery: ["/demo/product-printed-detail.jpg"],
    price: 4999,
    compareAtPrice: null,
    stock: 25,
    sku: "MC-SAIRA-ROSE",
    collection: "printed",
    newArrival: true,
    bestSelling: false,
    featured: false
  },
  {
    title: "Abeer Lime Chikankari Suit",
    slug: "abeer-lime-chikankari-suit",
    description:
      "A luminous lime lawn suit with light-toned chikankari-inspired embroidery, flowing sleeves, and a flattering V neckline.",
    type: ProductType.VARIABLE,
    mainImage: "/demo/product-lawn.jpg",
    gallery: ["/demo/product-lawn-detail.jpg"],
    price: 7499,
    compareAtPrice: 8299,
    stock: 0,
    sku: "MC-ABEER-LIME",
    collection: "lawn",
    newArrival: false,
    bestSelling: true,
    featured: false,
    variants: [
      { colorName: "Lime", colorHex: "#C9D77A", size: "S", stock: 5, price: 7499 },
      { colorName: "Lime", colorHex: "#C9D77A", size: "M", stock: 7, price: 7499 },
      { colorName: "Lime", colorHex: "#C9D77A", size: "L", stock: 5, price: 7799 }
    ]
  }
];

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "mahi@1217";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL || "admin@mahicollection.pk" },
    create: {
      name: "Mahi Admin",
      username: process.env.SEED_ADMIN_USERNAME || "mahiadmin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@mahicollection.pk",
      passwordHash,
      role: UserRole.ADMIN
    },
    update: {
      name: "Mahi Admin",
      username: process.env.SEED_ADMIN_USERNAME || "mahiadmin",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.storeSetting.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      announcement:
        "Summer Edit is live — complimentary delivery on orders over Rs. 10,000",
      contactPhone: "+92 300 0000000",
      contactEmail: "hello@mahicollection.pk",
      address: "Pakistan",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      whatsappNumber: "923359574017",
      currency: "PKR",
      shippingFlatRate: 250,
      freeShippingThreshold: 10000,
      about:
        "Mahi Collection celebrates graceful Pakistani silhouettes with thoughtful details, wearable colour, and effortless comfort."
    },
    update: {}
  });

  const collectionData = [
    {
      name: "Summer",
      slug: "summer",
      description: "Lightweight silhouettes for warm, effortless days.",
      image: "/demo/collection-summer.jpg",
      displayOrder: 1
    },
    {
      name: "Embroidered",
      slug: "embroidered",
      description: "Artful threadwork for elevated everyday dressing.",
      image: "/demo/collection-embroidered.jpg",
      displayOrder: 2
    },
    {
      name: "Printed",
      slug: "printed",
      description: "Fresh patterns and expressive seasonal colour.",
      image: "/demo/collection-printed.jpg",
      displayOrder: 3
    },
    {
      name: "Lawn",
      slug: "lawn",
      description: "Breathable Pakistani lawn designed for modern wardrobes.",
      image: "/demo/collection-lawn.jpg",
      displayOrder: 4
    }
  ];

  const collectionIds = new Map<string, string>();
  for (const item of collectionData) {
    const collection = await prisma.collection.upsert({
      where: { slug: item.slug },
      create: { ...item, featured: true },
      update: { ...item, featured: true }
    });
    collectionIds.set(item.slug, collection.id);
  }

  for (const item of products) {
    const collectionId = collectionIds.get(item.collection);
    if (!collectionId) throw new Error(`Missing collection ${item.collection}`);

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        type: item.type,
        mainImage: item.mainImage,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        stock: item.stock,
        sku: item.sku,
        published: true,
        featured: item.featured,
        newArrival: item.newArrival,
        bestSelling: item.bestSelling,
        collectionId
      },
      update: {
        title: item.title,
        description: item.description,
        type: item.type,
        mainImage: item.mainImage,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        stock: item.stock,
        sku: item.sku,
        published: true,
        featured: item.featured,
        newArrival: item.newArrival,
        bestSelling: item.bestSelling,
        collectionId
      }
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: item.gallery.map((url, index) => ({
        productId: product.id,
        url,
        alt: item.title,
        displayOrder: index
      }))
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    if ("variants" in item && item.variants) {
      await prisma.productVariant.createMany({
        data: item.variants.map((variant) => ({
          productId: product.id,
          ...variant
        }))
      });
    }
  }

  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "The Summer Edit",
          subtitle:
            "Breathable lawn, soft colour, and graceful silhouettes made for luminous days.",
          image: "/demo/hero-1.jpg",
          buttonText: "Shop New Arrivals",
          buttonLink: "/shop?sort=newest",
          displayOrder: 1
        },
        {
          title: "Quiet Luxury, Beautifully Embroidered",
          subtitle:
            "Thoughtful threadwork and modern cuts for celebrations, gatherings, and everything between.",
          image: "/demo/hero-2.jpg",
          buttonText: "Explore Embroidered",
          buttonLink: "/shop?collection=embroidered",
          displayOrder: 2
        },
        {
          title: "Rich Colour. Effortless Grace.",
          subtitle:
            "Discover polished three-piece looks designed to move beautifully from day to evening.",
          image: "/demo/hero-3.jpg",
          buttonText: "Shop Lawn",
          buttonLink: "/shop?collection=lawn",
          displayOrder: 3
        }
      ]
    });
  }

  console.log("Mahi Collection database seeded successfully.");
  console.log(
    `Admin login: ${process.env.SEED_ADMIN_USERNAME || "mahiadmin"} / ${adminPassword}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
