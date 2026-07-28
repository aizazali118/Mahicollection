import type { Prisma } from "@prisma/client";
import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import { serializeProductCard } from "@/lib/serializers";
import {
  demoCollections,
  demoMode,
  demoProducts
} from "@/lib/demo-store";

export const metadata = {
  title: "Shop Women’s Clothing"
};

type ShopSearchParams = {
  q?: string;
  collection?: string;
  sort?: string;
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const collectionSlug = params.collection || "";
  const sort = params.sort || "featured";

  if (demoMode) {
    let products = demoProducts.filter(
      (item) =>
        (!collectionSlug || item.collectionSlug === collectionSlug) &&
        (!query ||
          `${item.title} ${item.description} ${item.collectionName}`
            .toLowerCase()
            .includes(query.toLowerCase()))
    );
    if (sort === "price-low") products = [...products].sort((a, b) => a.price - b.price);
    if (sort === "price-high") products = [...products].sort((a, b) => b.price - a.price);
    return (
      <ShopContent
        products={products}
        collections={demoCollections}
        query={query}
        collectionSlug={collectionSlug}
        sort={sort}
      />
    );
  }

  const where: Prisma.ProductWhereInput = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            {
              collection: {
                name: { contains: query, mode: "insensitive" }
              }
            }
          ]
        }
      : {}),
    ...(collectionSlug
      ? {
          collection: {
            slug: collectionSlug
          }
        }
      : {})
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { featured: "desc" },
    { createdAt: "desc" }
  ];
  if (sort === "newest") orderBy = [{ createdAt: "desc" }];
  if (sort === "price-low") orderBy = [{ price: "asc" }];
  if (sort === "price-high") orderBy = [{ price: "desc" }];
  if (sort === "best-selling")
    orderBy = [{ bestSelling: "desc" }, { updatedAt: "desc" }];

  const [products, collections] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        collection: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        variants: true
      },
      orderBy
    }),
    prisma.collection.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    })
  ]);

  return (
    <ShopContent
      products={products.map(serializeProductCard)}
      collections={collections}
      query={query}
      collectionSlug={collectionSlug}
      sort={sort}
    />
  );
}

function ShopContent({
  products,
  collections,
  query,
  collectionSlug,
  sort
}: {
  products: typeof demoProducts;
  collections: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string;
  }>;
  query: string;
  collectionSlug: string;
  sort: string;
}) {
  const collectionName =
    collections.find((item) => item.slug === collectionSlug)?.name || null;

  return (
    <>
      <section className="page-hero page-hero--shop">
        <div className="container">
          <p className="eyebrow">Mahi Collection</p>
          <h1>{collectionName || (query ? `Search: “${query}”` : "Shop All")}</h1>
          <p>
            Explore modern Pakistani womenswear in expressive colour,
            comfortable fabric, and graceful silhouettes.
          </p>
        </div>
      </section>

      <section className="section container">
        <form className="shop-toolbar" method="get">
          <label>
            Search
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search products"
            />
          </label>
          <label>
            Collection
            <select name="collection" defaultValue={collectionSlug}>
              <option value="">All collections</option>
              {collections.map((collection) => (
                <option value={collection.slug} key={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select name="sort" defaultValue={sort}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="best-selling">Best selling</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
          <button className="button button-dark" type="submit">
            Apply
          </button>
        </form>

        <div className="shop-results-head">
          <p>
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
