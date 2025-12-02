export const formatPrice = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return "?";

  const num = typeof value === "string" ? Number(value.toString().replace(/,/g, "")) : value;
  if (!Number.isFinite(num)) return String(value);

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}b`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}k`;

  return `${sign}${abs.toFixed(2)}`;
};
