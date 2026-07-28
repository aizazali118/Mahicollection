import type {
  Collection,
  Product,
  ProductImage,
  ProductVariant
} from "@prisma/client";

type ProductWithRelations = Product & {
  collection: Pick<Collection, "name" | "slug">;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type ProductCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "SINGLE" | "VARIABLE";
  mainImage: string;
  hoverImage: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  collectionName: string;
  collectionSlug: string;
  variants: Array<{
    id: string;
    colorName: string | null;
    colorHex: string | null;
    size: string | null;
    price: number | null;
    stock: number;
    image: string | null;
  }>;
};

export function serializeProductCard(
  product: ProductWithRelations
): ProductCardData {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    type: product.type,
    mainImage: product.mainImage,
    hoverImage: product.images[0]?.url ?? null,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    stock: product.stock,
    collectionName: product.collection.name,
    collectionSlug: product.collection.slug,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      size: variant.size,
      price: variant.price ? Number(variant.price) : null,
      stock: variant.stock,
      image: variant.image
    }))
  };
}
