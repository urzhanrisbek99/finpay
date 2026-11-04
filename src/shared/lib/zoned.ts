export type CalendarDate = { year: number; month: number; day: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

function wallClockAsUtc(instant: Date, timeZone: string): number {
  const p: Record<string, number> = {};
  for (const { type, value } of partsFormatter(timeZone).formatToParts(
    instant,
  )) {
    if (type !== "literal") p[type] = Number(value);
  }
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value === "") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function zonedDate(instant: Date, timeZone: string): CalendarDate {
  const d = new Date(wallClockAsUtc(instant, timeZone));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function sameZonedDay(a: Date, b: Date, timeZone: string): boolean {
  const x = zonedDate(a, timeZone);
  const y = zonedDate(b, timeZone);
  return x.year === y.year && x.month === y.month && x.day === y.day;
}

export function zonedMidnight(
  timeZone: string,
  year: number,
  month: number,
  day: number,
): Date {
  const target = Date.UTC(year, month - 1, day);
  const offset = (t: number) => wallClockAsUtc(new Date(t), timeZone) - t;
  const first = target - offset(target);
  const second = target - offset(first);
  return new Date(second);
}

export function zonedMonthStart(
  timeZone: string,
  year: number,
  month: number,
): Date {
  return zonedMidnight(timeZone, year, month, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
