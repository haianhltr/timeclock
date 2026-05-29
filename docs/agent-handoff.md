# Agent handoff — first-PR brief

> Read this in full before opening any source file. Then follow it end-to-end.

## You are

A coding agent dropped into `timeclock` to ship the first version of the app. The previous agent provisioned the infrastructure (k8s, ArgoCD, GitHub repo, CI workflow, secrets, Cloudflare tunnel, OAuth client) and wrote the docs you're now reading. **No app code exists yet** — `src/frontend/` doesn't exist. Your first PR creates it.

## What this app is

A personal time-tracking app called **clockin**. You log start/stop times, label sessions, see daily/weekly/monthly aggregates, and view charts. Reference UI is in [`prototype/clockin/`](../prototype/clockin/) — single-page React via CDN. Read its `app/*.jsx` files (especially `main.jsx`, `data.jsx`, `dashboard.jsx`, `entry.jsx`, `charts.jsx`, `auth.jsx`) to understand the intended UX and data shapes.

## The hard constraints

| Constraint | Detail |
|---|---|
| **Public read, admin write** | Anyone (no sign-in) can view pages and `GET /api/*`. Only the allowlisted admin can `POST/PATCH/DELETE`. This is the architectural invariant — see [architecture.md](architecture.md). |
| **Admin = haianhletruonh@gmail.com** | Already in the cluster's `auth-config` secret. Don't hardcode it in source — read from `ADMIN_EMAIL` env. |
| **Stack: Next.js 15 + Prisma 6 + Postgres 16 + NextAuth v5** | Same as [habit-tracking-1](https://github.com/haianhltr/habit-tracking-1). **Copy patterns shamelessly.** |
| **Live URL: `https://clockin.randomstuffs.org`** | Cloudflare Tunnel + DNS already pointed at the cluster. |
| **Prod only, no staging** | Every push to `main` deploys to prod. Visual gate happens post-deploy. (See [development.md → Adding staging](development.md#adding-staging) for when this becomes painful.) |
| **NodePort 30220** | Already set in `k8s/overlays/prod/frontend-service-patch.yaml`. Don't change. |

## What's already in place

- ✅ GitHub repo `haianhltr/timeclock` (push perms: bot uses `GITHUB_TOKEN`)
- ✅ `k8s/base/` + `k8s/overlays/prod/` Kustomize manifests (image: placeholder)
- ✅ ArgoCD application `timeclock` deployed to the cluster, pointing at `k8s/overlays/prod`
- ✅ Namespace `timeclock` on the cluster
- ✅ Secrets in namespace: `ghcr-secret`, `google-oauth`, `nextauth-secret`, `auth-config`, `postgres-secret`
- ✅ Postgres pod running (empty DB; no migrations applied yet)
- ✅ `.github/workflows/build.yaml` — will trigger on first push that adds `src/frontend/**`
- ✅ `scripts/smoke.sh` — adapted for the public-read model
- ✅ `docker-compose.yml` — local Postgres on `:5435`
- ✅ Cloudflare Tunnel: `clockin.randomstuffs.org` → cluster (in-cluster DNS `frontend.timeclock.svc.cluster.local:3000`)
- ✅ Google OAuth client (shared "CSFloat Tracker") has `https://clockin.randomstuffs.org/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` in its Authorized Redirect URIs

## What's NOT in place (you'll add)

- ❌ `src/frontend/` — no Next.js app yet
- ❌ `src/frontend/Dockerfile` — no build → no image → CI workflow won't actually succeed until this lands
- ❌ Prisma schema + migrations
- ❌ Any pages, components, API routes, hooks
- ❌ Theme tokens ported from `prototype/clockin/app/tokens.css`

The frontend pod is in `ImagePullBackOff` right now because the placeholder image tag doesn't exist on GHCR. **That's expected** — it'll resolve when your first PR ships and the CI builds a real image.

## First PR — "make it deploy"

**Goal:** the smallest possible app that satisfies `scripts/smoke.sh https://clockin.randomstuffs.org`. No real features yet. Proves the pipeline end-to-end.

Concretely:

1. **Branch** `feat/skeleton`.
2. **`src/frontend/`** — copy [habit-tracking-1's frontend](https://github.com/haianhltr/habit-tracking-1/tree/main/src/frontend) as the starting point. Strip out:
   - All gamify-specific code (rewards, missions, history, etc.)
   - The auth-required middleware (replace with the public-read pattern — see below)
   - Habit/HabitEntry models (you'll add your own time-tracking models in a later PR)
3. **Keep from habit-tracking-1:**
   - `package.json` deps (Next.js 15, Prisma 6, NextAuth v5, TanStack Query, Zod, Vitest)
   - `Dockerfile` (multi-stage runner + migrator)
   - `next.config.js`, `tsconfig.json`, `vitest.config.ts`
   - `lib/api/auth.ts` (`apiHandler`, `requireApiUser`, `requireApiAdmin`, `ApiError`) — but rework `apiHandler` to take an optional `{ requireAdmin: true }` instead of always requiring user. **Read endpoints must be reachable without auth.**
   - `lib/api/client.ts`
   - `auth.ts` + `auth.config.ts` (the seedNewUser branch can be a no-op or removed entirely — timeclock has no seed concept yet)
4. **Rewrite `middleware.ts`** to be a near-noop. Either:
   - Delete it entirely (Next.js works fine without one), or
   - Keep one that only excludes `/api/auth/*` from anything else (no redirect).
5. **`prisma/schema.prisma`** — minimum viable. Just keep the Auth.js scaffold (User, Account, Session, VerificationToken, AllowedEmail). No app models yet — those come in PR 2.
6. **`prisma/migrations/0001_init/`** — generated via `npx prisma migrate dev --name init` against your local docker-compose Postgres on `:5435`.
7. **`app/api/health/route.ts`** — copy from habit-tracking-1. Returns `{ status: "ok", time: ... }`.
8. **`app/api/ready/route.ts`** — copy from habit-tracking-1. Pings DB.
9. **`app/page.tsx`** — "Hello, clockin" landing page. Public. NO redirect.
10. **`app/login/page.tsx`** — Google sign-in button. (Crib UI from habit-tracking-1.)
11. **`.env.example`** — DATABASE_URL pointing at `localhost:5435`, NEXTAUTH_URL=`http://localhost:3000`, placeholders for GOOGLE_*, NEXTAUTH_SECRET. **Match the cluster's env shape exactly.**

### Acceptance for PR 1

- [ ] `cd src/frontend && npm install --legacy-peer-deps && npm run build && npm run test` passes locally
- [ ] `docker compose up -d && npx prisma migrate dev` produces `prisma/migrations/0001_init/`
- [ ] `npm run dev` → http://localhost:3000 → landing page renders without sign-in
- [ ] Push, merge, CI green, ArgoCD synced, pod Running
- [ ] `bash scripts/smoke.sh https://clockin.randomstuffs.org` → all green
- [ ] Visit `https://clockin.randomstuffs.org/` in a browser → landing page renders

## PR 2+ — port the prototype

Once the pipeline is proven, port the prototype into the Next.js app one slice at a time. Suggested order (each PR ≈ 4-8 hours):

1. **Theme + shell** — port `tokens.css` → `app/globals.css`. Build `AppShell` (sidebar on desktop, bottom nav on mobile per the prototype's CSS). NextAuth Google sign-in on `/login`. Hide admin actions when not signed in (so the public sees a read-only nav).
2. **Schema + entry CRUD** — port `data.jsx`'s shapes to Prisma models (Entry, Project/Tag/whatever the prototype has). `POST/PATCH/DELETE /api/entries` are admin-only. `GET /api/entries` is public. Build an EntryForm component.
3. **Dashboard + charts** — port `dashboard.jsx` + `charts.jsx`. Read-only for the public; the admin's editor opens via a "+" button only when signed in.
4. **Admin tweaks panel** — if `tweaks-panel.jsx` has settings/configuration UI, wire that up admin-only.
5. **Polish** — themed `error.tsx`, `not-found.tsx`, empty states, mobile viewport check.

### Auth model — concretely

Your `apiHandler` should look something like:

```ts
// lib/api/auth.ts
export function apiHandler<Args extends unknown[], T>(
  handler: (...args: Args) => Promise<T>,
  opts: { requireAdmin?: boolean } = {}
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      if (opts.requireAdmin) {
        const session = await auth();
        if (!session?.user?.id) throw new ApiError(401, "Not authenticated");
        if (session.user.role !== "ADMIN") throw new ApiError(403, "Admin role required");
      }
      const body = await handler(...args);
      return NextResponse.json(body);
    } catch (err) { /* ZodError → 400, ApiError → status, else → 500 */ }
  };
}
```

Then:

```ts
// app/api/entries/route.ts
export const GET = apiHandler(async () => {
  // open read — no auth required
  return { entries: await prisma.entry.findMany({ orderBy: { startedAt: "desc" } }) };
});

export const POST = apiHandler(
  async (req: Request) => {
    const body = entrySchema.parse(await req.json());
    return { entry: await prisma.entry.create({ data: body }) };
  },
  { requireAdmin: true }
);
```

## Reference patterns

Copy from [habit-tracking-1](https://github.com/haianhltr/habit-tracking-1) — same stack, same ship loop. Useful files to clone-and-adapt:

| File | What it gives you |
|---|---|
| `src/frontend/Dockerfile` | Multi-stage `runner` + `migrator` build |
| `src/frontend/lib/api/auth.ts` | `apiHandler`, `ApiError`, `requireApiUser`, `requireApiAdmin` |
| `src/frontend/lib/api/client.ts` | Typed fetch wrapper, throws on non-2xx |
| `src/frontend/lib/dates.ts` | UTC date helpers |
| `src/frontend/components/ui/*` | 12 unstyled primitives (Card, Btn, Bar, Pill, Modal, Field, Input, Segmented, Chip, SectionHeader, Skeleton, ToastHost) |
| `src/frontend/components/providers/QueryProvider.tsx` | TanStack Query setup |
| `src/frontend/app/layout.tsx` | Font + theme bootstrap pattern |
| `src/frontend/app/api/health/route.ts` + `ready/route.ts` | Smoke endpoints |
| `src/frontend/auth.config.ts` | NextAuth Google + allowlist check (drop the `seedNewUser` call) |

## Anti-patterns specific to this app

- **Don't redirect unauthed page requests in middleware.** Public-read is the architectural invariant. A redirect-everything middleware is the most common way to break it.
- **Don't share an `apiHandler` between read + write routes without the `requireAdmin` flag.** Read = no flag. Write = `{ requireAdmin: true }`.
- **Don't seed the DB on first sign-in.** habit-tracking-1 does this for habits; timeclock has no per-user seed concept (the data is the admin's, not per-user).
- **Don't add a `seedNewUser` branch back into `auth.config.ts`.** Strip it.
- **Don't write tests with `vitest run` failures and ignore them.** CI runs `npm run test`.
- **Don't bypass the admin check for "convenience" routes** (cron, debug, internal). All writes go through the same gate. If you need an unauthenticated automated write, use a service account with a separate secret, not a relaxed auth gate.

## Definition of done (for the agent)

You're "done" when:

1. **Pipeline works:** PR 1 merges, image builds, pod runs, `smoke.sh` is green.
2. **Public read works:** visitors at `https://clockin.randomstuffs.org` see a landing page without signing in.
3. **Admin write works:** you (signed in as `haianhletruonh@gmail.com`) can do at least ONE write action that a non-signed-in visitor cannot.
4. **Docs reflect reality:** [architecture.md](architecture.md)'s "Schema overview" and "API surface" sections list what actually exists.
5. **Loop is exercised:** at least one bug fix has shipped through the push → CI → ArgoCD → smoke loop (i.e. not just the happy-path skeleton).

Until then, the project is "infrastructure provisioned." That's PR 0 done; PR 1+ is your job.

## When in doubt

- Re-read [development.md](development.md) → "Shipping a change — agent checklist".
- For destructive schema changes, do the manual `psql` prep BEFORE pushing.
- For ambiguous design forks (new routes, schema shapes, UX), give the user a 2-3 sentence recommendation + tradeoff and ask one question.
- The user is the operator. Their tone is terse and decisive. Match it.
