"use client";

import {
  computeDashboardStats,
  formatCurrency,
  formatMetric,
  formatNumber,
  getSpendingByMonth,
  getValueLeaderboard,
} from "@/lib/calculations";
import type { Concert } from "@/lib/types";
import { Medal, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="stat bg-base-100 shadow-md rounded-box border border-base-300/40">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-2xl sm:text-3xl text-primary break-words">
        {value}
      </div>
      {subtitle ? <div className="stat-desc">{subtitle}</div> : null}
    </div>
  );
}

function rankBadge(rank: number) {
  if (rank === 1) return "badge-warning";
  if (rank === 2) return "badge-ghost";
  if (rank === 3) return "badge-accent";
  return "badge-outline";
}

export function InsightsView({ concerts }: { concerts: Concert[] }) {
  if (concerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div className="card-body items-center text-center py-16 gap-4">
          <Sparkles className="h-10 w-10 text-primary opacity-70" />
          <h2 className="text-xl font-semibold">No insights yet</h2>
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

  const stats = computeDashboardStats(concerts);
  const leaderboard = getValueLeaderboard(concerts);
  const spendingByMonth = getSpendingByMonth(concerts);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total spent all-time"
          value={formatCurrency(stats.totalSpent)}
        />
        <StatCard
          title="Average cost per concert"
          value={formatCurrency(stats.avgCost)}
        />
        <StatCard
          title="Average fun rating"
          value={`${formatNumber(stats.avgFun, 1)}/10`}
        />
        <StatCard
          title="Total concerts logged"
          value={String(stats.count)}
        />
      </div>

      <div className="card bg-base-100 shadow-md border border-base-300/40">
        <div className="card-body">
          <h2 className="card-title text-base">Spending over time</h2>
          <p className="text-sm opacity-70 -mt-1">
            Total amount spent by month, based on each concert date.
          </p>
          <div className="h-72 w-full mt-2">
            {spendingByMonth.length === 0 ? (
              <p className="opacity-60 text-sm py-12 text-center">
                No dated concerts to chart yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByMonth} margin={{ bottom: 24, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={spendingByMonth.length > 6 ? -25 : 0}
                    textAnchor={spendingByMonth.length > 6 ? "end" : "middle"}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar
                    dataKey="total"
                    name="Spent"
                    fill="#65c3c8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Value leaderboard</h2>
            <p className="text-sm opacity-70">
              Ranked by cost per fun point (total cost / fun rating). Lower is
              better value.
            </p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="alert">
            <span>
              Add fun ratings to your concerts to build the value leaderboard.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((concert, index) => {
              const rank = index + 1;
              return (
                <article
                  key={concert.id}
                  className="card bg-base-100 shadow-md border border-base-300/40"
                >
                  <div className="card-body gap-3 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`badge badge-lg ${rankBadge(rank)} shrink-0 gap-1`}
                        >
                          {rank <= 3 ? (
                            <Medal className="h-3.5 w-3.5" />
                          ) : null}
                          #{rank}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg leading-tight">
                            {concert.concert_name}
                          </h3>
                          <p className="text-sm opacity-80">{concert.artist}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {concert.venue} · {concert.city}, {concert.state} ·{" "}
                            {new Date(
                              concert.concert_date + "T00:00:00"
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="stat bg-primary/10 rounded-box py-2 px-3 min-w-[8.5rem]">
                          <div className="stat-title text-xs">
                            Cost per fun point
                          </div>
                          <div className="stat-value text-lg text-primary">
                            {concert.costPerFunPoint === null
                              ? "—"
                              : formatCurrency(concert.costPerFunPoint)}
                          </div>
                        </div>
                        <div className="stat bg-base-200/70 rounded-box py-2 px-3 min-w-[6.5rem]">
                          <div className="stat-title text-xs">Total cost</div>
                          <div className="stat-value text-lg">
                            {formatCurrency(concert.totalCost)}
                          </div>
                        </div>
                        <div className="stat bg-secondary/10 rounded-box py-2 px-3 min-w-[5.5rem]">
                          <div className="stat-title text-xs">Fun</div>
                          <div className="stat-value text-lg">
                            {concert.fun_rating}/10
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs opacity-60">
                      Fun Points per $100:{" "}
                      {formatMetric(concert.funPointsPer100, 2)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
