import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Миграции прогоняются на настоящем Postgres (PGlite — это Postgres,
// собранный в WASM: никакого Docker, старт за секунду). Проверяем два разных
// утверждения:
//
//   1. Папка migrations/ разворачивает пустую базу целиком. Историю схема
//      получила задним числом (0000_init), и без такого прогона «склонируй и
//      примени миграции» из README остаётся непроверенным обещанием.
//   2. Гарантии, ради которых всё это написано, действительно держатся:
//      деньги двигает только сервер, заморозка блокирует расход, лимит не
//      обходится, журнал только на чтение, чужое не видно.
//
// Окружение Supabase (роли, auth.uid(), Vault) поднимает stub.sql — см.
// оговорки там.

const HERE = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = join(HERE, "..", "migrations");

const ALICE = "11111111-1111-1111-1111-111111111111";
const BOB = "22222222-2222-2222-2222-222222222222";

let db: PGlite;

/** Ошибка Postgres несёт SQLSTATE — по нему клиент и различает причины отказа. */
function sqlstate(e: unknown): string | undefined {
  return (e as { code?: string }).code;
}

/** Выполнить блок от лица пользователя: как это делает PostgREST по JWT. */
async function as(uid: string | null, sql: string) {
  await db.exec(`
    select set_config('request.jwt.claim.sub', ${uid ? `'${uid}'` : "''"}, false);
    set role authenticated;
  `);
  try {
    return await db.exec(sql);
  } finally {
    await db.exec("reset role;");
  }
}

/** Как as(), но с одним значением в ответе. */
async function askAs<T>(uid: string, sql: string): Promise<T> {
  await db.exec(`
    select set_config('request.jwt.claim.sub', '${uid}', false);
    set role authenticated;
  `);
  try {
    const r = await db.query<{ v: T }>(sql);
    return r.rows[0]?.v;
  } finally {
    await db.exec("reset role;");
  }
}

async function balanceOf(uid: string): Promise<number> {
  const r = await db.query<{ v: string | null }>(
    `select balance::text as v from public.profiles where id = '${uid}'`,
  );
  return Number(r.rows[0]?.v ?? NaN);
}

/** Ожидаем отказ с конкретным SQLSTATE. Прошедший вызов — это провал теста. */
async function expectRejection(fn: () => Promise<unknown>, code: string) {
  let raised: unknown;
  try {
    await fn();
  } catch (e) {
    raised = e;
  }
  if (raised === undefined) {
    throw new Error(`expected SQLSTATE ${code}, but the call succeeded`);
  }
  expect(sqlstate(raised)).toBe(code);
}

const INSUFFICIENT_PRIVILEGE = "42501";

beforeAll(async () => {
  db = await new PGlite({ extensions: { pgcrypto } });
  await db.exec(readFileSync(join(HERE, "stub.sql"), "utf8"));

  const files = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Сам факт, что цепочка прикладывается к пустой базе без ошибок, — это уже
  // утверждение из README, поэтому падение здесь должно валить тесты.
  for (const f of files) {
    try {
      await db.exec(readFileSync(join(MIGRATIONS, f), "utf8"));
    } catch (e) {
      throw new Error(`migration ${f} failed: ${(e as Error).message}`);
    }
  }

  await db.exec(`
    insert into auth.users (id, email) values
      ('${ALICE}', 'alice@test.io'), ('${BOB}', 'bob@test.io');
  `);
});

// Каждый тест начинает с чистого профиля Алисы: тесты не зависят от порядка.
beforeEach(async () => {
  await db.exec(`
    delete from public.transactions;
    delete from public.cards;
    delete from public.profiles;
  `);
  await as(
    ALICE,
    `insert into public.profiles (id, email, full_name)
       values ('${ALICE}', 'alice@test.io', 'Asel Nurlan');`,
  );
});

describe("migrations apply to an empty database", () => {
  it("creates every table the app queries", async () => {
    const r = await db.query<{ name: string }>(`
      select table_name as name from information_schema.tables
      where table_schema = 'public' order by table_name
    `);
    expect(r.rows.map((x) => x.name)).toEqual([
      "card_requests",
      "cards",
      "profiles",
      "recipients",
      "transactions",
    ]);
  });

  it("enables RLS on every one of them", async () => {
    const r = await db.query<{ name: string }>(`
      select relname as name from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    `);
    expect(r.rows.map((x) => x.name)).toEqual([]);
  });

  it("drops the vestigial cards.spent column by the end of the chain", async () => {
    const r = await db.query(`
      select 1 from information_schema.columns
      where table_name = 'cards' and column_name = 'spent'
    `);
    expect(r.rows).toEqual([]);
  });
});

describe("balance is server-authoritative", () => {
  it("starts a new account at zero, not the demo figure", async () => {
    expect(await balanceOf(ALICE)).toBe(0);
  });

  it("refuses a direct balance write from the client", async () => {
    await expectRejection(
      () => as(ALICE, `update public.profiles set balance = 999999;`),
      INSUFFICIENT_PRIVILEGE,
    );
    expect(await balanceOf(ALICE)).toBe(0);
  });

  it("credits through add_income", async () => {
    await as(ALICE, `select public.add_income(200000, 'Salary', 'salary');`);
    expect(await balanceOf(ALICE)).toBe(200000);
  });

  it("debits through transfer_money and trims the comment", async () => {
    await as(ALICE, `select public.add_income(200000, 'Salary', 'salary');`);
    const comment = await askAs<string>(
      ALICE,
      `select public.transfer_money(1000, 'Transfer to +77020000000', 'phone', '  hi  ')
              -> 'transaction' ->> 'comment' as v`,
    );
    expect(comment).toBe("hi");
    expect(await balanceOf(ALICE)).toBe(199000);
  });
});

describe("transfer bounds", () => {
  beforeEach(async () => {
    await as(ALICE, `select public.add_income(200000, 'Salary', 'salary');`);
  });

  it("rejects below the minimum", async () => {
    await expectRejection(
      () => as(ALICE, `select public.transfer_money(50, 'x', 'phone');`),
      "PT100",
    );
  });

  it("rejects above the maximum", async () => {
    await expectRejection(
      () => as(ALICE, `select public.transfer_money(6000000, 'x', 'phone');`),
      "PT101",
    );
  });

  it("rejects more than the balance", async () => {
    await expectRejection(
      () => as(ALICE, `select public.transfer_money(500000, 'x', 'phone');`),
      "PT102",
    );
    expect(await balanceOf(ALICE)).toBe(200000);
  });
});

describe("a frozen card blocks spending", () => {
  beforeEach(async () => {
    await as(
      ALICE,
      `select public.add_income(200000, 'Salary', 'salary');
       insert into public.cards
         (user_id, number, holder_name, expires_at, type, is_frozen, spending_limit)
       values ('${ALICE}', '4242', 'ASEL NURLAN', '12/28', 'visa', true, 500000);`,
    );
  });

  it("blocks a transfer", async () => {
    await expectRejection(
      () => as(ALICE, `select public.transfer_money(1000, 'x', 'phone');`),
      "PT103",
    );
    expect(await balanceOf(ALICE)).toBe(200000);
  });

  it("blocks creating a QR payment", async () => {
    await expectRejection(
      () => as(ALICE, `select public.create_qr_payment(1000, 'Cafe');`),
      "PT103",
    );
  });

  // Карту могут заморозить между авторизацией и списанием — на capture
  // проверка повторяется, иначе заморозка обходится задержкой оплаты.
  it("rejects at capture a QR authorized before the freeze", async () => {
    await as(ALICE, `update public.cards set is_frozen = false;`);
    const tx = await askAs<string>(
      ALICE,
      `select public.create_qr_payment(5000, 'Cafe') -> 'transaction' ->> 'id' as v`,
    );
    await as(ALICE, `update public.cards set is_frozen = true;`);

    const status = await askAs<string>(
      ALICE,
      `select public.confirm_qr_payment('${tx}') -> 'transaction' ->> 'status' as v`,
    );
    expect(status).toBe("failed");
    expect(await balanceOf(ALICE)).toBe(200000);
  });
});

describe("the monthly card limit", () => {
  it("rejects a transfer that would exceed it", async () => {
    await as(
      ALICE,
      `select public.add_income(200000, 'Salary', 'salary');
       insert into public.cards
         (user_id, number, holder_name, expires_at, type, is_frozen, spending_limit)
       values ('${ALICE}', '4242', 'ASEL NURLAN', '12/28', 'visa', false, 1500);
       select public.transfer_money(1000, 'x', 'phone');`,
    );
    await expectRejection(
      () => as(ALICE, `select public.transfer_money(1000, 'x', 'phone');`),
      "PT104",
    );
  });
});

// Лимит считается суммой расходных строк, поэтому право писать в журнал —
// это право обнулить себе лимит.
describe("the ledger is read-only to the client", () => {
  beforeEach(async () => {
    await as(ALICE, `select public.add_income(200000, 'Salary', 'salary');`);
  });

  it("refuses a delete (which would reset the monthly limit)", async () => {
    await expectRejection(
      () => as(ALICE, `delete from public.transactions;`),
      INSUFFICIENT_PRIVILEGE,
    );
  });

  it("refuses an insert (which would fake the history)", async () => {
    await expectRejection(
      () =>
        as(
          ALICE,
          `insert into public.transactions
             (user_id, type, amount, merchant, category, status)
           values ('${ALICE}', 'income', 1, 'fake', 'salary', 'completed');`,
        ),
      INSUFFICIENT_PRIVILEGE,
    );
  });

  it("refuses an update (failed rows drop out of the limit sum)", async () => {
    await expectRejection(
      () => as(ALICE, `update public.transactions set status = 'failed';`),
      INSUFFICIENT_PRIVILEGE,
    );
  });
});

describe("QR follows authorize then capture", () => {
  beforeEach(async () => {
    await as(ALICE, `select public.add_income(200000, 'Salary', 'salary');`);
  });

  it("reserves nothing when the code is created", async () => {
    await as(ALICE, `select public.create_qr_payment(5000, 'Cafe');`);
    expect(await balanceOf(ALICE)).toBe(200000);
  });

  it("debits once on capture, and stays put when the webhook retries", async () => {
    const tx = await askAs<string>(
      ALICE,
      `select public.create_qr_payment(5000, 'Cafe') -> 'transaction' ->> 'id' as v`,
    );
    await as(ALICE, `select public.confirm_qr_payment('${tx}');`);
    expect(await balanceOf(ALICE)).toBe(195000);

    await as(ALICE, `select public.confirm_qr_payment('${tx}');`);
    await as(ALICE, `select public.confirm_qr_payment('${tx}');`);
    expect(await balanceOf(ALICE)).toBe(195000);
  });

  // Несколько pending-QR суммарно могут превысить баланс: средства
  // перепроверяются на capture, поэтому лишний падает в failed, а не в минус.
  it("cannot overdraw through several pending codes", async () => {
    const a = await askAs<string>(
      ALICE,
      `select public.create_qr_payment(150000, 'A') -> 'transaction' ->> 'id' as v`,
    );
    const b = await askAs<string>(
      ALICE,
      `select public.create_qr_payment(150000, 'B') -> 'transaction' ->> 'id' as v`,
    );

    await as(ALICE, `select public.confirm_qr_payment('${a}');`);
    const status = await askAs<string>(
      ALICE,
      `select public.confirm_qr_payment('${b}') -> 'transaction' ->> 'status' as v`,
    );

    expect(status).toBe("failed");
    expect(await balanceOf(ALICE)).toBe(50000);
  });
});

describe("row-level security isolates users", () => {
  beforeEach(async () => {
    await as(
      ALICE,
      `select public.add_income(200000, 'Salary', 'salary');
       insert into public.cards
         (user_id, number, holder_name, expires_at, type, is_frozen, spending_limit)
       values ('${ALICE}', '4242', 'ASEL NURLAN', '12/28', 'visa', false, 500000);`,
    );
  });

  it("hides another user's profile, ledger and card", async () => {
    const counts = await askAs<string>(
      BOB,
      `select concat(
         (select count(*) from public.profiles), '/',
         (select count(*) from public.transactions), '/',
         (select count(*) from public.cards)) as v`,
    );
    expect(counts).toBe("0/0/0");
  });

  it("will not move another user's money", async () => {
    // Боб аутентифицирован, но без профиля: RPC берёт user_id из auth.uid(),
    // поэтому дотянуться до чужого баланса неоткуда.
    await expectRejection(
      () => as(BOB, `select public.transfer_money(1000, 'x', 'phone');`),
      "PT105",
    );
    expect(await balanceOf(ALICE)).toBe(200000);
  });
});

describe("card CVV never rests in plaintext", () => {
  let cardId: string;

  beforeEach(async () => {
    cardId = await askAs<string>(
      ALICE,
      `insert into public.cards
         (user_id, number, cvv, holder_name, expires_at, type, is_frozen, spending_limit)
       values ('${ALICE}', '4242', '123', 'ASEL NURLAN', '12/28', 'visa', false, 500000)
       returning id::text as v`,
    );
  });

  it("nulls the plaintext column on write and keeps only ciphertext", async () => {
    const r = await db.query<{ cvv: string | null; secret: string | null }>(
      `select cvv, encode(cvv_secret, 'hex') as secret from public.cards where id = '${cardId}'`,
    );
    expect(r.rows[0].cvv).toBe(null);
    expect(r.rows[0].secret).toBeTruthy();
    expect(r.rows[0].secret).not.toContain("123");
  });

  it("returns the owner their own CVV", async () => {
    expect(
      await askAs<string>(
        ALICE,
        `select public.get_card_cvv('${cardId}') as v`,
      ),
    ).toBe("123");
  });

  it("returns nothing to anyone else", async () => {
    expect(
      await askAs<string | null>(
        BOB,
        `select public.get_card_cvv('${cardId}') as v`,
      ),
    ).toBe(null);
  });

  it("keeps the ciphertext unreadable through a plain table read", async () => {
    await expectRejection(
      () => as(BOB, `select cvv from public.cards;`),
      INSUFFICIENT_PRIVILEGE,
    );
  });
});
