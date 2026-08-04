"use client";

import {
  computeDashboardStats,
  formatCurrency,
  formatMetric,
  formatNumber,
} from "@/lib/calculations";
import type { Concert } from "@/lib/types";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#65c3c8",
  "#ef9fbc",
  "#eeaf3a",
  "#291334",
  "#36d399",
  "#3abff8",
  "#f87272",
  "#7480ff",
];

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

export function DashboardView({ concerts }: { concerts: Concert[] }) {
  if (concerts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div className="card-body items-center text-center py-16 gap-4">
          <Sparkles className="h-10 w-10 text-primary opacity-70" />
          <h2 className="text-xl font-semibold">Nothing to show yet</h2>
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
  const byConcert = [...stats.enriched]
    .sort(
      (a, b) =>
        new Date(a.concert_date).getTime() - new Date(b.concert_date).getTime()
    )
    .map((c) => ({
      name:
        c.concert_name.length > 16
          ? c.concert_name.slice(0, 14) + "…"
          : c.concert_name,
      fullName: c.concert_name,
      totalCost: Number(c.totalCost.toFixed(2)),
      fun: c.fun_rating,
      funPer100:
        c.funPointsPer100 === null
          ? 0
          : Number(c.funPointsPer100.toFixed(2)),
    }));

  const categoryData = stats.categoryTotals
    .filter((c) => c.total > 0)
    .map((c) => ({ name: c.name, value: Number(c.total.toFixed(2)) }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total concerts" value={String(stats.count)} />
        <StatCard
          title="Total amount spent"
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
          title="Average cost per hour"
          value={
            stats.avgCostPerHour === null
              ? "—"
              : formatCurrency(stats.avgCostPerHour)
          }
        />
        <StatCard
          title="Best value concert"
          value={stats.bestValue?.concert_name ?? "—"}
          subtitle={
            stats.bestValue
              ? `${formatMetric(stats.bestValue.funPointsPer100, 2)} fun pts / $100`
              : undefined
          }
        />
        <StatCard
          title="Most expensive concert"
          value={stats.mostExpensive?.concert_name ?? "—"}
          subtitle={
            stats.mostExpensive
              ? formatCurrency(stats.mostExpensive.totalCost)
              : undefined
          }
        />
        <StatCard
          title="Highest fun rating"
          value={stats.highestFun?.concert_name ?? "—"}
          subtitle={
            stats.highestFun ? `${stats.highestFun.fun_rating}/10` : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-md border border-base-300/40">
          <div className="card-body">
            <h2 className="card-title text-base">Spending by cost category</h2>
            <div className="h-72 w-full">
              {categoryData.length === 0 ? (
                <p className="opacity-60 text-sm py-12 text-center">
                  No cost data yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name }) => name}
                    >
                      {categoryData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-300/40">
          <div className="card-body">
            <h2 className="card-title text-base">Total cost by concert</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byConcert} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar dataKey="totalCost" name="Total cost" fill="#65c3c8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-300/40">
          <div className="card-body">
            <h2 className="card-title text-base">Fun rating by concert</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byConcert} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar dataKey="fun" name="Fun rating" fill="#ef9fbc" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md border border-base-300/40">
          <div className="card-body">
            <h2 className="card-title text-base">Fun Points per $100 by concert</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byConcert} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                  <Bar
                    dataKey="funPer100"
                    name="Fun Points per $100"
                    fill="#eeaf3a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
