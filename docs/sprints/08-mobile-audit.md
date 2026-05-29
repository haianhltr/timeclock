# Sprint 08 — mobile audit + fixes (375 × 667)

## Goal

Every public route renders correctly at iPhone-SE size: no horizontal scroll, no cramped/truncated controls, no overlapping text. Tap targets ≥ 44 px where reasonable.

## Why

The sidebar/bottom-nav swap exists (820 px breakpoint) but I haven't walked the app end-to-end on a real narrow viewport. Likely candidates for trouble:

- `EntryForm` time pickers (two side-by-side at 20px font).
- `SettingsForm` accent swatches + time pickers.
- `Insights` hero — donut + 4-stat grid wraps oddly when narrow.
- `EntryList` rows — 6 columns of content with `whiteSpace: nowrap` will overflow.
- `CalendarHeatmap` — 7-column grid at 320 px innerWidth gets tight.
- Auth pill in the top bar — initials + email + "Sign out" can be cramped.

## Scope

For each route (`/`, `/check-in`, `/history`, `/settings`, `/login`):

1. Open DevTools at 375 × 667.
2. Toggle dark + light.
3. Toggle gate/desk on `/`.
4. Note layout issues.
5. Fix with minimal additions to inline styles or a small `@media (max-width: 480px)` block in `globals.css`.

Expected fixes:

- Stat grid: switch to 1-col when `< 280 px` available.
- EntryList row: stack the time + reason vertically when narrow; keep the badge on the right.
- TopBar: replace email with just initials at narrow widths.
- SettingsForm: full-width swatches container; keep the time picker readable.

## Out of scope

- Tablet (768 × 1024) — falls between mobile + desktop, but the current shell already gracefully scales. Spot-check, don't redesign.
- Landscape phone rendering.
- New mobile-specific features (pull-to-refresh, swipe gestures).

## Files

Likely touched:

- `src/frontend/app/globals.css` — add a `@media (max-width: 480px)` block if needed.
- `src/frontend/components/EntryForm.tsx`
- `src/frontend/components/EntryList.tsx`
- `src/frontend/components/Insights.tsx`
- `src/frontend/components/AppShell.tsx`
- `src/frontend/components/charts/CalendarHeatmap.tsx`

## Approach

1. Build a checklist in this brief's PR description as you walk the routes — record what's broken before fixing.
2. Prefer container-query-ish patterns (`minmax(min(100%, X), 1fr)`) over media queries when possible — they're more local.
3. Re-test after each fix; one change at narrow widths can affect the desktop layout.

## Acceptance

- All 5 routes pass a visual scan at 375 × 667 in both themes.
- No horizontal scroll on any page.
- All buttons / nav items are reachable with a finger (44 × 44 minimum where it makes sense).
- The bottom nav doesn't overlap content (`padding-bottom` accounts for the nav height + safe-area).

## Test plan

- Manual: DevTools mobile emulation, walk each route.
- Manual: a real phone (your own) for one final pass.
- Optional: Playwright + percy/visual diff — out of scope; future work.

## Conflicts

- Touches enough files that almost any other sprint may collide. Should ideally land near the front of the queue, or be done after the bigger feature sprints settle.
