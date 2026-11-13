const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const compact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const longDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

/** 6505.4 -> "R$ 6.505,40" */
export const formatCurrency = (value: number | null | undefined): string => brl.format(Number(value) || 0);

/** 6505.4 -> "R$ 6,5 mil" (chart axes) */
export const formatCompactCurrency = (value: number): string => compact.format(value);

/**
 * The API returns dates as "2026-11-10T00:00:00". Parsing only the date part as a local date
 * avoids the off-by-one day that `new Date("2026-11-10")` (UTC midnight) causes in Brazil.
 */
export const parseDate = (value: string): Date => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Local date -> "2026-11-10" */
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** "10 de nov." */
export const formatShortDate = (value: string | Date): string =>
  shortDate.format(typeof value === "string" ? parseDate(value) : value);

/** "Hoje", "Ontem" or "segunda-feira, 10 de novembro" */
export const formatDayLabel = (value: string): string => {
  const date = parseDate(value);
  const today = new Date();
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  const label = longDate.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};
