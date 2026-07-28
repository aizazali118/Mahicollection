import { getStoreSettings } from "@/lib/store";
import { formatMoney } from "@/lib/money";

export const metadata = {
  title: "Shipping Policy"
};

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <section className="page-hero page-hero--small">
        <div className="container">
          <p className="eyebrow">Delivery information</p>
          <h1>Shipping Policy</h1>
        </div>
      </section>
      <article className="section container policy-content">
        <h2>Delivery coverage</h2>
        <p>
          Mahi Collection delivers to serviceable addresses across Pakistan.
          Please provide a complete address, active phone number, city, and
          helpful landmark where applicable.
        </p>
        <h2>Shipping charges</h2>
        <p>
          Standard delivery is {formatMoney(Number(settings.shippingFlatRate))}.
          Delivery is complimentary when the product subtotal reaches{" "}
          {formatMoney(Number(settings.freeShippingThreshold))}.
        </p>
        <h2>Order confirmation and dispatch</h2>
        <p>
          Orders may be confirmed by phone or WhatsApp before dispatch.
          Estimated delivery times depend on location, courier operations,
          public holidays, weather, and other circumstances outside our direct
          control.
        </p>
        <h2>Delivery issues</h2>
        <p>
          Contact us promptly if a parcel arrives damaged, incomplete, or
          different from the confirmed order. Keep packaging and product images
          available so our team can review the issue.
        </p>
      </article>
    </>
  );
}
