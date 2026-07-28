import Link from "next/link";
import { CollectionCarousel } from "@/components/CollectionCarousel";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import { serializeProductCard } from "@/lib/serializers";
import {
  demoCollections,
  demoMode,
  demoProducts,
  demoSlides
} from "@/lib/demo-store";

export default async function HomePage() {
  if (demoMode) {
    return (
      <HomeContent
        slides={demoSlides}
        collections={demoCollections}
        newArrivals={demoProducts}
        bestSelling={demoProducts.slice(0, 5)}
      />
    );
  }

  const [slides, collections, newArrivals, bestSelling] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      take: 5
    }),
    prisma.collection.findMany({
      where: { featured: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
    }),
    prisma.product.findMany({
      where: { published: true, newArrival: true },
      include: {
        collection: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        variants: true
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.product.findMany({
      where: { published: true, bestSelling: true },
      include: {
        collection: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
        variants: true
      },
      orderBy: { updatedAt: "desc" },
      take: 8
    })
  ]);

  return (
    <HomeContent
      slides={slides}
      collections={collections}
      newArrivals={newArrivals.map(serializeProductCard)}
      bestSelling={bestSelling.map(serializeProductCard)}
    />
  );
}

function HomeContent({
  slides,
  collections,
  newArrivals,
  bestSelling
}: {
  slides: typeof demoSlides;
  collections: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string;
  }>;
  newArrivals: ReturnType<typeof serializeProductCard>[];
  bestSelling: ReturnType<typeof serializeProductCard>[];
}) {
  return (
    <>
      <HeroSlider
        slides={slides.map((slide) => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          image: slide.image,
          buttonText: slide.buttonText,
          buttonLink: slide.buttonLink
        }))}
      />

      <section className="section container">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">Shop by mood</p>
          <h2>Curated collections</h2>
          <p>
            From breathable lawn to delicate embroidery, discover pieces made
            for the rhythm of your day.
          </p>
        </div>
        <CollectionCarousel
          collections={collections.map((collection) => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            image: collection.image
          }))}
        />
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Just in</p>
              <h2>New arrivals</h2>
            </div>
            <Link className="text-link" href="/shop?sort=newest">
              View all new arrivals
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="editorial-banner container">
        <div>
          <p className="eyebrow">The Mahi promise</p>
          <h2>Soft fabrics. Thoughtful details. Effortless confidence.</h2>
          <p>
            We design each edit around the way women actually dress: beautiful
            enough for a gathering, comfortable enough for the whole day.
          </p>
          <Link className="button button-light" href="/about">
            Our Story
          </Link>
        </div>
        <img src="/demo/hero-2.jpg" alt="Mahi embroidered collection" />
      </section>

      <section className="section container">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Loved by you</p>
            <h2>Best selling</h2>
          </div>
          <Link className="text-link" href="/shop?sort=best-selling">
            Shop best sellers
          </Link>
        </div>
        <ProductGrid products={bestSelling} />
      </section>

      <section className="benefit-strip">
        <div className="container benefit-grid">
          <div>
            <span>01</span>
            <h3>Nationwide Delivery</h3>
            <p>Reliable shipping across Pakistan.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Easy Support</h3>
            <p>Speak to us before or after ordering.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Secure Accounts</h3>
            <p>Track orders and leave verified account reviews.</p>
          </div>
        </div>
      </section>
    </>
  );
}
