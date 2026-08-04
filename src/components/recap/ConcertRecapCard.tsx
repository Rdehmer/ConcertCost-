"use client";

import { formatCurrency } from "@/lib/calculations";
import type { EnrichedConcert } from "@/lib/year-recap";
import { forwardRef } from "react";

type ConcertRecapCardProps = {
  concert: EnrichedConcert;
};

export const ConcertRecapCard = forwardRef<HTMLDivElement, ConcertRecapCardProps>(
  function ConcertRecapCard({ concert }, ref) {
    const dateLabel = new Date(
      concert.concert_date + "T00:00:00"
    ).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="w-[360px] overflow-hidden rounded-2xl bg-base-100 text-base-content border border-base-300 shadow-xl"
        style={{ fontFamily: "var(--font-nunito), ui-sans-serif, system-ui, sans-serif" }}
      >
        <div className="bg-primary text-primary-content px-6 pt-6 pb-8 relative overflow-hidden">
          <div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 bg-primary-content"
            aria-hidden
          />
          <div
            className="absolute -left-6 bottom-0 h-24 w-24 rounded-full opacity-10 bg-primary-content"
            aria-hidden
          />
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-80 relative">
            Concert Recap
          </p>
          <h2
            className="mt-3 text-2xl font-extrabold leading-tight relative"
            style={{ fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" }}
          >
            {concert.concert_name}
          </h2>
          <p className="mt-1 text-lg font-semibold relative opacity-95">
            {concert.artist}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4 bg-base-100">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">When & where</p>
            <p className="font-semibold mt-0.5">{dateLabel}</p>
            <p className="text-sm opacity-80">
              {concert.venue}
              <br />
              {concert.city}, {concert.state}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <p className="text-[10px] uppercase tracking-wide opacity-60">Total cost</p>
              <p className="text-xl font-extrabold text-primary mt-1">
                {formatCurrency(concert.totalCost)}
              </p>
            </div>
            <div className="rounded-xl bg-secondary/15 p-3">
              <p className="text-[10px] uppercase tracking-wide opacity-60">Fun rating</p>
              <p className="text-xl font-extrabold text-secondary mt-1">
                {concert.fun_rating}/10
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-accent/15 p-3">
            <p className="text-[10px] uppercase tracking-wide opacity-60">
              Cost per fun point
            </p>
            <p className="text-xl font-extrabold text-accent-content mt-1">
              {concert.costPerFunPoint === null
                ? "—"
                : formatCurrency(concert.costPerFunPoint)}
            </p>
            <p className="text-xs opacity-60 mt-1">Lower means better value</p>
          </div>

          <p className="text-[10px] text-center opacity-50 pt-1">
            Concert Cost Tracker
          </p>
        </div>
      </div>
    );
  }
);
