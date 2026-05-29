# Sprint 05 — `leftHome` field in the check-in form

## Goal

The `Entry` schema has a `leftHome Int?` column (minutes-since-midnight). The Zod schemas accept it. The API stores it. But the check-in form never collects it. Add an optional "I left home at…" field below "Add a reason".

## Why

For days when the user wants to track door-to-gate delta (not just gate-to-desk), they need to record `leftHome`. The data path is fully wired except for the UI control.

## Scope

`EntryForm.tsx` (TIMED branch only):

- Add a checkbox `"Track when I left home"` below "Add a reason".
- When checked, render a `<TimePicker>` for the leftHome value.
- Persist on save (POST/PATCH already accept `leftHome`).
- On load, if `existing.leftHome != null`, default the checkbox to checked.

`EntryList.tsx`:

- Optionally show `left home 7:30` in the reason area when `e.leftHome != null` (matches prototype's pattern of `· left home 7:30` appended to the reason).

## Out of scope

- A "home → gate → desk" cascade visualisation. Just the raw time.
- Insights chart for "time from home to gate" — separate sprint if useful.
- Defaulting leftHome to (gate - 30 min) as a smart guess — keep it explicit.

## Files

- `src/frontend/components/EntryForm.tsx`
- `src/frontend/components/EntryList.tsx` (optional — for displaying)
- `src/frontend/lib/api/schemas.ts` (already supports `leftHome`, no change needed)

## Approach

1. Add `[useLeftHome, setUseLeftHome]` and `[leftHome, setLeftHome]` state, mirroring the existing `useReason`/`reason` pattern.
2. Resync effect populates from `existingTimed.leftHome`.
3. `cleanLeftHome = useLeftHome ? toMin(leftHome) : null`.
4. In submit handler, include `leftHome: cleanLeftHome` in the create/update payload.
5. In `EntryList.tsx` (optional), append `· left home {fmt(e.leftHome)}` to the reason cell when set.

## Acceptance

- Form: check the box, enter `7:30`, save → entry persisted with `leftHome=450`.
- Re-open the form on the same day → checkbox stays checked, value pre-filled.
- Optional: history row shows `· left home 7:30`.
- GET `/api/entries` reflects the new value.

## Test plan

- Manual: full round-trip (create → reload → edit → save → list).
- Vitest: add a `EntryForm` unit test if a testing library is added; otherwise rely on the schema test which already covers leftHome.

## Conflicts

- Sprint 04 (`show-mood-in-history`) touches EntryList. If both ship, merge cleanly.
- Sprint 06 (`edit-historical-entries`) might use the same form via a modal — make sure the leftHome state isn't lost when the form is rendered in a modal context.
