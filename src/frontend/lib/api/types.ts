// Wire types — match the shape returned by `serializeEntry`. Hand-written
// rather than `ReturnType<typeof serializeEntry>` so client components don't
// pull a transitive @prisma/client type into the bundle.

export type EntryType = "TIMED" | "NOTE";

export type SerializedEntry = {
  date: string; // YYYY-MM-DD
  type: EntryType;
  gate: number | null;
  desk: number | null;
  reason: string | null;
  leftHome: number | null;
  mood: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
