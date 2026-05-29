# timeclock

Personal time-tracking app at `https://clockin.randomstuffs.org`. Public read · authed write (admin only). Built from the [prototype](prototype/clockin/) under the [habit-tracking-1](https://github.com/haianhltr/habit-tracking-1) pattern.

## Status

**Infrastructure provisioned, app not yet built.** A fresh agent should follow [docs/agent-handoff.md](docs/agent-handoff.md) end-to-end to ship the first version.

## Layout

```
prototype/clockin/    Reference UI prototype (React via CDN, single-page). Source of design + data shapes.
src/frontend/         (will exist after first PR) Next.js app + Prisma + Dockerfile
k8s/
  base/               Shared manifests, placeholder image
  overlays/prod/      timeclock namespace, NodePort 30220
argocd/applications/  One-time ArgoCD Application bootstrap
.github/workflows/    build.yaml — push to main, deploy prod
docs/
  development.md      Shipping checklist + anti-patterns
  architecture.md     (skeleton — agent fills as app grows)
  agent-handoff.md    Prompt for the first build agent
```

## Stack (intended)

Next.js 15 (app router) · Prisma 6 (versioned migrations) · NextAuth v5 + Google OAuth · TanStack Query · Postgres 16 · GitHub Actions → GHCR → ArgoCD → k3s on `ssh 5560`.

## Auth model

- **Public read:** anyone can hit page routes without signing in.
- **Authed + allowlisted write:** only `haianhletruonh@gmail.com` (ADMIN) can mutate data.
- Implementation pattern: middleware does NOT redirect unauthed page requests; API write routes require admin; API read routes are open.

## Local dev

After the first PR adds the app:

```bash
docker compose up -d                  # Postgres on localhost:5435
cd src/frontend
cp .env.example .env                  # fill NEXTAUTH_SECRET + GOOGLE_*
npm install --legacy-peer-deps
npx prisma migrate dev
npm run dev                           # http://localhost:3000
```

## Ship loop

Push to `main` → CI builds + bumps `k8s/overlays/prod/frontend-deployment-patch.yaml` → ArgoCD `timeclock` syncs → live at `https://clockin.randomstuffs.org`.

**Prod-only for now.** When you want a staging environment, see [docs/development.md](docs/development.md) → "Adding staging".

See [docs/development.md](docs/development.md) for the full shipping checklist.
