import { enrichConcert, toNumber } from "./calculations";
import type { Concert } from "./types";

export type EnrichedConcert = ReturnType<typeof enrichConcert>;

export type YearRecapStats = {
  year: number;
  count: number;
  totalSpent: number;
  avgFun: number;
  highestRated: EnrichedConcert | null;
  bestValue: EnrichedConcert | null;
  concerts: EnrichedConcert[];
};

export function getAvailableYears(concerts: Concert[]): number[] {
  const years = new Set<number>();
  for (const c of concerts) {
    const y = Number(c.concert_date?.slice(0, 4));
    if (Number.isFinite(y)) years.add(y);
  }
  return [...years].sort((a, b) => b - a);
}

export function computeYearRecap(
  concerts: Concert[],
  year: number
): YearRecapStats {
  const inYear = concerts
    .filter((c) => c.concert_date?.startsWith(String(year)))
    .map(enrichConcert);

  const count = inYear.length;
  const totalSpent = inYear.reduce((sum, c) => sum + c.totalCost, 0);
  const avgFun =
    count > 0
      ? inYear.reduce((sum, c) => sum + toNumber(c.fun_rating), 0) / count
      : 0;

  const highestRated =
    inYear.length > 0
      ? inYear.reduce((best, c) =>
          toNumber(c.fun_rating) > toNumber(best.fun_rating) ? c : best
        )
      : null;

  const withValue = inYear.filter((c) => c.costPerFunPoint !== null);
  const bestValue =
    withValue.length > 0
      ? withValue.reduce((best, c) =>
          (c.costPerFunPoint ?? Infinity) < (best.costPerFunPoint ?? Infinity)
            ? c
            : best
        )
      : null;

  return {
    year,
    count,
    totalSpent,
    avgFun,
    highestRated,
    bestValue,
    concerts: inYear,
  };
}
