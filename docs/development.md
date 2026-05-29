# Development & Shipping

How to add a feature, change the schema, and get it to production. **Read this before opening any source file.**

## TL;DR — the loop

**Prod-only for now.** Every push to `main` deploys to prod via the visual-gate-after-deploy model. When you outgrow this (i.e. you ship a regression and want a staging gate), see "[Adding staging](#adding-staging)" below.

```bash
# 1. Local dev (Postgres in docker on :5435, Next.js on :3000)
docker compose up -d
cd src/frontend && npm install --legacy-peer-deps && npx prisma migrate dev && npm run dev

# 2. Branch + code + type-check + tests
git checkout main && git pull --ff-only
git checkout -b feat/<short-name>
# … edit files …
cd src/frontend && npm run build && npm run test

# 3. PR + merge → CI builds + auto-deploys PROD
git add <files> && git commit -m "<terse imperative>"
git push -u origin HEAD
gh pr create --fill
gh pr merge --squash --delete-branch
gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
git pull --ff-only          # grab the bot's "[skip ci] bump prod image" commit

# 4. Force ArgoCD to pick up (saves ~3-min poll)
ssh 5560 'sudo kubectl -n argocd patch application timeclock --type merge -p "{\"metadata\":{\"annotations\":{\"argocd.argoproj.io/refresh\":\"hard\"}}}"'
ssh 5560 'sudo kubectl -n timeclock rollout status deploy/frontend --timeout=180s'

# 5. Smoke
bash scripts/smoke.sh https://clockin.randomstuffs.org

# 6. Browser spot-check — exercise the change at https://clockin.randomstuffs.org
```

End-to-end PR-merge → prod live: ~3-4 minutes.

Doc-only changes (`docs/**`, root `*.md`): same PR flow, but the path filter on `build.yaml` skips CI — no deploy needed.

## Repo layout

