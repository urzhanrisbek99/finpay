# FinPay

- **Service:** finpay
- **Type:** Portfolio project — personal banking dashboard
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth + RLS) · Zustand · Tailwind CSS v4 · Vitest
- **Status:** Demo
- **Live demo:** _add URL_

**Description:**

FinPay is a personal banking dashboard — money transfers (by phone, card, and QR), card management, and spending analytics. It treats a toy domain with real fintech rigor: **money moves only on the server, atomically**, and card CVVs are **encrypted at rest**.

## Commands

```bash
npm run dev        # Dev server on localhost:3000
npm run build      # Production build (.next)
npm run start      # Serve the production build
npm run lint       # ESLint
npm run lint:fsd   # Feature-Sliced Design boundary check (steiger)
npm run typecheck  # Type check (tsc --noEmit)
npm run format     # Prettier
npm test           # Unit tests + migrations against a real Postgres (Vitest)
npm run test:watch # Vitest in watch mode
```

## Architecture

Next.js 16 (App Router) + TypeScript, organized with **Feature-Sliced Design (FSD)**. Imports point strictly downward — upper layers may import from lower ones, never the reverse.

```
app/                 # Next.js routes (thin — delegate to _pages)
src/
  _app/              # Providers, app shell, global styles
  _pages/            # Full pages (dashboard, cards, transfers)
  widgets/           # Composite UI blocks (header, sidebar, spending-chart…)
  features/          # Discrete user actions (transfer, add-income, qr-payment…)
  entities/          # Domain units: API + Zustand stores (user, card, transaction, recipient)
  shared/            # Micro level: supabase clients, lib, config, ui-kit, types
```

### State Management (Zustand, per-request)

Each entity owns its store in `entity/model`, but stores are **created per request, not as module singletons**: `createUserStore()` builds a vanilla Zustand store, a `UserStoreProvider` puts it in React Context, and `useUserStore(selector)` reads it. A module-level `create(…)` singleton is shared by every request the Node process handles — under SSR one user's balance could be rendered into another user's response. In a banking app that's not a theoretical concern, so the store's lifetime is bound to the render tree instead.

Initial data is fetched **on the server** and hydrated into those stores: [`app/(dashboard)/layout.tsx`](<app/(dashboard)/layout.tsx>) does the auth gate, `DashboardShell` loads profile, transactions, recipients, and card in one `Promise.all`, and `StoreProvider` seeds the stores with the result. The client fetches nothing on mount — there are no loader hooks and no skeleton flash. While the server queries run, the route streams `AppSkeleton` from a `<Suspense>` boundary.

This is why entity read methods are **client-agnostic** — they take an optional `client?: SupabaseClient` and default to the browser one, so the same `transactionApi.getAll` serves both the SSR layer (given the server client) and client-side refetches.

### Routing

