import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      collection: { select: { name: true } },
      variants: { select: { stock: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Products</h1>
          <p>Create single or variable products and manage stock.</p>
        </div>
        <Link className="admin-primary-button" href="/admin/products/new">
          <Plus size={17} />
          Add Product
        </Link>
      </div>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table admin-product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Collection</th>
                <th>Mode</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock =
                  product.type === "VARIABLE"
                    ? product.variants.reduce(
                        (sum, variant) => sum + variant.stock,
                        0
                      )
                    : product.stock;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={product.mainImage} alt={product.title} />
                        <span>
                          <strong>{product.title}</strong>
                          <small>{product.sku || product.slug}</small>
                        </span>
                      </div>
                    </td>
                    <td>{product.collection.name}</td>
                    <td>{product.type === "VARIABLE" ? "Variable" : "Single"}</td>
                    <td>{formatMoney(Number(product.price))}</td>
                    <td>{stock}</td>
                    <td>
                      <span
                        className={`status ${product.published ? "status--delivered" : "status--cancelled"}`}
                      >
                        {product.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link
                          className="admin-secondary-button"
                          href={`/admin/products/${product.id}/edit`}
                        >
                          <Pencil size={15} />
                          Edit
                        </Link>
                        <DeleteButton
                          endpoint={`/api/admin/products/${product.id}`}
                          confirmText={`Delete “${product.title}”? Existing order item snapshots will remain.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
