import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const collections = await prisma.collection.findMany({
    select: { id: true, name: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Add product</h1>
          <p>Create a single product or colour/size variable product.</p>
        </div>
      </div>
      {collections.length ? (
        <AdminProductForm collections={collections} />
      ) : (
        <div className="admin-panel">
          Create at least one collection before adding a product.
        </div>
      )}
    </div>
  );
}
