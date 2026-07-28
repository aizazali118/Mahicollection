import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AccountOrderPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await requireUser();
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      ...(user.role === "ADMIN" ? {} : { customerId: user.id })
    },
    include: { items: true }
  });

  if (!order) notFound();

  return (
    <section className="section container account-order">
      <Link className="text-link" href="/account">
        ← Back to account
      </Link>
      <div className="account-order__head">
        <div>
          <p className="eyebrow">Order details</p>
          <h1>{order.orderNumber}</h1>
        </div>
        <span className={`status status--${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </div>

      <div className="account-order__grid">
        <div className="account-order__items">
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
        <aside>
          <h2>Delivery details</h2>
          <p>
            <strong>{order.name}</strong>
            <br />
            {order.phone}
            <br />
            {order.email}
            <br />
            {order.address}, {order.city}
          </p>
          {order.note ? (
            <>
              <h3>Order note</h3>
              <p>{order.note}</p>
            </>
          ) : null}
          <div className="order-totals">
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
        </aside>
      </div>
    </section>
  );
}
