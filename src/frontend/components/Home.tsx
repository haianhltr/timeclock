"use client";

import { EntryForm } from "./EntryForm";
import { EntryList } from "./EntryList";
import { Insights } from "./Insights";
import { useEntries } from "@/lib/hooks/useEntries";
import type { SerializedConfig } from "@/lib/api/types";

type Props = {
  isAdmin: boolean;
  today: string;
  config: SerializedConfig;
};

export function Home({ isAdmin, today, config }: Props) {
  const { data: entries } = useEntries();
  const existing = entries?.find((e) => e.date === today);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px clamp(18px, 4vw, 32px) 64px",
        animation: "fadeIn .4s ease both",
      }}
    >
      {isAdmin ? (
        <EntryForm
          today={today}
          existing={existing}
          target={config.targetMin}
          boss={config.boss}
        />
      ) : (
        <PublicHeader />
      )}

      <Insights target={config.targetMin} />

      <section style={{ marginTop: 32 }}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--ink-2)",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          History
        </h2>
        <EntryList canEdit={isAdmin} target={config.targetMin} />
      </section>
    </main>
  );
}

function PublicHeader() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "12px 0 4px",
      }}
    >
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-.02em",
          textWrap: "balance",
        }}
      >
        Your morning, in two timestamps.
      </h1>
      <p
        style={{
          margin: 0,
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        A personal time-tracking log. Public read · admin write.
      </p>
    </div>
  );
}
