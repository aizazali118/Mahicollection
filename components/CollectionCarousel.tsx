"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
};

export function CollectionCarousel({
  collections
}: {
  collections: CollectionItem[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const carousel = collections.length > 4;

  function scroll(direction: number) {
    track.current?.scrollBy({
      left: direction * Math.max(280, track.current.clientWidth * 0.7),
      behavior: "smooth"
    });
  }

  return (
    <div className={`collection-wrap ${carousel ? "is-carousel" : ""}`}>
      {carousel ? (
        <button
          type="button"
          className="collection-arrow collection-arrow--left"
          onClick={() => scroll(-1)}
          aria-label="Previous collections"
        >
          <ChevronLeft size={20} />
        </button>
      ) : null}
      <div className="collection-grid" ref={track}>
        {collections.map((collection) => (
          <Link
            className="collection-card"
            href={`/shop?collection=${collection.slug}`}
            key={collection.id}
          >
            <div className="collection-card__image">
              <img src={collection.image} alt={collection.name} />
              <span>Explore</span>
            </div>
            <h3>{collection.name}</h3>
            {collection.description ? <p>{collection.description}</p> : null}
          </Link>
        ))}
      </div>
      {carousel ? (
        <button
          type="button"
          className="collection-arrow collection-arrow--right"
          onClick={() => scroll(1)}
          aria-label="Next collections"
        >
          <ChevronRight size={20} />
        </button>
      ) : null}
    </div>
  );
}
