import { CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store";

export const metadata = {
  title: "Order Confirmed"
};

export default async function OrderSuccessPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true }
    }),
    getStoreSettings()
  ]);

  if (!order) notFound();

  const message = [
    "Assalam-o-Alaikum Mahi Collection,",
    "",
    `I have placed order ${order.orderNumber}.`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `• ${item.title}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity} — ${formatMoney(Number(item.price) * item.quantity)}`
    ),
    "",
    `Subtotal: ${formatMoney(Number(order.subtotal))}`,
    `Discount: ${formatMoney(Number(order.discount))}`,
    `Delivery: ${Number(order.shipping) ? formatMoney(Number(order.shipping)) : "Free"}`,
    `Total: ${formatMoney(Number(order.total))}`,
    order.note ? `Note: ${order.note}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  const phone = settings.whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <section className="section container order-success">
      <CheckCircle2 size={58} strokeWidth={1.3} />
      <p className="eyebrow">Order received</p>
      <h1>Thank you, {order.name.split(" ")[0]}.</h1>
      <p>
        Your order <strong>{order.orderNumber}</strong> has been saved. Send the
        same details to our WhatsApp so the team can confirm your order quickly.
      </p>

      <div className="order-success__card">
        {order.items.map((item) => (
          <div key={item.id}>
            <img src={item.image} alt={item.title} />
            <span>
              <strong>{item.title}</strong>
              <small>
                {[item.variantLabel, `Qty ${item.quantity}`]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
            </span>
            <b>{formatMoney(Number(item.price) * item.quantity)}</b>
          </div>
        ))}
        <footer>
          <span>Total</span>
          <strong>{formatMoney(Number(order.total))}</strong>
        </footer>
      </div>

      <div className="order-success__actions">
        <a
          className="button button-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={19} />
          Send Order on WhatsApp
        </a>
        <Link className="button button-outline" href="/shop">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}
