import { CheckoutForm } from "@/components/CheckoutForm";
import { getStoreSettings } from "@/lib/store";

export const metadata = {
  title: "Checkout"
};

export default async function CheckoutPage() {
  const settings = await getStoreSettings();

  return (
    <section className="section container checkout-page">
      <CheckoutForm
        shippingFlatRate={Number(settings.shippingFlatRate)}
        freeShippingThreshold={Number(settings.freeShippingThreshold)}
      />
    </section>
  );
}
