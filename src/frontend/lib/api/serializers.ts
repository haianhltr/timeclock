import type { Entry } from "@prisma/client";

// Prisma returns Date objects for @db.Date — JSON.stringify would emit a full
// ISO timestamp. The client + smoke checks expect YYYY-MM-DD.
export function serializeEntry(e: Entry) {
  return {
    date: e.date.toISOString().slice(0, 10),
    type: e.type,
    gate: e.gate,
    desk: e.desk,
    reason: e.reason,
    leftHome: e.leftHome,
    mood: e.mood,
    note: e.note,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export function parseIsoDate(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}
