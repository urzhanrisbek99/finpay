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
npm run typecheck  # Type check (tsc --noEmit)
npm test           # Unit tests (Vitest)
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

### State Management (Zustand)

Each entity owns its store in `entity/model` using the store-hook style (`create((set) => …)`). Stores hold reactive state and are updated after API calls; loaders use a `hasLoaded` guard so shared data (profile, transactions, recipients) is fetched once in the app shell.

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
- validates amount, balance, and the card's monthly limit **on the server**;
- reads and debits the balance under `SELECT … FOR UPDATE`, so concurrent transfers can't race;
- inserts the transaction and updates the balance in a **single transaction**.

The client's `UPDATE` privilege on `profiles` is **revoked** — the only path to a balance change is these functions. QR payments use an **authorize → capture** model: creating a QR reserves nothing, and confirmation re-checks funds under lock, so multiple pending QRs can't overdraw the account.

### Card CVV is encrypted at rest

CVVs are never stored or readable in plaintext (see [`0002_card_cvv_encryption.sql`](supabase/migrations/0002_card_cvv_encryption.sql)):

- symmetric key held in **Supabase Vault**, encryption via **pgcrypto**;
- a `BEFORE` trigger encrypts on write and nulls the plaintext column;
- reading a CVV is only possible via a `security definer` RPC that decrypts **only the caller's own card**;
- column-level `GRANT`s hide the ciphertext from direct table reads.

### Row-Level Security

Every table is guarded by RLS policies scoped to `auth.uid()`, so users only ever read and mutate their own rows.

> **Simulated:** QR confirmation is triggered client-side to emulate an acquirer webhook (settlement itself runs server-side and atomically). There is no real payment processor.

## Getting Started

**Prerequisites:** Node.js 20+ and a [Supabase](https://supabase.com) project.

```bash
# 1. Install
npm install

# 2. Configure env — create .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Apply the SQL migrations in supabase/migrations/ in order
#    (Supabase Dashboard → SQL Editor, or `supabase db push`)

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Conventions

- **Commits** — [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint + husky; lint-staged runs ESLint + Prettier on staged files.
- **Styling** — Tailwind CSS v4; `cn()` (clsx + tailwind-merge) for class composition; `prettier-plugin-tailwindcss` orders classes.
- **UI** — Base UI primitives with shadcn-style components in `shared/ui`.
- **State** — Zustand stores per entity/feature.
- **Tests** — Vitest, colocated as `*.test.ts`; business logic lives in pure functions.
- **TypeScript** — strict mode; the build fails on type errors.

## License

MIT — see [LICENSE](LICENSE).
