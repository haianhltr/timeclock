// Wire types — match what server serializers return. Hand-written rather
// than `ReturnType<typeof ...>` so client components don't pull a transitive
// @prisma/client type into the bundle.

export type EntryType = "TIMED" | "NOTE";

export type SerializedConfig = {
  targetDesk: number;
  targetGate: number;
  boss: string;
  accentHex: string;
  updatedAt: string;
};

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
