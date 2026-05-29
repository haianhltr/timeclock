"use client";

import { fmt } from "@/lib/dates";
import { useDeleteEntry, useEntries } from "@/lib/hooks/useEntries";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// 8:05 — same hardcoded default as EntryForm; both will read from tweaks later.
const TARGET = 485;

export function EntryList({ canEdit = false }: { canEdit?: boolean }) {
  const { data: entries, isLoading, error } = useEntries();
  const del = useDeleteEntry();

  if (isLoading) {
    return (
      <div style={{ padding: 18, color: "var(--muted)", textAlign: "center" }}>
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{
          padding: "12px 14px",
          background: "var(--late-soft)",
          color: "var(--late)",
          fontSize: 13,
          borderRadius: "var(--radius-sm)",
        }}
      >
        {error.message}
      </div>
    );
  }
  if (!entries || entries.length === 0) {
    return (
      <div
        style={{
          padding: 30,
          color: "var(--muted)",
          textAlign: "center",
          fontSize: 13.5,
        }}
      >
        No check-ins yet.
      </div>
    );
  }

  const rows = [...entries].reverse(); // newest first

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((e) => {
        const d = new Date(e.date + "T00:00:00");
        const isNote = e.type === "NOTE";
        const late = !isNote && e.desk != null && e.desk > TARGET;
        return (
          <div
            key={e.date}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "var(--surface)",
              borderRadius: "var(--radius-sm)",
              border: isNote
                ? "1px dashed var(--amber)"
                : "1px solid var(--line-soft)",
              padding: "12px 16px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ width: 80, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {MO[d.getMonth()]} {d.getDate()}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                {WD[d.getDay()]}
              </div>
            </div>
            {isNote ? (
              <>
                <div style={{ flex: 1, fontSize: 13.5, color: "var(--ink-2)" }}>
                  {e.note}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: "var(--amber-soft)",
                    color: "var(--accent-ink)",
                  }}
                >
                  Note
                </span>
              </>
            ) : (
              <>
                <div
                  className="mono"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    width: 130,
                    flexShrink: 0,
                  }}
                >
                  {fmt(e.gate)}{" "}
                  <span style={{ color: "var(--muted)" }}>→</span> {fmt(e.desk)}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "var(--ink-2)",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.reason || <span style={{ color: "var(--muted)" }}>—</span>}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: late ? "var(--late-soft)" : "var(--good-soft)",
                    color: late
                      ? "oklch(0.48 0.16 22)"
                      : "oklch(0.42 0.10 158)",
                  }}
                >
                  {late ? "Late" : "On time"}
                </span>
              </>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete entry for ${e.date}?`)) return;
                  del.mutate(e.date);
                }}
                disabled={del.isPending}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--muted)",
                  padding: "4px 6px",
                  borderRadius: 6,
                }}
                aria-label={`Delete ${e.date}`}
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
