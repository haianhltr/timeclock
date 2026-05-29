# Sprint 06 — per-row edit on `/history`

## Goal

Admin can edit any historical entry (not just today's) without dropping to `psql`. The History page already has a delete `×` button per row; add an edit affordance next to it.

## Why

I (the operator) seeded 12 rows from a written log. Two of them have `desk = gate` because the original log read "not stated" and I chose that fallback. To fix those, I currently have to UPDATE via SQL. The form on `/check-in` only ever edits **today**'s entry. Adding row-level edit closes the gap.

## Scope

- New: an "edit" pencil icon button on each TIMED row (admin only). Click → opens a modal containing the same form fields as `EntryForm`, pre-filled from that row.
- NOTE rows get an edit button too (modal opens with a textarea pre-filled).
- Save calls `PATCH /api/entries/[date]`.
- Cancel closes the modal without saving.
- The modal should respect the dark theme.

## Out of scope

- Bulk edit / multi-select.
- Changing the entry's `date` (rename → would mean DELETE old + POST new; defer).
- Changing type (TIMED↔NOTE) — same constraint as elsewhere; explicit delete + recreate.

## Files

- `src/frontend/components/EntryList.tsx` — add edit button per row.
- `src/frontend/components/EntryEditModal.tsx` (NEW) — modal wrapping a reusable form body.
- Possibly refactor `EntryForm.tsx` to extract the fields into a shared component used by both `/check-in` and the modal, OR keep `EntryEditModal` self-contained with a slimmer field set. **Recommend** the refactor — DRY pays off.
- `src/frontend/lib/hooks/useEntries.ts` — `useUpdateEntry` already exists, no change.

## Approach

1. Refactor `EntryForm` to expose `<TimedFields />` and `<NoteFields />` as exported components (they're already extracted as inner components).
2. New `EntryEditModal` that takes an `entry: SerializedEntry` prop, renders the right fields component pre-filled, has Save / Cancel buttons.
3. Use the existing `useUpdateEntry` mutation.
4. Add a pencil button to `EntryList` (admin only); clicking sets local state `{ editing: SerializedEntry | null }`; the modal renders when non-null.
5. Modal styling: position fixed, dark backdrop, centered card. Trap focus inside. ESC closes.

## Acceptance

- Sign in as admin → `/history` → each row shows pencil + ×.
- Click pencil on 5/14 → modal opens with gate=8:15, desk=8:15, reason="Traffic at exit 254 took 20 min" pre-filled.
- Change desk to 8:25, save → modal closes, row re-renders with new value, dashboard recomputes.
- Public view: no pencil shown.
- Mobile: modal goes full-screen.

## Test plan

- Manual: edit one of the seeded rows from `desk=gate` to a real value.
- Manual: cancel without saving → no PATCH fired.
- Manual: ESC key closes.
- Manual: dark theme — modal renders correctly.

## Conflicts

- Sprint 04 (mood chip) + Sprint 05 (leftHome) both extend the form/list. Sprint 06 refactors form pieces — merge whichever lands first and rebase others.
