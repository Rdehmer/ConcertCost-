import type { Concert, ConcertCostItem, CostCategory } from "./types";
import { LEGACY_COST_FIELDS } from "./types";

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Resolve line items for a concert.
 * Prefer concert_cost_items; fall back to legacy fixed columns as Uncategorized/Other.
 */
export function getConcertCostItems(concert: Concert): ConcertCostItem[] {
  const items = concert.cost_items ?? [];
  if (items.length > 0) {
    return [...items]
      .map((item) => ({
        ...item,
        amount: toNumber(item.amount),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const legacyItems: ConcertCostItem[] = [];
  let order = 0;
  for (const field of LEGACY_COST_FIELDS) {
    const amount = toNumber(concert[field.key]);
    if (amount > 0) {
      legacyItems.push({
        id: `legacy-${field.key}`,
        concert_id: concert.id,
        category: field.category,
        amount,
        sort_order: order++,
      });
    }
  }

  if (legacyItems.length > 0) return legacyItems;

  // True single-total / empty legacy row: treat as one Uncategorized item only if somehow needed
  return [];
}

export function getTotalCost(concert: Concert): number {
  const items = getConcertCostItems(concert);
  if (items.length > 0) {
    return items.reduce((sum, item) => sum + toNumber(item.amount), 0);
  }
  // Final fallback: sum legacy columns even if all zero
  return LEGACY_COST_FIELDS.reduce(
    (sum, field) => sum + toNumber(concert[field.key]),
    0
  );
}

export function sumLineItemAmounts(
  items: { amount: number | string }[]
): number {
  return items.reduce((sum, item) => sum + toNumber(item.amount), 0);
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

/** Aggregate spending by category across concerts. */
export function getCategoryTotals(concerts: Concert[]) {
  const totals = new Map<string, number>();

  for (const concert of concerts) {
    for (const item of getConcertCostItems(concert)) {
      const key = item.category || "Other";
      totals.set(key, (totals.get(key) ?? 0) + toNumber(item.amount));
    }
  }

  return [...totals.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
}

/** Per-concert category breakdown with percentages. */
export function getConcertCategoryBreakdown(concert: Concert) {
  const items = getConcertCostItems(concert);
  const byCategory = new Map<string, number>();

  for (const item of items) {
    const key = item.category || "Other";
    byCategory.set(key, (byCategory.get(key) ?? 0) + toNumber(item.amount));
  }

  const rows = [...byCategory.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return rows.map((row) => ({
    ...row,
    percent: total > 0 ? (row.amount / total) * 100 : 0,
  }));
}

export function enrichConcert(concert: Concert) {
  const totalCost = getTotalCost(concert);
  const funRating = toNumber(concert.fun_rating);
  const costPerHour = getCostPerHour(totalCost, toNumber(concert.hours_at_event));
  const funPointsPer100 = getFunPointsPer100(funRating, totalCost);
  const costPerFunPoint = getCostPerFunPoint(totalCost, funRating);
  const costItems = getConcertCostItems(concert);
  const breakdown = getConcertCategoryBreakdown(concert);

  return {
    ...concert,
    totalCost,
    costPerHour,
    funPointsPer100,
    costPerFunPoint,
    costItems,
    breakdown,
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
      const label = new Date(
        Number(year),
        Number(mon) - 1,
        1
      ).toLocaleDateString(undefined, { month: "short", year: "numeric" });
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

export type LineItemDraft = {
  key: string;
  category: CostCategory | string;
  amount: string;
};

export function createEmptyLineItem(
  category: CostCategory | string = "Ticket"
): LineItemDraft {
  return {
    key: `new-${Math.random().toString(36).slice(2, 10)}`,
    category,
    amount: "",
  };
}
