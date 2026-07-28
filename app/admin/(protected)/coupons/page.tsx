import { CouponManager } from "@/components/admin/CouponManager";
import { prisma } from "@/lib/prisma";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1>Coupons</h1>
          <p>Create and control checkout discount codes.</p>
        </div>
      </div>
      <CouponManager
        coupons={coupons.map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
          maxDiscount: coupon.maxDiscount
            ? Number(coupon.maxDiscount)
            : null,
          startsAt: coupon.startsAt?.toISOString() || null,
          endsAt: coupon.endsAt?.toISOString() || null,
          active: coupon.active,
          usageLimit: coupon.usageLimit,
          usedCount: coupon.usedCount
        }))}
      />
    </div>
  );
}
