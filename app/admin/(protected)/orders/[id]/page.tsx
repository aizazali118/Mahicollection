import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store";

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: { select: { name: true, email: true } } }
    }),
    getStoreSettings()
  ]);
  if (!order) notFound();

  const message = [
    `Assalam-o-Alaikum ${order.name},`,
    `Your Mahi Collection order ${order.orderNumber} is currently ${order.status.toLowerCase()}.`,
    `Order total: ${formatMoney(Number(order.total))}.`,
    "Please reply if you need help."
  ].join("\n");
  const whatsappUrl = `https://wa.me/${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <Link className="text-link" href="/admin/orders">
            ← Back to orders
          </Link>
          <p className="eyebrow">Order details</p>
          <h1>{order.orderNumber}</h1>
          <p>
            Placed{" "}
            {new Intl.DateTimeFormat("en-PK", {
              dateStyle: "full",
              timeStyle: "short"
            }).format(order.createdAt)}
          </p>
        </div>
        <a
          className="admin-secondary-button"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={17} />
          WhatsApp Customer
        </a>
      </div>

      <div className="admin-order-grid">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2>Ordered items</h2>
              <p>{order.items.length} line item(s)</p>
            </div>
          </div>
          <div className="admin-order-items">
            {order.items.map((item) => (
              <article key={item.id}>
                <img src={item.image} alt={item.title} />
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {[item.variantLabel, `Quantity ${item.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <b>{formatMoney(Number(item.price) * item.quantity)}</b>
              </article>
            ))}
          </div>
          <div className="admin-order-totals">
            <div>
              <span>Subtotal</span>
              <strong>{formatMoney(Number(order.subtotal))}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>− {formatMoney(Number(order.discount))}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>
                {Number(order.shipping)
                  ? formatMoney(Number(order.shipping))
                  : "Free"}
              </strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatMoney(Number(order.total))}</strong>
            </div>
          </div>
        </section>

        <div className="admin-order-side">
          <section className="admin-panel">
            <h2>Customer & delivery</h2>
            <p>
              <strong>{order.name}</strong>
              <br />
              <a href={`tel:${order.phone}`}>{order.phone}</a>
              <br />
              <a href={`mailto:${order.email}`}>{order.email}</a>
            </p>
            <p>
              {order.address}
              <br />
              {order.city}
            </p>
            {order.note ? (
              <>
                <h3>Order note</h3>
                <p>{order.note}</p>
              </>
            ) : null}
            {order.couponCode ? (
              <p>
                Coupon: <strong>{order.couponCode}</strong>
              </p>
            ) : null}
          </section>

          <section className="admin-panel">
            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
            />
          </section>

          <section className="admin-panel admin-note-panel">
            <small>Store WhatsApp</small>
            <strong>{settings.whatsappNumber}</strong>
          </section>
        </div>
      </div>
    </div>
  );
}
