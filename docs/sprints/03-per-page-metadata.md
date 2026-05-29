# Sprint 03 — per-page title + OG metadata

## Goal

Every route has its own `<title>` (browser tab + bookmarks + history) and an OG description / image (link previews in iMessage, Slack, Discord, etc.).

## Why

Today only the root layout sets metadata, so every page shares the same title and there's no rich preview when the URL gets shared. The favicon already exists; OG image can reuse it (or a larger PNG variant).

## Scope

Add `export const metadata: Metadata` to each page:

- `app/(shell)/page.tsx` → `Insights | clockin`
- `app/(shell)/check-in/page.tsx` → `Check-in | clockin`
- `app/(shell)/history/page.tsx` → `History | clockin`
- `app/(shell)/settings/page.tsx` → `Settings | clockin`
- `app/login/page.tsx` → `Sign in | clockin`

Add Open Graph + Twitter card metadata to the root layout (`app/layout.tsx`):

- `og:site_name`, `og:type`, `og:title`, `og:description`
- `twitter:card`, `twitter:title`, `twitter:description`
- `og:image` pointing at a 1200×630 PNG (new asset under `public/og.png` or generated via `app/opengraph-image.tsx`)

## Out of scope

- Dynamic OG images per entry (e.g. "Today's check-in was 8:04 → on time"). Static is fine.
- Translating titles. English only.
- Canonical URLs / `alternates` — not relevant for a private app.

## Files

- `src/frontend/app/(shell)/page.tsx`
- `src/frontend/app/(shell)/check-in/page.tsx`
- `src/frontend/app/(shell)/history/page.tsx`
- `src/frontend/app/(shell)/settings/page.tsx`
- `src/frontend/app/login/page.tsx`
- `src/frontend/app/layout.tsx`
- `src/frontend/app/opengraph-image.tsx` (NEW) — or a static PNG in `public/`

## Approach

1. `metadata: Metadata = { title: "X | clockin" }` on each page. Next.js merges with root metadata.
2. Root layout: extend `metadata` with `openGraph` + `twitter` + `metadataBase: new URL("https://clockin.randomstuffs.org")`.
3. For the OG image, simplest: `app/opengraph-image.tsx` returning `new ImageResponse(...)` with the Logo + "clockin" wordmark + tagline. 1200×630 size. Next.js auto-wires.

## Acceptance

- Each tab title is distinct in the browser.
- Sharing `https://clockin.randomstuffs.org/` in iMessage / Slack shows a card with the OG image.
- View source on `/`: see `<title>Insights | clockin</title>`, `<meta property="og:image" content="...">`.

## Test plan

- Manual: open each route, check the tab title.
- Lighthouse SEO audit on `/` → expect score 100.
- Paste the URL into a markdown preview tool or `https://www.opengraph.xyz/` → see the card.

## Conflicts

None.
