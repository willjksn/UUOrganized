export function priceToCents(label: string, allowZero = false) {
  const match = label.trim().match(/^\$?\s*(\d{1,6})(?:\.(\d{1,2}))?\s*$/);
  if (!match) return null;
  const dollars = Number(match[1]);
  const fraction = match[2] || "";
  const cents = fraction.length === 1 ? Number(fraction) * 10 : Number(fraction || "0");
  const total = dollars * 100 + cents;
  const minimum = allowZero ? 0 : 50;
  if (!Number.isInteger(total) || total < minimum || total > 99_999_999) return null;
  return total;
}

export function stockCount(value: string) {
  const text = value.trim();
  if (!text) return null;
  if (!/^\d{1,6}$/.test(text)) return Number.NaN;
  return Number(text);
}

export function stockLabel(stock: number | null | undefined) {
  if (stock == null) return "";
  if (stock === 0) return "Sold out";
  if (stock === 1) return "1 left";
  return `${stock} left`;
}

export function formatPrice(cents: number) {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  if (rest === 0) return `$${dollars}`;
  return `$${dollars}.${String(rest).padStart(2, "0")}`;
}
