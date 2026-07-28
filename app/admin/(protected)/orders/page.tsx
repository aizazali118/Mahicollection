import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type SearchParams = {
  status?: string;
  q?: string;
};

const validStatuses = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
]);

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = validStatuses.has(params.status || "")
    ? (params.status as
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED")
    : undefined;
  const q = params.q?.trim() || "";

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: { items: { select: { id: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1>Orders</h1>
          <p>View customer details, items, notes, totals, and status.</p>
        </div>
      </div>

      <form className="admin-filter-bar">
        <input name="q" defaultValue={q} placeholder="Order, name, phone, email" />
        <select name="status" defaultValue={status || ""}>
          <option value="">All statuses</option>
          {Array.from(validStatuses).map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="admin-primary-button">Filter</button>
      </form>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.name}</strong>
                    <small>
                      {order.phone}
                      <br />
                      {order.email}
                    </small>
                  </td>
                  <td>{order.city}</td>
                  <td>{order.items.length}</td>
                  <td>
                    <span
                      className={`status status--${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{formatMoney(Number(order.total))}</td>
                  <td>
                    {new Intl.DateTimeFormat("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
