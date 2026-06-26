"use client";

import { Header } from "@/src/widgets/header/ui/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/ui/card";
import { formatCurrency } from "@/src/shared/lib/formatters";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const monthlyData = [
  { month: "Jan", income: 520000, expenses: 280000 },
  { month: "Feb", income: 520000, expenses: 320000 },
  { month: "Mar", income: 520000, expenses: 250000 },
  { month: "Apr", income: 520000, expenses: 380000 },
  { month: "May", income: 520000, expenses: 290000 },
  { month: "Jun", income: 520000, expenses: 184300 },
];

const categories = [
  { name: "Shopping", amount: 68000, color: "bg-violet-500", width: "65%" },
  { name: "Food", amount: 45000, color: "bg-green-500", width: "43%" },
  { name: "Transport", amount: 28000, color: "bg-blue-500", width: "27%" },
  { name: "Subscriptions", amount: 18000, color: "bg-amber-500", width: "17%" },
  { name: "Other", amount: 25300, color: "bg-pink-500", width: "24%" },
];

const statsCards = [
  {
    label: "Total income",
    amount: 520000,
    trend: "↑ +8% vs May",
    positive: true,
  },
  {
    label: "Total expenses",
    amount: 184300,
    trend: "↑ +4% vs May",
    positive: false,
  },
  { label: "Saved", amount: 335700, trend: "64% of income", positive: true },
];

export function Analytics() {
  return (
    <div className="mx-auto max-w-4xl">
      <Header />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground mb-1 text-xs">{card.label}</p>
            <p className="mb-2 text-lg font-medium">
              {formatCurrency(card.amount)}
            </p>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                card.positive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {card.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Income vs Expenses
            </CardTitle>
            <span className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
              6 months
            </span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="income" fill="#ede9fe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-violet-200" />
                <span className="text-muted-foreground text-xs">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-violet-600" />
                <span className="text-muted-foreground text-xs">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">By category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full ${cat.color} flex-shrink-0`}
                />
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="text-xs font-medium">{cat.name}</span>
                    <span className="text-xs font-medium">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 rounded-full">
                    <div
                      className={`${cat.color} h-full rounded-full`}
                      style={{ width: cat.width }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
