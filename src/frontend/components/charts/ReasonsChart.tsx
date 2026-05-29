"use client";

import type { ReasonBucket } from "@/lib/metrics";

type Props = { reasons: ReasonBucket[] };

export function ReasonsChart({ reasons }: Props) {
  if (reasons.length === 0) {
    return (
      <div style={{ color: "var(--muted)", fontSize: 13.5, padding: "16px 0" }}>
        Clean record — no reasons on file.
      </div>
    );
  }
  const max = Math.max(...reasons.map((r) => r.n), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {reasons.slice(0, 6).map((r) => (
        <div
          key={r.reason}
          style={{ display: "flex", alignItems: "center", gap: 11 }}
        >
          <div
            style={{
              width: 116,
              flexShrink: 0,
              fontSize: 12.5,
              color: "var(--ink-2)",
              textAlign: "right",
              lineHeight: 1.25,
            }}
          >
            {r.reason}
          </div>
          <div
            style={{
              flex: 1,
              height: 22,
              background: "var(--surface-2)",
              borderRadius: 7,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(r.n / max) * 100}%`,
                height: "100%",
                background: "var(--amber)",
                borderRadius: 7,
              }}
            />
          </div>
          <div
            className="mono"
            style={{
              width: 18,
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--accent-ink)",
            }}
          >
            {r.n}
          </div>
        </div>
      ))}
    </div>
  );
}
