# Sprint 07 — optimistic create / update / delete on entries

## Goal

Save / edit / delete feel instant. The UI commits the change in the React Query cache before the network round-trip finishes; rollback if the server returns an error.

## Why

On the current `/history` page, deleting a row triggers a network round-trip → the row sits there for ~150 ms → vanishes. On `/check-in`, saving an entry doesn't update the list until refetch. Optimistic updates make this feel native.

## Scope

`useCreateEntry`, `useUpdateEntry`, `useDeleteEntry` (all in `lib/hooks/useEntries.ts`):

- `onMutate(input)` — snapshot current cache, apply optimistic update to the `["entries"]` query, return rollback context.
- `onError(_err, _input, ctx)` — restore from snapshot, surface a toast.
- `onSettled()` — invalidate to reconcile with server truth.

Same pattern for `useUpdateConfig` (saving settings → optimistic accent swatch update is a nice touch).

## Out of scope

- Optimistic auth state changes.
- Multi-tab sync (BroadcastChannel) — overkill.
- Replacing React Query with something lighter — sticking with the existing dep.

## Files

- `src/frontend/lib/hooks/useEntries.ts`
- `src/frontend/lib/hooks/useConfig.ts` (optional bonus)
- `src/frontend/components/EntryList.tsx` — small UX: dim the row during pending delete to indicate it's in flight.

## Approach

1. `useCreateEntry`:
   - `onMutate(input)`: cancel in-flight `["entries"]` queries, read the current `{ entries }` cache, optimistically write `{ entries: [...prev, { ...input, createdAt: now, updatedAt: now }] }` (sort by date), return `{ prev }`.
   - `onError(_, _, ctx)`: restore `ctx.prev`.
   - `onSettled()`: `invalidate(["entries"])`.
2. `useUpdateEntry`: similar — find the matching date, replace fields.
3. `useDeleteEntry`: filter out the date.
4. Toast on rollback — for now a simple `console.error` is acceptable; a real toast system can be a follow-up.

## Acceptance

- Delete a row from `/history` → vanishes instantly; no flicker.
- Save a new entry on `/check-in` → appears in `/history` immediately (route there to verify) without waiting for refetch.
- Force a server 500 (temp throw in the route handler) → optimistic row rolls back, console error logged.

## Test plan

- Manual: open `/history` in two tabs. Delete in one. Refresh the other — the row is also gone. (Validates the network round-trip still happened.)
- Manual: open DevTools Network → Slow 3G → save an entry → optimistic update visible immediately, settles to server truth.

## Conflicts

- Sprint 06 (`edit-historical-entries`) also touches mutation flow. Optimistic update should still work with the modal-based edit; coordinate.
