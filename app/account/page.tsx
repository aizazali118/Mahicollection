import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import AccountProfile from "@/components/AccountProfile";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "My Account"
};

export default async function AccountPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: { take: 3 } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="section container account-page">
      <div className="account-head">
        <div>
          <p className="eyebrow">My account</p>
          <h1>Welcome, {user.name.split(" ")[0]}</h1>
          <p>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {user.role === "ADMIN" ? (
            <Link className="button button-outline" href="/admin">
              Open Admin Panel
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Profile</h2>
        <AccountProfile />
      </div>

      <div className="account-orders">
        <div className="section-heading">
          <h2>Your orders</h2>
        </div>
        {orders.length ? (
          <div className="order-list">
            {orders.map((order) => (
              <Link
                href={`/account/orders/${order.orderNumber}`}
                className="order-list__item"
                key={order.id}
              >
                <div>
                  <small>Order</small>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div>
                  <small>Date</small>
                  <strong>
                    {new Intl.DateTimeFormat("en-PK", {
                      dateStyle: "medium"
                    }).format(order.createdAt)}
                  </strong>
                </div>
                <div>
                  <small>Status</small>
                  <strong className={`status status--${order.status.toLowerCase()}`}>
                    {order.status}
                  </strong>
                </div>
                <div>
                  <small>Total</small>
                  <strong>{formatMoney(Number(order.total))}</strong>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Your placed orders will appear here.</p>
            <Link className="button button-dark" href="/shop">
              Shop Collection
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
