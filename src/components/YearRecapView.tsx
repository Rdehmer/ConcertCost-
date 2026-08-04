"use client";

import { ShareRecapModal } from "@/components/recap/ShareRecapModal";
import { YearRecapCard } from "@/components/recap/YearRecapCard";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { Concert } from "@/lib/types";
import {
  computeYearRecap,
  getAvailableYears,
} from "@/lib/year-recap";
import { Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function YearRecapView({ concerts }: { concerts: Concert[] }) {
  const years = useMemo(() => getAvailableYears(concerts), [concerts]);
  const defaultYear = years[0] ?? new Date().getFullYear();
  const [year, setYear] = useState(defaultYear);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]);
    }
  }, [years, year]);

  const stats = useMemo(
    () => computeYearRecap(concerts, year),
    [concerts, year]
  );

  if (concerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div className="card-body items-center text-center py-16 gap-4">
          <Sparkles className="h-10 w-10 text-primary opacity-70" />
          <h2 className="text-xl font-semibold">No year to wrap yet</h2>
          <p className="opacity-70 max-w-md">
            No concerts logged yet. Add your first concert to start seeing your
            dashboard.
          </p>
          <Link href="/add" className="btn btn-primary">
            Add a concert
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <label className="form-control w-full max-w-xs">
          <span className="label-text mb-1">Year</span>
          <select
            className="select select-bordered"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {(years.length > 0 ? years : [defaultYear]).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={() => setShareOpen(true)}
          disabled={stats.count === 0}
        >
          <Share2 className="h-4 w-4" />
          Share year recap
        </button>
      </div>

      {stats.count === 0 ? (
        <div className="alert">
          <span>No concerts logged in {year} yet.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="justify-self-center lg:justify-self-start">
            <YearRecapCard stats={stats} />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="stat bg-base-100 shadow-md rounded-box border border-base-300/40">
                <div className="stat-title">Shows attended</div>
                <div className="stat-value text-3xl text-primary">
                  {stats.count}
                </div>
              </div>
              <div className="stat bg-base-100 shadow-md rounded-box border border-base-300/40">
                <div className="stat-title">Total spent</div>
                <div className="stat-value text-3xl text-primary">
                  {formatCurrency(stats.totalSpent)}
                </div>
              </div>
              <div className="stat bg-base-100 shadow-md rounded-box border border-base-300/40">
                <div className="stat-title">Average fun</div>
                <div className="stat-value text-3xl text-primary">
                  {formatNumber(stats.avgFun, 1)}/10
                </div>
              </div>
              <div className="stat bg-base-100 shadow-md rounded-box border border-base-300/40">
                <div className="stat-title">Highest-rated</div>
                <div className="stat-value text-lg text-primary break-words">
                  {stats.highestRated?.concert_name ?? "—"}
                </div>
                <div className="stat-desc">
                  {stats.highestRated
                    ? `${stats.highestRated.fun_rating}/10`
                    : undefined}
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md border border-base-300/40">
              <div className="card-body">
                <h3 className="card-title text-base">Best value show</h3>
                {stats.bestValue ? (
                  <p>
                    <span className="font-semibold">
                      {stats.bestValue.concert_name}
                    </span>{" "}
                    by {stats.bestValue.artist}
                    {" · "}
                    {stats.bestValue.costPerFunPoint === null
                      ? "—"
                      : `${formatCurrency(stats.bestValue.costPerFunPoint)} per fun point`}
                  </p>
                ) : (
                  <p className="opacity-60">Not enough data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {shareOpen ? (
        <ShareRecapModal
          kind="year"
          stats={stats}
          open
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </div>
  );
}
