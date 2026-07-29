export type BudgetLevel =
  | "on-track"
  | "trending-over"
  | "over-budget"
  | "no-budget";

export type Budget = {
  level: BudgetLevel;
  projected: number;
  dailyAvg: number;
  usedPercent: number;
  pacePercent: number;
};

export function computeBudget(spent: number, limit: number, now: Date): Budget {
  const day = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const pace = day / daysInMonth;
  const projected = Math.round(spent / pace);
  const dailyAvg = Math.round(spent / day);

  let level: BudgetLevel;
  if (limit <= 0) level = "no-budget";
  else if (spent > limit) level = "over-budget";
  else if (projected > limit) level = "trending-over";
  else level = "on-track";

  return {
    level,
    projected,
    dailyAvg,
    usedPercent:
      limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0,
    pacePercent: Math.min(100, Math.round(pace * 100)),
  };
}
