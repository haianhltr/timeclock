import { z } from "zod";

// "2026-05-29" — UTC date, no time component
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

// Minutes-since-midnight. Up to 30h so late-night entries past midnight work.
const minute = z.number().int().min(0).max(60 * 30);
const mood = z.number().int().min(1).max(5);
const reason = z.string().max(500);
const noteText = z.string().min(1).max(2000);

const timedBase = z.object({
  type: z.literal("TIMED"),
  gate: minute,
  desk: minute,
  reason: reason.nullable().optional(),
  leftHome: minute.nullable().optional(),
  mood: mood.nullable().optional(),
});

const noteBase = z.object({
  type: z.literal("NOTE"),
  note: noteText,
});

// POST: full record, required fields per type.
export const createEntrySchema = z.discriminatedUnion("type", [
  timedBase.extend({ date: isoDate }),
  noteBase.extend({ date: isoDate }),
]);

// PATCH: partial update. Date comes from the URL, not the body. The route
// enforces type-consistency against the existing row, so `type` is omitted
// from the input shape (changing type is delete + recreate).
export const updateEntrySchema = z
  .object({
    gate: minute.optional(),
    desk: minute.optional(),
    reason: reason.nullable().optional(),
    leftHome: minute.nullable().optional(),
    mood: mood.nullable().optional(),
    note: noteText.optional(),
  })
  .strict();

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
