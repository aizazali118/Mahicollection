import Link from "next/link";
import {
  BadgePercent,
  Boxes,
  MessageSquareText,
  PackageCheck,
  ShoppingBag,
  Users
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    productCount,
    collectionCount,
    orderCount,
    customerCount,
    pendingReviewCount,
    activeCouponCount,
    recentOrders,
    revenue
  ] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.coupon.count({ where: { active: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } }
    })
  ]);

  const cards = [
    {
      label: "Products",
      value: productCount,
      icon: ShoppingBag,
      href: "/admin/products"
    },
    {
      label: "Collections",
      value: collectionCount,
      icon: Boxes,
      href: "/admin/collections"
    },
    {
      label: "Orders",
      value: orderCount,
      icon: PackageCheck,
      href: "/admin/orders"
    },
    {
      label: "Customers",
      value: customerCount,
      icon: Users,
      href: "/admin/orders"
    },
    {
      label: "Pending Reviews",
      value: pendingReviewCount,
      icon: MessageSquareText,
      href: "/admin/reviews"
    },
    {
      label: "Active Coupons",
      value: activeCouponCount,
      icon: BadgePercent,
      href: "/admin/coupons"
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Mahi Collection</p>
          <h1>Dashboard</h1>
          <p>Store activity and quick management access.</p>
        </div>
        <div className="admin-revenue">
          <small>Revenue (excluding cancelled)</small>
          <strong>{formatMoney(Number(revenue._sum.total || 0))}</strong>
        </div>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.label}>
              <Icon size={21} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </Link>
          );
        })}
      </div>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Recent orders</h2>
            <p>Latest checkout activity from the store.</p>
          </div>
          <Link className="text-link" href="/admin/orders">
            View all orders
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.name}</strong>
                    <small>{order.phone}</small>
                  </td>
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
                      dateStyle: "medium"
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
