"use client";

import { EntryForm } from "./EntryForm";
import { useEntries } from "@/lib/hooks/useEntries";
import type { SerializedConfig } from "@/lib/api/types";

type Props = {
  today: string;
  config: SerializedConfig;
};

export function CheckInPage({ today, config }: Props) {
  const { data: entries } = useEntries();
  const existing = entries?.find((e) => e.date === today);
  return (
    <EntryForm
      today={today}
      existing={existing}
      target={config.targetDesk}
      boss={config.boss}
    />
  );
}
