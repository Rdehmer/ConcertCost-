"use client";

import { CostBreakdown } from "@/components/CostBreakdown";
import {
  enrichConcert,
  formatCurrency,
  formatMetric,
} from "@/lib/calculations";
import type { Concert } from "@/lib/types";
import { MapPin, Pencil, Sparkles } from "lucide-react";
import Link from "next/link";

export function ConcertList({ concerts }: { concerts: Concert[] }) {
  if (concerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div className="card-body items-center text-center py-16 gap-4">
          <Sparkles className="h-10 w-10 text-primary opacity-70" />
          <h2 className="text-xl font-semibold">No concerts logged yet</h2>
          <p className="opacity-70 max-w-md">
            No concerts logged yet. Add your first concert to start seeing your
            dashboard.
          </p>
          <Link href="/add" className="btn btn-primary">
            Add your first concert
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...concerts].sort(
    (a, b) =>
      new Date(b.concert_date).getTime() - new Date(a.concert_date).getTime()
  );

  return (
    <div className="space-y-4">
      {sorted.map((concert) => {
        const m = enrichConcert(concert);

        return (
          <article
            key={concert.id}
            className="card bg-base-100 shadow-md border border-base-300/40"
          >
            <div className="card-body gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="card-title text-xl">{concert.concert_name}</h2>
                  <p className="font-medium opacity-80">{concert.artist}</p>
                  <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {concert.venue} · {concert.city}, {concert.state}
                  </p>
                  <p className="text-sm opacity-60 mt-1">
                    {new Date(
                      concert.concert_date + "T00:00:00"
                    ).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-start">
                  <div className="stat bg-primary/10 rounded-box py-2 px-3 min-w-[7rem]">
                    <div className="stat-title text-xs">Total</div>
                    <div className="stat-value text-lg text-primary">
                      {formatCurrency(m.totalCost)}
                    </div>
                  </div>
                  <div className="stat bg-secondary/10 rounded-box py-2 px-3 min-w-[7rem]">
                    <div className="stat-title text-xs">Fun</div>
                    <div className="stat-value text-lg">{m.fun_rating}/10</div>
                  </div>
                  <Link
                    href={`/concerts/${concert.id}/edit`}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-box bg-base-200/70 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs opacity-60">Cost per hour</p>
                      <p className="font-semibold">
                        {m.costPerHour === null
                          ? "—"
                          : formatCurrency(m.costPerHour)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-60">Fun Points per $100</p>
                      <p className="font-semibold">
                        {formatMetric(m.funPointsPer100, 2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-box bg-base-200/70 p-3">
                  <p className="text-xs opacity-60 mb-2">Where the money went</p>
                  <CostBreakdown breakdown={m.breakdown} />
                </div>
              </div>

              {concert.notes ? (
                <p className="text-sm bg-base-200/50 rounded-box p-3">
                  <span className="font-medium">Notes: </span>
                  {concert.notes}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
