export const metadata = {
  title: "Terms & Conditions"
};

export default function TermsPage() {
  return (
    <>
      <section className="page-hero page-hero--small">
        <div className="container">
          <p className="eyebrow">Mahi Collection</p>
          <h1>Terms & Conditions</h1>
        </div>
      </section>
      <article className="section container policy-content">
        <h2>Products and availability</h2>
        <p>
          Product colours may vary slightly because of lighting, photography,
          and screen settings. All products remain subject to availability
          until an order is confirmed.
        </p>
        <h2>Orders</h2>
        <p>
          Submitting checkout creates an order request. Our team may contact you
          by phone or WhatsApp to confirm details before dispatch. We may cancel
          orders containing incorrect information, unavailable stock, suspected
          misuse, or delivery limitations.
        </p>
        <h2>Pricing and coupons</h2>
        <p>
          Prices are shown in Pakistani rupees unless stated otherwise.
          Discounts apply according to the coupon conditions configured at the
          time of checkout and cannot be exchanged for cash.
        </p>
        <h2>Accounts and reviews</h2>
        <p>
          Customers are responsible for protecting their account credentials.
          Reviews must reflect genuine product experiences and may be moderated
          before publication.
        </p>
        <h2>Changes</h2>
        <p>
          These terms may be updated as the store, fulfilment process, or legal
          requirements change. The version published on this page applies to
          new orders.
        </p>
      </article>
    </>
  );
}
