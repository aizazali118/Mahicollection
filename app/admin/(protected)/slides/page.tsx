import { SlideManager } from "@/components/admin/SlideManager";
import { prisma } from "@/lib/prisma";

export default async function AdminSlidesPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Homepage</p>
          <h1>Hero slides</h1>
          <p>Manage the smooth responsive homepage slider.</p>
        </div>
      </div>
      <SlideManager
        slides={slides.map((slide) => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          image: slide.image,
          buttonText: slide.buttonText,
          buttonLink: slide.buttonLink,
          active: slide.active,
          displayOrder: slide.displayOrder
        }))}
      />
    </div>
  );
}
