"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";
import { formatCurrency } from "#shared/lib";
import { transactionModel } from "#entities/transaction";

const periods: transactionModel.ChartPeriod[] = ["Week", "Month", "Year"];

export function SpendingChart() {
  const [period, setPeriod] = useState<transactionModel.ChartPeriod>("Week");
  const { data, thisMonth, changePct } =
    transactionModel.useSpendingChart(period);

  const spentLess = changePct <= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Spending overview</CardTitle>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                period === p
                  ? "bg-violet-100 text-violet-600"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#7c3aed"
              fill="#ede9fe"
              strokeWidth={2}
              isAnimationActive
              animationBegin={200}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-between border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">Total this month</p>
            <p className="text-sm font-medium">{formatCurrency(thisMonth)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">vs last month</p>
            <p
              className={`text-xs font-medium ${
                spentLess ? "text-green-600" : "text-red-600"
              }`}
            >
              {spentLess ? "↓" : "↑"} {changePct > 0 ? "+" : ""}
              {changePct}% {spentLess ? "less" : "more"} spent
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