Routes are declared with the Next App Router under `app/`. Auth guards live in `proxy.ts` (Next 16's renamed middleware): it validates the Supabase session and redirects unauthenticated users. Route constants are centralized in `shared/config/routes.ts`.

### API layer

Supabase browser/server clients live in `shared/api/supabase`. Reads go through the browser client; **all money mutations go through server-side `security definer` RPCs**. Every `api/index.ts` returns a normalized `{ data, error }` shape.

### Entity / feature structure

```
entities/transaction/
  api/       # Endpoint functions (Supabase queries + RPC)
  model/     # Zustand store, hooks, pure logic (stats.ts) + tests
  ui/        # Presentational components for this entity
  index.ts   # Public API (barrel export)
```

Features follow the same layout (`ui / model / api`) and expose only their public API through `index.ts`. Pure, deterministic business logic (trends, spending buckets, balance flow) is extracted into modules like `stats.ts` with the **clock injected as an argument**, so it's unit-testable without React.

### Path Aliases

TypeScript resolves: `#app`, `#shared`, `#entities`, `#features`, `#widgets`, `#pages`.

## Security & data integrity

### Money is server-authoritative and atomic

The client never computes or writes a balance. Every money operation is a Postgres `security definer` function (see [`supabase/migrations/0006_money_functions.sql`](supabase/migrations/0006_money_functions.sql)) that:

- derives the user from `auth.uid()` — the caller can't act as anyone else;
- validates amount bounds, balance, card freeze, and the card's monthly limit **on the server**;
- reads and debits the balance under `SELECT … FOR UPDATE`, so concurrent transfers can't race;
- inserts the transaction and updates the balance in a **single transaction**.

Client-side checks exist only for instant feedback; every one of them is repeated in SQL, because the browser is not a trust boundary. Freezing a card blocks spending in the database (see [`0008_enforce_card_freeze.sql`](supabase/migrations/0008_enforce_card_freeze.sql)) — including a re-check at QR capture, since a card can be frozen between authorization and settlement.

The client's `UPDATE` privilege on `profiles` is **revoked** — the only path to a balance change is these functions. QR payments use an **authorize → capture** model: creating a QR reserves nothing, and confirmation re-checks funds under lock, so multiple pending QRs can't overdraw the account.

### Card CVV is encrypted at rest

CVVs are never stored or readable in plaintext (see [`0002_card_cvv_encryption.sql`](supabase/migrations/0002_card_cvv_encryption.sql)):

- symmetric key held in **Supabase Vault**, encryption via **pgcrypto**;
- a `BEFORE` trigger encrypts on write and nulls the plaintext column;
- reading a CVV is only possible via a `security definer` RPC that decrypts **only the caller's own card**;
- column-level `GRANT`s hide the ciphertext from direct table reads.

### Row-Level Security

Every table has RLS enabled with policies scoped to `auth.uid()`, so users only ever read their own rows (see [`0000_init.sql`](supabase/migrations/0000_init.sql)).

RLS answers "which rows", not "which verbs", so privileges are narrowed on top of it wherever a policy isn't enough. `profiles` loses `UPDATE` in `0006`, and `transactions` is read-only to the client ([`0010_lock_transactions.sql`](supabase/migrations/0010_lock_transactions.sql)) — an RLS policy would happily let you delete _your own_ rows, and the ledger is exactly where that's unacceptable: the monthly card limit is computed by summing your spending rows, so a client-side `DELETE` would reset the limit. Writes to the ledger belong to the `security definer` functions, which run as the owner and are unaffected by the revoke.

### None of the above is taken on trust

Everything in this section is asserted against a real PostgreSQL in [`supabase/tests/migrations.test.ts`](supabase/tests/migrations.test.ts) — PGlite, so the suite is `npm test` and needs no Docker:

- the whole `migrations/` chain applies to an **empty** database, which is what makes "clone and run" a checked claim rather than a promise;
- a direct `UPDATE` of `balance` is refused, and so are `INSERT`/`UPDATE`/`DELETE` on the ledger;
- a frozen card blocks a transfer and a QR — **including one authorized before the freeze**;
- the monthly limit rejects the transfer that would cross it;
- QR reserves nothing, debits once, and a retried webhook does not debit twice;
- several pending QRs cannot overdraw the balance;
- one user sees zero rows of another's profile, ledger and card, and cannot move their money;
- a CVV never rests in plaintext, decrypts for its owner, and returns null to anyone else.

The suite earns its keep under mutation: drop the freeze check from `0008`, and the two freeze tests go red; re-grant writes on the ledger, and the ledger tests follow.

> **Simulated:** QR confirmation is triggered client-side to emulate an acquirer webhook (settlement itself runs server-side and atomically). There is no real payment processor. The tests stub the parts of Supabase the migrations lean on — `auth.uid()`, the roles, and Vault — so they verify this project's SQL, not Supabase's own guarantees.

## Getting Started

**Prerequisites:** Node.js 20+ and a [Supabase](https://supabase.com) project.

```bash
# 1. Install
npm install

# 2. Configure env — create .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Apply the SQL migrations in supabase/migrations/ in order, starting with
#    0000_init.sql (Supabase Dashboard → SQL Editor, or `supabase db push`)

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then register an account — new accounts start at a zero balance, so add income first to have something to move around.

Apply the migrations **in order, each exactly once**. They're written as a history: `0000_init.sql` creates the schema with baseline grants, and later files deliberately tighten it (`0001` closes direct reads of `cards.cvv`, `0006` revokes `UPDATE` on `profiles`, `0010` makes `transactions` read-only to the client). Re-running an early file against an already-migrated database would hand back a privilege a later one took away — `0000` in particular is for empty databases only.

## Conventions

- **Commits** — [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint + husky; lint-staged runs ESLint + Prettier on staged files.
- **Styling** — Tailwind CSS v4; `cn()` (clsx + tailwind-merge) for class composition; `prettier-plugin-tailwindcss` orders classes.
- **UI** — Base UI primitives with shadcn-style components in `shared/ui`.
- **State** — Zustand stores per entity/feature.
- **Tests** — Vitest. Unit tests sit next to the pure functions they cover (`*.test.ts`); the migration suite lives in `supabase/tests` and runs the real SQL against PGlite.
- **TypeScript** — strict mode; the build fails on type errors.

## License

MIT — see [LICENSE](LICENSE).
