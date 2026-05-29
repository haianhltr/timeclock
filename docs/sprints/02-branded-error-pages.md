# Sprint 02 — branded `error.tsx`, `not-found.tsx`, `global-error.tsx`

## Goal

Replace Next.js's default error and 404 pages with themed equivalents that match the rest of the app (warm-cream surface, coral CTA, Hanken Grotesk).

## Why

When something throws in a server component or a route doesn't exist, visitors land on Next.js's default stack-trace page. That's jarring on a personal site. The fix is three small server components in `app/`.

## Scope

- `app/error.tsx` — catches errors in the route segment under `app/(shell)/` and `app/`. Server component? No — Next requires it to be a Client Component (`"use client"`).
- `app/not-found.tsx` — renders for any unmatched route.
- `app/global-error.tsx` — wraps the root layout itself (rare case where the root layout throws).

All three render inside the existing theme tokens — same Logo, same warm-cream card. Single "Take me home" link back to `/`.

## Out of scope

- Per-route `error.tsx` files (e.g. `app/(shell)/settings/error.tsx`). The root `error.tsx` is enough.
- Sentry / error reporting integration.
- Custom messages per HTTP status — one design, "Something went wrong" + reset button.

## Files

- `src/frontend/app/error.tsx` (NEW, `"use client"`)
- `src/frontend/app/not-found.tsx` (NEW)
- `src/frontend/app/global-error.tsx` (NEW, `"use client"`, includes its own `<html><body>` per Next.js requirements)

## Approach

1. Crib structure from `app/login/page.tsx` — centered card on warm surface.
2. `error.tsx` receives `{ error, reset }` props. Show a friendly message + "Try again" button (calls `reset()`) + "Take me home" link.
3. `not-found.tsx` receives no props. Show "Page not found" + home link.
4. `global-error.tsx` must include `<html><body>` since it replaces the root layout. Style inline (no globals.css access).

## Acceptance

- Visit a route that doesn't exist (e.g. `/blah`) → branded 404 page.
- Throw an error in a server component (temporarily add `throw new Error("test")` in `app/(shell)/page.tsx`) → branded error page with retry button.
- All three pages use `--accent`, `--surface`, `--ink` tokens; dark mode looks right.

## Test plan

- Manual: visit `/blah-nonexistent` → see custom 404.
- Manual: temporarily throw in `app/(shell)/page.tsx`, hit `/` → see custom error. Revert after.
- Build: `npm run build` should generate `not-found` as static and `error` as dynamic.

## Conflicts

None.
