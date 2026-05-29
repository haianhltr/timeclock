# Sprint 10 — CSV export + import for entries

## Goal

The admin can download all entries as a CSV and upload a CSV to restore / seed. This is the backup/portability mechanism the app currently lacks.

## Why

There's only one Postgres pod on a 2 Gi PVC. If that PVC ever fails, the data is gone — I have no off-cluster backup. CSV export is the lightest-weight backup. Import lets the admin restore (or seed a fresh local DB without `psql`).

## Scope

### Export — `GET /api/entries/export`

- Public read (matches the rest of `/api/entries`).
- Returns `Content-Type: text/csv` with `Content-Disposition: attachment; filename="clockin-entries-2026-05-29.csv"`.
- Columns: `date,type,gate,desk,reason,leftHome,mood,note,createdAt,updatedAt`.
- Quoting: standard CSV — wrap fields containing `,`, `"`, or newlines in double quotes; escape inner `"` as `""`.
- Streams from `prisma.entry.findMany` — single read.

### Import — `POST /api/entries/import`

- Admin only.
- Body: `multipart/form-data` with a single CSV file, OR `text/csv` raw body. **Recommend** multipart for browser ergonomics.
- Parse, validate each row with a Zod schema (reuse `createEntrySchema` plus minor adapters for the wire format).
- For each row: `upsert` by date (so the operation is replayable). Wrap the whole batch in a Prisma transaction so a single bad row aborts everything cleanly.
- Return `{ imported: number, errors: [{ row, message }] }`.

### UI — small additions to `/history`

- Admin-only "Export CSV" button → triggers download via the route.
- Admin-only "Import CSV" button → opens a file picker → POSTs → shows toast with import count.

## Out of scope

- JSON export/import — CSV covers the use case.
- Scheduled / automated backups — separate sprint (cron job, S3, etc.).
- Encrypted backups.

## Files

- `src/frontend/app/api/entries/export/route.ts` (NEW)
- `src/frontend/app/api/entries/import/route.ts` (NEW)
- `src/frontend/lib/api/csv.ts` (NEW) — small encoder/decoder + tests.
- `src/frontend/lib/api/schemas.ts` — maybe a `csvRowSchema` if it differs from the API shape.
- `src/frontend/components/HistoryView.tsx` or a new `EntryToolbar.tsx` — admin buttons.
- `scripts/smoke.sh` — add a `GET /api/entries/export` 200 check.

## Approach

1. Implement `lib/api/csv.ts`:
   - `encodeCsv(rows: SerializedEntry[]): string`
   - `decodeCsv(text: string): { rows: ParsedRow[], errors: { line: number, message: string }[] }`
   - Vitest the round-trip + edge cases (commas in reason, quotes in note, BOM handling).
2. `app/api/entries/export/route.ts`: `GET` returns `new Response(csvString, { headers })`. No `apiHandler` wrapper because the response isn't JSON.
3. `app/api/entries/import/route.ts`: parse multipart with `formidable` or Next 15's built-in `req.formData()`. Use `apiHandler(..., { requireAdmin: true })`.
4. UI buttons trigger `<a download>` for export and a hidden `<input type="file">` for import.

## Acceptance

- Admin clicks Export → CSV file downloads with all entries.
- Admin re-imports the same CSV → no duplicates (upsert by date).
- Admin imports a CSV missing required fields → 400 with per-row error list.
- Public visitor: Export works for them too (it's open); Import 401.
- Smoke: `GET /api/entries/export` → 200.

## Test plan

- Vitest: round-trip an array of `SerializedEntry` through encode → decode → assert equal.
- Vitest: decode handles BOM, quoted-comma, quoted-newline, double-quote-escaped fields.
- Manual: download → edit one row → re-upload → see the edit reflected in `/history`.

## Conflicts

- Probably none, unless Sprint 06 (edit modal) and this one both add toolbars on `/history`.
