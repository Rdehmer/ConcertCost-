import type { Concert, CostCategoryKey } from "./types";
import { COST_FIELDS } from "./types";

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getTotalCost(concert: Pick<Concert, CostCategoryKey>): number {
  return COST_FIELDS.reduce((sum, field) => sum + toNumber(concert[field.key]), 0);
}

export function getCostPerHour(
  totalCost: number,
  hoursAtEvent: number
): number | null {
  if (hoursAtEvent <= 0) return null;
  return totalCost / hoursAtEvent;
}

/** Fun Points per $100 — higher means better value. */
export function getFunPointsPer100(
  funRating: number,
  totalCost: number
): number | null {
  if (totalCost <= 0) return null;
  return (funRating / totalCost) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatMetric(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return formatNumber(value, digits);
}

export function getCategoryTotals(concerts: Concert[]) {
  return COST_FIELDS.map((field) => ({
    name: field.label,
    key: field.key,
    total: concerts.reduce((sum, c) => sum + toNumber(c[field.key]), 0),
  }));
}

export function enrichConcert(concert: Concert) {
  const totalCost = getTotalCost(concert);
  const costPerHour = getCostPerHour(totalCost, toNumber(concert.hours_at_event));
  const funPointsPer100 = getFunPointsPer100(
    toNumber(concert.fun_rating),
    totalCost
  );
  return { ...concert, totalCost, costPerHour, funPointsPer100 };
}

export function computeDashboardStats(concerts: Concert[]) {
  const enriched = concerts.map(enrichConcert);
  const count = enriched.length;
  const totalSpent = enriched.reduce((sum, c) => sum + c.totalCost, 0);
  const avgCost = count > 0 ? totalSpent / count : 0;
  const avgFun =
    count > 0
      ? enriched.reduce((sum, c) => sum + toNumber(c.fun_rating), 0) / count
      : 0;

  const withHours = enriched.filter((c) => c.costPerHour !== null);
  const avgCostPerHour =
    withHours.length > 0
      ? withHours.reduce((sum, c) => sum + (c.costPerHour ?? 0), 0) /
        withHours.length
      : null;

  const withValue = enriched.filter((c) => c.funPointsPer100 !== null);
  const bestValue =
    withValue.length > 0
      ? withValue.reduce((best, c) =>
          (c.funPointsPer100 ?? 0) > (best.funPointsPer100 ?? 0) ? c : best
        )
      : null;

  const mostExpensive =
    enriched.length > 0
      ? enriched.reduce((best, c) => (c.totalCost > best.totalCost ? c : best))
      : null;

  const highestFun =
    enriched.length > 0
      ? enriched.reduce((best, c) =>
          toNumber(c.fun_rating) > toNumber(best.fun_rating) ? c : best
        )
      : null;

  return {
    enriched,
    count,
    totalSpent,
    avgCost,
    avgFun,
    avgCostPerHour,
    bestValue,
    mostExpensive,
    highestFun,
    categoryTotals: getCategoryTotals(concerts),
  };
}
