# Architecture

> **Skeleton.** Fill as the app grows. Template borrowed from [habit-tracking-1's architecture.md](https://github.com/haianhltr/habit-tracking-1/blob/main/docs/architecture.md).

A 5-minute orientation. For the **shipping flow**, see [development.md](development.md). For the **stack one-liner + anti-patterns**, see [../CLAUDE.md](../CLAUDE.md).

## One-screen diagram

```
                ┌──────────────────────────────────────────────────┐
                │                Cloudflare Tunnel                  │
                │      clockin.randomstuffs.org                     │
                └──────────────────────┬───────────────────────────┘
                                       │
                                       ▼
              ┌────────────────────────────────────────────────────┐
              │      k3s cluster (ssh 5560)                        │
              │   ┌─────────────────────┐                          │
              │   │ argocd app:         │                          │
              │   │ timeclock (prod)    │                          │
              │   └─────────┬───────────┘                          │
              │             ▼                                       │
              │   ┌─────────────────────┐                          │
              │   │ namespace: timeclock│                          │
              │   │  pod: frontend      │                          │
              │   │  pod: postgres-0    │                          │
              │   └─────────────────────┘                          │
              └────────────────────────────────────────────────────┘
                              ▲
                              │ docker pull
              ┌───────────────────────────────────┐
              │ GHCR (ghcr.io/haianhltr/timeclock) │
              │   <sha>           (runner image)  │
              │   <sha>-migrator  (init image)    │
              └───────────────────────────────────┘
                              ▲
              ┌───────────────────────────────────┐
              │ GitHub Actions                    │
              │   build.yaml ─ push to main       │
              └───────────────────────────────────┘
```

## Schema overview

Source of truth: [src/frontend/prisma/schema.prisma](../src/frontend/prisma/schema.prisma).

| Model | Purpose |
|---|---|
| `User`, `Account`, `Session`, `VerificationToken` | NextAuth scaffold (PrismaAdapter). `User.role` is `USER` \| `ADMIN`. |
| `AllowedEmail` | Sign-in allowlist. Falls back to `ALLOWED_EMAILS` env var if the table is empty. |
| `Entry` | One row per day. `type` discriminates `TIMED` (gate/desk minutes-since-midnight + optional reason/leftHome/mood) vs `NOTE` (free-text). `date` is the PK so "one entry per day" is a schema-level invariant. |
| `Config` | Singleton (`id = 1`, seeded by the migration). `targetMin`, `boss`, `accentHex`. Drives the on-time math + the accent CSS variable + the check-in message. Public read, admin write. |

Wire format: `Entry.date` serializes as `YYYY-MM-DD` (the Prisma `@db.Date` would otherwise emit a full ISO timestamp). See `lib/api/serializers.ts`.

## API surface

Convention: every route belongs to exactly one bucket. Reads use bare `apiHandler(...)`; writes opt in with `apiHandler(..., { requireAdmin: true })`.

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/health` | GET | open | Shallow liveness. No DB, no auth. Smoke. |
| `/api/ready` | GET | open | DB ping. Smoke. |
| `/api/auth/[...nextauth]` | GET/POST | open | NextAuth handlers. |
| `/api/entries` | GET | open | Returns `{ entries: [...] }`, ordered by date ascending. |
| `/api/entries` | POST | admin | Create. 409 if date already exists. Body: discriminated union on `type`. |
| `/api/entries/[date]` | PATCH | admin | Partial update. 400 if you try to set TIMED-only fields on a NOTE row (or vice versa). 404 if not found. |
| `/api/entries/[date]` | DELETE | admin | 404 if not found. |
| `/api/config` | GET | open | Returns the singleton row. |
| `/api/config` | PATCH | admin | Partial update. Validates `accentHex` as `#rrggbb`. |

## "Where does X live?"

_TBD — fill as files land._

| Topic | Path | Notes |
|---|---|---|
| Schema | `src/frontend/prisma/schema.prisma` | Versioned migrations in `src/frontend/prisma/migrations/` |
| Pure logic | `src/frontend/lib/<scope>/` | Vitest-tested |
| Server helpers | `src/frontend/lib/api/` | `auth`, `schemas`, app-specific orchestration |
| Data hooks | `src/frontend/lib/hooks/` | TanStack Query |
| UI primitives | `src/frontend/components/ui/` | |
| App shell | `src/frontend/components/app/` | `Header`, `Sidebar`/`BottomNav`, theme toggle |
| Theme tokens | `src/frontend/app/globals.css` | Ported from `prototype/clockin/app/tokens.css` |
| Middleware | `src/frontend/middleware.ts` | **Near-noop** — does NOT redirect unauthed pages (public-read model) |
| Auth callbacks | `src/frontend/auth.config.ts` | Allowlist check, admin role grant |
| GitOps manifests | `k8s/base/` + `k8s/overlays/prod/` | ArgoCD owns this. |
| CI/CD | `.github/workflows/build.yaml` | Push to main → bumps prod overlay |

## Auth model invariant

The single-most-important architectural rule:

> **Public read · admin-only write.**

- `middleware.ts` is a near-noop. NEVER add a "redirect-if-unauthed" branch for page routes.
- Every API route belongs to exactly one bucket: open-read OR admin-write. There's no in-between.
- The `apiHandler` wrapper has a `requireAdmin` option. Forget to use it on a write endpoint and you've leaked write access to the public.

Drift-prevention: when reviewing a new API route in a PR, the first question is "is this read or write?" and the second is "does its `apiHandler` config match?"
