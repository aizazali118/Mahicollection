import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductGrid } from "@/components/ProductGrid";
import { ReviewSection } from "@/components/ReviewSection";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProductCard } from "@/lib/serializers";
import {
  demoMode,
  demoProducts,
  findDemoProduct
} from "@/lib/demo-store";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (demoMode) {
    const product = findDemoProduct(slug);
    return product
      ? {
          title: product.title,
          description: product.description.slice(0, 155)
        }
      : { title: "Product Not Found" };
  }
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, description: true }
  });

  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description.slice(0, 155)
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (demoMode) {
    const product = findDemoProduct(slug);
    if (!product) notFound();
    const related = demoProducts
      .filter(
        (item) =>
          item.collectionSlug === product.collectionSlug &&
          item.id !== product.id
      )
      .slice(0, 8);
    return (
      <>
        <section className="section container product-page">
          <ProductDetails
            product={{
              ...product,
              images: product.hoverImage ? [product.hoverImage] : [],
              sku: `MC-${product.id.toUpperCase()}`
            }}
          />
        </section>
        {related.length ? (
          <section className="section container">
            <div className="section-heading">
              <p className="eyebrow">You may also love</p>
              <h2>Related products</h2>
            </div>
            <ProductGrid
              className="related-product-grid"
              products={related}
            />
          </section>
        ) : null}
      </>
    );
  }
  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        collection: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" } },
        variants: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } }
        }
      }
    }),
    getCurrentUser()
  ]);

  if (!product || !product.published) notFound();

  const related = await prisma.product.findMany({
    where: {
      published: true,
      collectionId: product.collectionId,
      id: { not: product.id }
    },
    include: {
      collection: { select: { name: true, slug: true } },
      images: { orderBy: { displayOrder: "asc" }, take: 1 },
      variants: true
    },
    orderBy: [{ bestSelling: "desc" }, { createdAt: "desc" }],
    take: 8
  });

  return (
    <>
      <section className="section container product-page">
        <ProductDetails
          product={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            description: product.description,
            type: product.type,
            mainImage: product.mainImage,
            images: product.images.map((image) => image.url),
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice
              ? Number(product.compareAtPrice)
              : null,
            stock: product.stock,
            sku: product.sku,
            collectionName: product.collection.name,
            variants: product.variants.map((variant) => ({
              id: variant.id,
              colorName: variant.colorName,
              colorHex: variant.colorHex,
              size: variant.size,
              price: variant.price ? Number(variant.price) : null,
              stock: variant.stock,
              image: variant.image
            }))
          }}
        />
      </section>

      <section className="section section-soft">
        <div className="container">
          <ReviewSection
            productId={product.id}
            loggedIn={Boolean(user)}
            reviews={product.reviews.map((review) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt.toISOString(),
              user: review.user
            }))}
          />
        </div>
      </section>

      {related.length ? (
        <section className="section container">
          <div className="section-heading">
            <p className="eyebrow">You may also love</p>
            <h2>Related products</h2>
          </div>
          <ProductGrid
            className="related-product-grid"
            products={related.map(serializeProductCard)}
          />
        </section>
      ) : null}
    </>
  );
}
