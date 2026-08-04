"use client";

import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { YearRecapStats } from "@/lib/year-recap";
import { forwardRef } from "react";

type YearRecapCardProps = {
  stats: YearRecapStats;
};

export const YearRecapCard = forwardRef<HTMLDivElement, YearRecapCardProps>(
  function YearRecapCard({ stats }, ref) {
    return (
      <div
        ref={ref}
        className="w-[360px] overflow-hidden rounded-2xl bg-base-100 text-base-content border border-base-300 shadow-xl"
        style={{ fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif" }}
      >
        <div className="bg-secondary text-secondary-content px-6 pt-6 pb-8 relative overflow-hidden">
          <div
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 bg-secondary-content"
            aria-hidden
          />
          <div
            className="absolute left-10 -bottom-8 h-28 w-28 rounded-full opacity-10 bg-secondary-content"
            aria-hidden
          />
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-80 relative">
            Year Wrapped
          </p>
          <h2
            className="mt-2 text-4xl font-extrabold relative"
            style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
          >
            {stats.year}
          </h2>
          <p className="mt-1 text-sm relative opacity-90">
            Your concert year, in numbers
          </p>
        </div>

        <div className="px-6 py-5 space-y-3 bg-base-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <p className="text-[10px] uppercase tracking-wide opacity-60">
                Shows attended
              </p>
              <p className="text-2xl font-extrabold text-primary mt-1">
                {stats.count}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/15 p-3">
              <p className="text-[10px] uppercase tracking-wide opacity-60">
                Total spent
              </p>
              <p className="text-xl font-extrabold text-secondary mt-1">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-base-200 p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-60">
              Average fun rating
            </p>
            <p className="text-lg font-bold mt-0.5">
              {formatNumber(stats.avgFun, 1)}/10
            </p>
          </div>

          <div className="rounded-xl border border-base-300 p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-60">
              Highest-rated show
            </p>
            {stats.highestRated ? (
              <>
                <p className="font-bold mt-0.5 leading-snug">
                  {stats.highestRated.concert_name}
                </p>
                <p className="text-sm opacity-70">
                  {stats.highestRated.artist} · {stats.highestRated.fun_rating}/10
                </p>
              </>
            ) : (
              <p className="text-sm opacity-60 mt-0.5">—</p>
            )}
          </div>

          <div className="rounded-xl border border-base-300 p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-60">
              Best value show
            </p>
            {stats.bestValue ? (
              <>
                <p className="font-bold mt-0.5 leading-snug">
                  {stats.bestValue.concert_name}
                </p>
                <p className="text-sm opacity-70">
                  {stats.bestValue.artist} ·{" "}
                  {stats.bestValue.costPerFunPoint === null
                    ? "—"
                    : `${formatCurrency(stats.bestValue.costPerFunPoint)} / fun pt`}
                </p>
              </>
            ) : (
              <p className="text-sm opacity-60 mt-0.5">—</p>
            )}
          </div>

          <p className="text-[10px] text-center opacity-50 pt-1">
            Concert Cost Tracker
          </p>
        </div>
      </div>
    );
  }
);