```
timeclock/
├── prototype/clockin/              UI prototype (React via CDN). DESIGN REFERENCE — do not import from src/.
├── src/frontend/                   Next.js app + Prisma + Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma           Source of truth for DB schema
│   │   └── migrations/             Versioned SQL, applied by init container via `prisma migrate deploy`
│   ├── app/                        App-router pages + API routes
│   ├── components/                 UI components (organize by scope: ui/, app/, dashboard/, entry/, etc.)
│   ├── lib/                        Server helpers + client hooks + pure logic
│   ├── auth.ts + auth.config.ts    NextAuth v5 + Google OAuth
│   ├── middleware.ts               Public-read model: does NOT redirect unauthed page requests
│   └── Dockerfile                  Multi-stage: deps → builder → migrator + runner
├── k8s/
│   ├── base/                       Shared manifests, placeholder image
│   └── overlays/prod/              timeclock namespace, NodePort 30220
├── argocd/applications/prod.yaml   One-time ArgoCD bootstrap
├── .github/workflows/build.yaml    On push to main: build + bump prod overlay
├── docs/
│   ├── development.md              ← you are here
│   ├── architecture.md             Schema + API surface (grows with the app)
│   └── agent-handoff.md            First-PR brief for a fresh agent
├── scripts/smoke.sh                Lightweight deploy verifier
└── docker-compose.yml              Local Postgres on :5435
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (app router) |
| ORM | Prisma 6 (versioned migrations via `prisma migrate deploy` in init container) |
| Database | Postgres 16 (StatefulSet, 2Gi PVC) |
| Auth | NextAuth v5 + Google OAuth. **Public read · admin-only write.** Allowlist via `AllowedEmail` table + `ALLOWED_EMAILS` env. |
| Data layer | TanStack Query v5 (optimistic on writes) |
| Validation | Zod at API edge |
| Tests | Vitest for pure logic |
| Build | Multi-stage Dockerfile (`runner` + `migrator` targets) |
| CI/CD | GitHub Actions → GHCR → ArgoCD |

## Auth model

**This is the key difference from habit-tracking-1.**

| Route type | Unauth | Authed non-allowlisted | Authed + allowlisted (ADMIN) |
|---|---|---|---|
| Page route (`/`, `/dashboard`, etc.) | 200 — full render | 200 — full render | 200 — admin UI visible |
| `GET /api/*` (read endpoints) | 200 — data returned | 200 — data returned | 200 — data returned |
| `POST/PATCH/DELETE /api/*` (write endpoints) | 401 JSON | 403 JSON ("not allowlisted") | 200 — write applied |

Implementation:
- `middleware.ts` is a near-noop — it does NOT redirect unauthed page requests. Pages handle their own "show login button if unauthed, show edit UI if admin" logic.
- API handler wrapper:
  - `apiHandler(handler)` — open, no auth required (reads).
  - `apiHandler(handler, { requireAdmin: true })` — admin-only (writes). Returns 401 if no session, 403 if session exists but not in allowlist.

## Local development

### One-time setup

```bash
docker compose up -d        # Postgres on :5435
cd src/frontend
cp .env.example .env        # fill NEXTAUTH_SECRET + GOOGLE_*
npm install --legacy-peer-deps
npx prisma migrate dev

# Pull OAuth creds from cluster:
ssh 5560 'sudo kubectl -n timeclock get secret google-oauth -o jsonpath="{.data.client-id}" | base64 -d'
ssh 5560 'sudo kubectl -n timeclock get secret google-oauth -o jsonpath="{.data.client-secret}" | base64 -d'

# Generate NEXTAUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Daily

```bash
cd src/frontend && npm run dev   # http://localhost:3000
```

Add `http://localhost:3000/api/auth/callback/google` to the shared OAuth client's Authorized Redirect URIs (one-time).

### Verify before commit

```bash
cd src/frontend && npm run build && npm run test
```

## Adding a feature — the standard recipe

1. **Schema** — edit `src/frontend/prisma/schema.prisma`. Run `npx prisma format && npx prisma migrate dev --name <short>`.
2. **API route** — `app/api/<resource>/route.ts`. Use `apiHandler` for reads; `apiHandler(..., { requireAdmin: true })` for writes. Validate input with Zod.
3. **React Query hook** — `lib/hooks/use<Thing>.ts`. Mutation hooks invalidate the right query keys on success.
4. **UI** — add component in `components/<scope>/`. Wire into a page in `app/`.

## Schema changes

Local: `npx prisma migrate dev --name <short>` produces a versioned SQL migration. Commit it.

Cluster: the init container runs `prisma migrate deploy` on every pod start. **No `--accept-data-loss`, ever** — destructive migrations need manual `psql` prep before push.

For destructive ALTERs:

```bash
# Apply the drop manually first (use --diff to see what Prisma wants)
ssh 5560 'sudo kubectl -n timeclock exec postgres-0 -- psql -U timeclock -d timeclock -c "ALTER TABLE ... DROP COLUMN IF EXISTS old_col;"'
# Then push — migrate deploy now sees the column gone and applies the migration cleanly
```

## Shipping a change — agent checklist

For a feature or bug fix. Self-serve.

### 1. Branch
- [ ] If schema changes are destructive: read [Schema changes](#schema-changes) first.
- [ ] `git checkout main && git pull --ff-only`
- [ ] `git checkout -b <type>/<short-name>`

### 2. Edit + verify
- [ ] Terse style — no banners, no multi-paragraph docstrings.
- [ ] `cd src/frontend && npm run build && npm run test` — must pass.

### 3. Commit + PR + merge
- [ ] `git add <specific files>`
- [ ] `git commit -m "<lowercase, terse, imperative>"`
- [ ] `git push -u origin HEAD`
- [ ] `gh pr create --fill`
- [ ] Self-review the diff. For non-trivial changes, ask the user before merging.
- [ ] `gh pr merge --squash --delete-branch`

### 4. Wait for deploy
- [ ] `gh run watch $(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`
- [ ] `git pull --ff-only` — grab the bot's bump commit.
- [ ] Refresh ArgoCD: `ssh 5560 'sudo kubectl -n argocd patch application timeclock --type merge -p "{\"metadata\":{\"annotations\":{\"argocd.argoproj.io/refresh\":\"hard\"}}}"'`
- [ ] Watch rollout: `ssh 5560 'sudo kubectl -n timeclock rollout status deploy/frontend --timeout=180s'`

### 5. Smoke + spot-check
- [ ] `bash scripts/smoke.sh https://clockin.randomstuffs.org` — all green.
- [ ] Open in browser, exercise the change.
- [ ] If broken: rollback per [Rollback](#rollback) — file edit + commit + push, no rebuild.

## Adding staging

When prod-only stops being safe enough (you shipped a regression that a staging gate would have caught):

1. **Add a staging overlay** — `cp -r k8s/overlays/prod k8s/overlays/staging`. Tweak: namespace `timeclock-staging`, NodePort (pick free), smaller PVC.
2. **Add a staging ArgoCD app** — `cp argocd/applications/prod.yaml argocd/applications/staging.yaml`. Tweak: name, path, namespace.
3. **Modify `build.yaml`** — bump `k8s/overlays/staging/frontend-deployment-patch.yaml` instead of prod's.
4. **Add `promote.yaml`** — copies staging SHA → prod overlay. (Crib from [habit-tracking-1's promote.yaml](https://github.com/haianhltr/habit-tracking-1/blob/main/.github/workflows/promote.yaml).)
5. **Cluster bootstrap for staging** — apply the new ArgoCD app, replicate the 4 secrets, fresh `NEXTAUTH_SECRET`. (Crib from [habit-tracking-1's gitops-cutover.md](https://github.com/haianhltr/habit-tracking-1/blob/main/docs/gitops-cutover.md).)
6. **Update this doc + CLAUDE.md** — point at the new staging URL, mention the visual gate is now between push and promote.

End-to-end: ~30 min. Don't pre-build it; do it when the discipline cost is justified.

## Rollback

Edit `k8s/overlays/prod/frontend-deployment-patch.yaml` directly to the previous SHA. Commit `ci: rollback prod to <sha> [skip ci]`. Push. ArgoCD applies on next poll.

## Cluster operations

```bash
# Watch rollout
ssh 5560 'sudo kubectl -n timeclock rollout status deploy/frontend --timeout=180s'

# Init container logs
POD=$(ssh 5560 "sudo kubectl -n timeclock get pod -l app=frontend -o jsonpath='{.items[0].metadata.name}'")
ssh 5560 "sudo kubectl -n timeclock logs $POD -c prisma-migrate"

# psql shell
ssh 5560 'sudo kubectl -n timeclock exec -it postgres-0 -- psql -U timeclock -d timeclock'

# Pod image (verify rollout)
ssh 5560 "sudo kubectl -n timeclock get pod -l app=frontend -o jsonpath='{.items[*].spec.containers[*].image}{\"\\n\"}'"
```

## Anti-patterns / things to NOT do

- **Don't `kubectl apply` workload manifests directly.** ArgoCD overwrites on sync.
- **Don't add `--accept-data-loss` to the migrator.** Manual `psql` prep instead.
- **Don't put read logic behind an admin check.** Read APIs are open. Only writes require admin.
- **Don't redirect unauthed page requests in middleware.** Public read is the model.
- **Don't hardcode hex colors in components.** Use CSS variables (port from `prototype/clockin/app/tokens.css`).
- **Don't `--no-verify` git commits.**
- **Don't push without `git pull --ff-only` first** if the bot may have committed an image bump after your last fetch.

## Style

- TypeScript strict, no `any`.
- No top-of-file file headers / banners. No multi-paragraph docstrings.
- One-line comment only when the WHY is non-obvious.
- Prefer extending an existing route over creating a new one.
- Errors: throw `ApiError(status, msg)` for backend; toast on the frontend.

## Conversation style for future agents

- Match the user's terse decisive tone. Don't ask for confirmation on small reversible edits.
- For bigger forks (schema design, infra changes), give a 2-3 sentence recommendation + tradeoff and ask one question.
- Always type-check + build before committing.
- Watch CI and ArgoCD after pushing.
- For destructive DB schema changes, do the manual `psql` prep BEFORE pushing.
