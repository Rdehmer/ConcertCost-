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

/** Dollars spent per fun point — lower means better value. */
export function getCostPerFunPoint(
  totalCost: number,
  funRating: number
): number | null {
  if (funRating <= 0) return null;
  return totalCost / funRating;
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
  const funRating = toNumber(concert.fun_rating);
  const costPerHour = getCostPerHour(totalCost, toNumber(concert.hours_at_event));
  const funPointsPer100 = getFunPointsPer100(funRating, totalCost);
  const costPerFunPoint = getCostPerFunPoint(totalCost, funRating);
  return {
    ...concert,
    totalCost,
    costPerHour,
    funPointsPer100,
    costPerFunPoint,
  };
}

/** Best value first: lowest cost per fun point. */
export function getValueLeaderboard(concerts: Concert[]) {
  return concerts
    .map(enrichConcert)
    .filter((c) => c.costPerFunPoint !== null)
    .sort((a, b) => (a.costPerFunPoint ?? 0) - (b.costPerFunPoint ?? 0));
}

/** Spending totals grouped by calendar month (YYYY-MM). */
export function getSpendingByMonth(concerts: Concert[]) {
  const buckets = new Map<string, number>();

  for (const concert of concerts) {
    const enriched = enrichConcert(concert);
    const date = concert.concert_date?.slice(0, 7);
    if (!date) continue;
    buckets.set(date, (buckets.get(date) ?? 0) + enriched.totalCost);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => {
      const [year, mon] = month.split("-");
      const label = new Date(Number(year), Number(mon) - 1, 1).toLocaleDateString(
        undefined,
        { month: "short", year: "numeric" }
      );
      return {
        month,
        label,
        total: Number(total.toFixed(2)),
      };
    });
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
