# Sprint 04 — show mood in `/history` rows

## Goal

The check-in form captures `mood` (1–5) but the History list doesn't display it. Add a small chip showing the mood label and colour.

## Why

Information that's collected but invisible is dead data. The prototype's history rows had a mood column. Should match.

## Scope

For each TIMED row in `EntryList`:

- When `e.mood != null`, render a small chip on the right (before the Late/On-time badge) with the mood's label and accent colour.
- Labels: 1=Rough, 2=Meh, 3=OK, 4=Good, 5=Great (same as `EntryForm` MOODS map).
- Colours: reuse the same `hue` strings from MOODS — late/amber/good etc.
- Hide on NOTE rows (NOTE entries don't have a mood).

## Out of scope

- Filter history by mood — premature.
- Mood emoji vs label — stick with label (matches prototype).
- Per-month mood averages on dashboard — separate sprint.

## Files

- `src/frontend/components/EntryList.tsx`
- (optional) extract `MOODS` constant to a shared `lib/moods.ts` so EntryForm and EntryList don't duplicate it.

## Approach

1. Pull the `MOODS` array out of `EntryForm.tsx` into `lib/moods.ts`. Re-export with `as const`.
2. In `EntryList.tsx` TIMED branch, add a chip between the reason and the Late/On-time badge:
   ```tsx
   {e.mood != null && (
     <span style={{ ...mood-chip-style with MOODS[mood-1].hue ... }}>
       {MOODS[mood-1].label}
     </span>
   )}
   ```
3. Keep the chip narrow (~46px) so the row doesn't overflow on mobile.

## Acceptance

- A TIMED entry saved with mood=4 shows a "Good" green chip in History.
- TIMED entry with no mood (legacy rows from the SQL seed) shows nothing where the chip would be.
- NOTE rows are unchanged.

## Test plan

- Manual: open `/check-in`, save with mood=Great → see "Great" chip in `/history`.
- Manual: open `/history` for the seeded rows (no mood set) — no chip rendered, row layout intact.

## Conflicts

- Sprint 05 (`left-home-field`) touches EntryList too if it adds a left-home indicator. Minor conflict; merge whichever lands first.
