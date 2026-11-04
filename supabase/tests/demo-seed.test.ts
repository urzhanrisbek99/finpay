import { beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeDashboardStats } from "#entities/transaction/model/stats";
import type { Transaction } from "#entities/transaction/model/types";
import { zonedDate, zonedMidnight, daysInMonth } from "#shared/lib";

const HERE = dirname(fileURLToPath(import.meta.url));
const TZ = "Asia/Almaty";
const DEMO = "99999999-9999-9999-9999-999999999999";

let db: PGlite;
let ledger: Transaction[];

beforeAll(async () => {
  db = await new PGlite({ extensions: { pgcrypto } });
  await db.exec(readFileSync(join(HERE, "stub.sql"), "utf8"));
  const migrations = join(HERE, "..", "migrations");
  for (const f of readdirSync(migrations).sort()) {
    await db.exec(readFileSync(join(migrations, f), "utf8"));
  }
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data)
    values ('${DEMO}', 'demo@finpay.app', '{"full_name": "Demo User"}');
  `);
  await db.exec(readFileSync(join(HERE, "..", "seed", "demo.sql"), "utf8"));

  const r = await db.query<Transaction & { amount: string; created_at: Date }>(
    `select * from public.transactions where user_id = '${DEMO}'`,
  );
  ledger = r.rows.map((row) => ({
    ...row,
    amount: Number(row.amount),
    created_at: new Date(row.created_at).toISOString(),
  }));
});

describe("the demo seed", () => {
  it("writes nothing on or after today, so a re-run never touches live activity", () => {
    const now = new Date();
    const { year, month, day } = zonedDate(now, TZ);
    const today = zonedMidnight(TZ, year, month, day);
    expect(ledger.length).toBeGreaterThan(60);
    expect(ledger.every((tx) => new Date(tx.created_at) < today)).toBe(true);
  });

  it("pays the salary on the 1st of every month, Almaty time", () => {
    const salaries = ledger.filter((tx) => tx.category === "salary");
    expect(salaries.length).toBeGreaterThanOrEqual(3);
    for (const tx of salaries) {
      expect(zonedDate(new Date(tx.created_at), TZ).day).toBe(1);
    }
  });

  it("sets the balance to the sum of the completed ledger", async () => {
    const r = await db.query<{ balance: string }>(
      `select balance::text from public.profiles where id = '${DEMO}'`,
    );
    const expected = ledger
      .filter((tx) => tx.status === "completed")
      .reduce(
        (s, tx) => s + (tx.type === "income" ? tx.amount : -tx.amount),
        0,
      );
    expect(Number(r.rows[0].balance)).toBe(expected);
  });

  it("reads as a plausible month on every day of it", () => {
    const { year, month } = zonedDate(new Date(), TZ);
    const last = {
      year: month === 1 ? year - 1 : year,
      month: month === 1 ? 12 : month - 1,
    };

    for (let d = 1; d <= daysInMonth(last.year, last.month); d++) {
      const evening = new Date(
        zonedMidnight(TZ, last.year, last.month, d).getTime() + 21 * 3600_000,
      );
      const seen = ledger.filter((tx) => new Date(tx.created_at) < evening);
      const [, expenses] = computeDashboardStats(seen, evening, TZ);
      const pct = Number(expenses.trend!.replace("−", "-").replace("%", ""));
      expect(
        Math.abs(pct),
        `expenses on day ${d}: ${expenses.trend}`,
      ).toBeLessThanOrEqual(35);
    }
  });
});
