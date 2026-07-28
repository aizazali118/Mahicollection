import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        variants: true
      }
    }),
    prisma.collection.findMany({
      select: { id: true, name: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    })
  ]);

  if (!product) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Edit product</h1>
          <p>{product.title}</p>
        </div>
      </div>
      <AdminProductForm
        collections={collections}
        initial={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          type: product.type,
          mainImage: product.mainImage,
          gallery: product.images.map((image) => image.url),
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          stock: product.stock,
          sku: product.sku,
          collectionId: product.collectionId,
          published: product.published,
          featured: product.featured,
          newArrival: product.newArrival,
          bestSelling: product.bestSelling,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            colorName: variant.colorName || "",
            colorHex: variant.colorHex || "#d6c4a6",
            size: variant.size || "",
            sku: variant.sku || "",
            price: variant.price ? String(Number(variant.price)) : "",
            stock: String(variant.stock),
            image: variant.image || ""
          }))
        }}
      />
    </div>
  );
}
