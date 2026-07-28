import type { Coupon } from "@prisma/client";

export function couponIsActive(coupon: Coupon, now = new Date()) {
  if (!coupon.active) return false;
  if (coupon.startsAt && coupon.startsAt > now) return false;
  if (coupon.endsAt && coupon.endsAt < now) return false;
  if (
    typeof coupon.usageLimit === "number" &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return false;
  }
  return true;
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number) {
  if (!couponIsActive(coupon)) {
    return { valid: false as const, error: "This coupon is inactive or expired." };
  }

  const minimum = coupon.minOrder ? Number(coupon.minOrder) : 0;
  if (subtotal < minimum) {
    return {
      valid: false as const,
      error: `This coupon requires a minimum order of Rs. ${minimum.toLocaleString("en-PK")}.`
    };
  }

  let discount =
    coupon.type === "PERCENT"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

  if (coupon.maxDiscount) {
    discount = Math.min(discount, Number(coupon.maxDiscount));
  }
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  return {
    valid: true as const,
    discount
  };
}
