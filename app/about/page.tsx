import Link from "next/link";

export const metadata = {
  title: "About Us"
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero page-hero--about">
        <div className="container">
          <p className="eyebrow">Our story</p>
          <h1>Clothing that feels as graceful as it looks.</h1>
          <p>
            Mahi Collection is built around thoughtful Pakistani womenswear:
            expressive enough to feel special and comfortable enough to live
            in.
          </p>
        </div>
      </section>

      <section className="section container story-grid">
        <div className="story-image">
          <img src="/demo/product-ivory-embroidered.jpg" alt="Mahi embroidered suit" />
        </div>
        <div className="story-copy">
          <p className="eyebrow">Why Mahi</p>
          <h2>Made for real wardrobes and memorable days.</h2>
          <p>
            We believe elegance is not reserved for occasions. It lives in
            fabric that breathes, cuts that move, colours that lift the mood,
            and details that remain beautiful after the first impression.
          </p>
          <p>
            Every edit brings together lawn, prints, embroidery, and polished
            separates with a clear purpose: to help women feel composed without
            feeling overdone.
          </p>
          <Link className="button button-dark" href="/shop">
            Explore the Collection
          </Link>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container values-grid">
          <article>
            <span>01</span>
            <h3>Wearability first</h3>
            <p>
              Silhouettes and fabrics selected for comfort through long,
              beautiful days.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Thoughtful detail</h3>
            <p>
              Embroidery, trims, prints, and finishing that make each piece feel
              considered.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Human service</h3>
            <p>
              Clear support before purchase, during confirmation, and after
              delivery.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
