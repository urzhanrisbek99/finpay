"use client";

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

const data = [
  { month: "Jan", amount: 320000 },
  { month: "Feb", amount: 480000 },
  { month: "Mar", amount: 290000 },
  { month: "Apr", amount: 560000 },
  { month: "May", amount: 380000 },
  { month: "Jun", amount: 435000 },
];

export function SpendingChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Spending overview</CardTitle>
        <div className="flex gap-1">
          {["Week", "Month", "Year"].map((period) => (
            <button
              key={period}
              className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs first:bg-violet-100 first:text-violet-600"
            >
              {period}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#7c3aed"
              fill="#ede9fe"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-between border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">Total this month</p>
            <p className="text-sm font-medium">{formatCurrency(435000)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">vs last month</p>
            <p className="text-xs font-medium text-green-600">
              ↓ −12% less spent
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
