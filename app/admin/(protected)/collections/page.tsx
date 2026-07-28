import { CollectionManager } from "@/components/admin/CollectionManager";
import { prisma } from "@/lib/prisma";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue structure</p>
          <h1>Collections</h1>
          <p>Manage automatic menu links and homepage collection cards.</p>
        </div>
      </div>
      <CollectionManager
        collections={collections.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          image: item.image,
          featured: item.featured,
          displayOrder: item.displayOrder,
          productCount: item._count.products
        }))}
      />
    </div>
  );
}
