import type { Concert, ConcertCostItem } from "./types";

export const CONCERT_WITH_COSTS_SELECT =
  "*, cost_items:concert_cost_items(*)";

/** Normalize a concert row from Supabase (supports alias or raw relation name). */
export function normalizeConcert(row: Record<string, unknown>): Concert {
  const rawItems =
    (row.cost_items as ConcertCostItem[] | undefined) ??
    (row.concert_cost_items as ConcertCostItem[] | undefined) ??
    [];

  const { cost_items: _a, concert_cost_items: _b, ...rest } = row;

  return {
    ...(rest as unknown as Concert),
    cost_items: Array.isArray(rawItems) ? rawItems : [],
  };
}

export function normalizeConcerts(rows: Record<string, unknown>[] | null): Concert[] {
  return (rows ?? []).map(normalizeConcert);
}
