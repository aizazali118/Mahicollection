import type { ProductCardData } from "@/lib/serializers";
import { ProductCard } from "@/components/ProductCard";

export function ProductGrid({
  products,
  className = ""
}: {
  products: ProductCardData[];
  className?: string;
}) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try another collection or remove some filters.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
