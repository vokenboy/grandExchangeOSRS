export const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(value) ? "-" : `${value.toFixed(2)}%`;
