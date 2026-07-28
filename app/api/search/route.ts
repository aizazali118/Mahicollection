import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoMode, demoProducts } from "@/lib/demo-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  if (query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  if (demoMode) {
    const products = demoProducts
      .filter((product) =>
        `${product.title} ${product.description} ${product.collectionName}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .slice(0, 8)
      .map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        mainImage: product.mainImage,
        price: product.price,
        collection: product.collectionName
      }));
    return NextResponse.json({ products });
  }

  const products = await prisma.product.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        {
          collection: {
            name: { contains: query, mode: "insensitive" }
          }
        }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      mainImage: true,
      price: true,
      collection: { select: { name: true } }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      mainImage: product.mainImage,
      price: Number(product.price),
      collection: product.collection.name
    }))
  });
}
