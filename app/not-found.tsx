import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section container empty-cart">
      <p className="eyebrow">404</p>
      <h1>This page could not be found.</h1>
      <p>The product or page may have moved, changed, or is no longer available.</p>
      <Link className="button button-dark" href="/shop">
        Return to Shop
      </Link>
    </section>
  );
}
