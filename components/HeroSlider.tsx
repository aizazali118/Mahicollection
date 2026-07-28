"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  function move(direction: number) {
    setActive((current) => {
      const next = current + direction;
      if (next < 0) return slides.length - 1;
      return next % slides.length;
    });
  }

  return (
    <section className="hero-slider" aria-label="Featured collections">
      <div
        className="hero-track"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article className="hero-slide" key={slide.id}>
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="container hero-content">
              <p className="eyebrow">Mahi Collection</p>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <Link className="button button-dark" href={slide.buttonLink}>
                {slide.buttonText}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="hero-arrow hero-arrow--left"
            onClick={() => move(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="hero-arrow hero-arrow--right"
            onClick={() => move(1)}
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
          <div className="hero-dots" role="tablist" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={active === index ? "is-active" : ""}
                onClick={() => setActive(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
