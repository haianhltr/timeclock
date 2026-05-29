"use client";

import { EntryList } from "./EntryList";
import { useEntries } from "@/lib/hooks/useEntries";

type Props = {
  canEdit: boolean;
  target: number;
};

export function HistoryView({ canEdit, target }: Props) {
  const { data: entries } = useEntries();
  const count = entries?.length ?? 0;
  return (
    <div style={{ animation: "fadeIn .35s ease both" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-.02em",
        }}
      >
        History
      </h1>
      <p style={{ margin: "0 0 22px", color: "var(--ink-2)", fontSize: 14 }}>
        {count} check-in{count === 1 ? "" : "s"}, newest first
      </p>
      <EntryList canEdit={canEdit} target={target} />
    </div>
  );
}
