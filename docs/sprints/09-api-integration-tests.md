# Sprint 09 — integration tests for the write API routes

## Goal

Cover happy-path + auth-gate + validation-error scenarios for every write route:

- `POST /api/entries` (create)
- `PATCH /api/entries/[date]` (update)
- `DELETE /api/entries/[date]` (delete)
- `PATCH /api/config` (update settings)

Schema-level validation is already unit-tested. The route handlers themselves (apiHandler wrapper + Prisma calls + auth checks) are not.

## Why

If someone refactors `apiHandler` or accidentally drops `{ requireAdmin: true }` from a write route, the existing test suite won't catch it. Smoke checks at the deploy gate test `401` for unauth, but not validation errors or admin happy-path.

## Scope

A new `tests/api/` directory. For each route:

- Test 1: unauth POST/PATCH/DELETE → 401.
- Test 2: signed-in non-admin → 403.
- Test 3: admin happy path → 200 and side effect in DB.
- Test 4: invalid input → 400 with Zod error details.
- Test 5 (entries only): conflict on duplicate date → 409.

## Out of scope

- Frontend component tests (Vitest + Testing Library) — separate sprint.
- E2E tests via Playwright.
- Snapshot tests.

## Files

- `src/frontend/tests/api/entries.test.ts` (NEW)
- `src/frontend/tests/api/config.test.ts` (NEW)
- `src/frontend/tests/helpers/test-db.ts` (NEW) — boots a Prisma client against a per-test schema or wraps each test in a rollback transaction.
- `src/frontend/tests/helpers/mock-auth.ts` (NEW) — mocks `@/auth` so `auth()` returns a configurable session.
- `src/frontend/vitest.config.ts` — extend `test.include` to cover `tests/api/**/*.test.ts`.

## Approach

1. **Auth mocking**: use `vi.mock("@/auth", ...)` per test to return `null` / `{ user: { role: "USER" } }` / `{ user: { role: "ADMIN", id: "test" } }`.
2. **DB strategy**: simplest is "use the local docker Postgres + clean tables between tests via `prisma.$executeRaw\`TRUNCATE …\``". Faster: a Prisma transaction that rolls back per test. Trade complexity for speed; start with truncate.
3. Each test imports the route handler directly (not via HTTP) — e.g. `import { POST } from "@/app/api/entries/route"`. Build a `Request` and `await POST(req)`. Read the `NextResponse` body.
4. Move `tests/` into the `vitest.config.ts` include glob.

## Acceptance

- `npm run test` runs both `lib/**/*.test.ts` and `tests/api/**/*.test.ts`.
- All 4 routes covered with at least 4 cases each.
- Test suite still runs in < 5 s.
- CI passes; nothing in the existing 38 tests regresses.

## Test plan

- Run locally against docker-compose Postgres.
- Verify a deliberately-broken route (e.g. remove `requireAdmin: true` from `POST /api/entries`) fails the unauth-write test.

## Conflicts

- None expected — pure additions plus a vitest config tweak.

## Notes

- If swapping the test DB is annoying, an alternative is to mock `@/lib/prisma` and assert call shape. Less faithful but zero setup. Use real DB for happy-path; mock for error-path that's hard to provoke.
