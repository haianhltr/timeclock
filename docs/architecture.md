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

_TBD — fill once `prisma/schema.prisma` exists._

The prototype's `prototype/clockin/app/data.jsx` has the intended data shapes; port them to Prisma models.

## API surface

_TBD — fill as routes land._

Pattern:
- `GET /api/health` — shallow liveness (no DB, no auth). Used by smoke.sh.
- `GET /api/ready` — DB ping. Used by smoke.sh.
- `GET /api/me` — current session (id, email, name, role).
- `GET /api/<resource>` — open read.
- `POST/PATCH/DELETE /api/<resource>[/id]` — admin write (`apiHandler(..., { requireAdmin: true })`).

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
