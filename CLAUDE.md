# timeclock — agent context

Personal time-tracking app. Will live at `https://clockin.randomstuffs.org`. Public read · authed write (admin only).

**First-time agent:** read [docs/agent-handoff.md](docs/agent-handoff.md). It's the one-shot brief for building the first version.

**Returning agent:** read [docs/development.md](docs/development.md) for the shipping checklist + anti-patterns.

## Stack one-liner

Next.js 15 (app router) · Prisma 6 (versioned migrations, `migrate deploy` in init container) · NextAuth v5 + Google OAuth (allowlist gates WRITE only; READ is public) · TanStack Query · Postgres 16 · GitHub Actions → GHCR → ArgoCD → k3s.

## Where things live

- `prototype/clockin/` — the UI prototype (React via CDN). Read its `app/*.jsx` files to understand the intended UX and data shapes.
- `src/frontend/` — Next.js app (created by the first build agent).
- `k8s/base/` + `k8s/overlays/prod/` — Kustomize. **ArgoCD owns this. Never `kubectl apply` workload manifests directly.**
- `argocd/applications/prod.yaml` — one-time bootstrap.
- `.github/workflows/build.yaml` — on push to main, builds + bumps prod overlay.
- `docs/` — `development.md` (shipping), `architecture.md` (schema + API surface — fill as the app grows), `agent-handoff.md` (first-PR brief).

## Ship loop in 3 lines

1. `git push` to `main` → `build.yaml` bumps `k8s/overlays/prod/frontend-deployment-patch.yaml` → ArgoCD deploys.
2. Watch rollout: `ssh 5560 'sudo kubectl -n timeclock rollout status deploy/frontend --timeout=180s'`.
3. Smoke: `bash scripts/smoke.sh https://clockin.randomstuffs.org`.

**No staging yet** — every push goes straight to prod. The visual gate is post-deploy. See [docs/development.md](docs/development.md) → "Adding staging" for how to split when you outgrow this.

## Top anti-patterns

1. **Don't `kubectl apply` workload manifests directly** — ArgoCD overwrites them on sync.
2. **Don't add `--accept-data-loss` to the migrator command** — destructive migrations need manual `psql` prep before push.
3. **Don't hardcode hex colors in components** — use CSS variables from `prototype/clockin/app/tokens.css` (port these into `src/frontend/app/globals.css`).
4. **Don't put write logic behind the public-read auth gate** — read endpoints are open; ONLY write endpoints require admin.

## Conventions

- Branches: `feat/<short>`, `fix/<short>`, `chore/<short>`, `docs/<short>`.
- Commits: lowercase, terse, imperative. Optional prefix `feat:` / `fix:` / `chore:` / `infra:` / `docs:` / `ci:`.
- PRs: one logical change per PR; squash-merge.
- TypeScript strict, no `any`. Use Prisma's generated types.

## When in doubt

- [habit-tracking-1](https://github.com/haianhltr/habit-tracking-1) is the sibling project this is patterned on. Same stack, same ship loop, same agent context layer. Copy patterns shamelessly — recommendation is to clone its `lib/api/`, `lib/game/` (if relevant), `components/ui/` shapes wholesale and adapt.
