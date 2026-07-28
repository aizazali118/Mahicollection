export function formatMoney(
  value: number | string,
  currency = "PKR"
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (currency === "PKR") {
    return `Rs. ${new Intl.NumberFormat("en-PK", {
      maximumFractionDigits: 0
    }).format(amount)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}
