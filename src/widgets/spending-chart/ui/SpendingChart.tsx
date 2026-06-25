"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/ui/card";
import { formatCurrency } from "@/src/shared/lib/formatters";

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
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground first:bg-violet-100 first:text-violet-600"
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
        <div className="flex justify-between mt-2 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total this month</p>
            <p className="text-sm font-medium">{formatCurrency(435000)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">vs last month</p>
            <p className="text-xs text-green-600 font-medium">
              ↓ −12% less spent
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
