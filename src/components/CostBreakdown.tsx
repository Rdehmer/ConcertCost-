"use client";

import { formatCurrency } from "@/lib/calculations";
import { COST_CHART_COLORS } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function CostBreakdown({
  breakdown,
}: {
  breakdown: { name: string; amount: number; percent: number }[];
}) {
  if (breakdown.length === 0) {
    return <p className="text-sm opacity-60">No costs entered</p>;
  }

  const chartData = breakdown.map((row) => ({
    name: row.name,
    value: Number(row.amount.toFixed(2)),
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-3 items-center">
      <div className="h-28 w-28 mx-auto sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={42}
              strokeWidth={1}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COST_CHART_COLORS[i % COST_CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="text-sm space-y-1.5">
        {breakdown.map((row, i) => (
          <li key={row.name} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    COST_CHART_COLORS[i % COST_CHART_COLORS.length],
                }}
              />
              <span className="truncate">{row.name}</span>
            </span>
            <span className="font-medium whitespace-nowrap opacity-80">
              {formatCurrency(row.amount)} · {row.percent.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
