"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/api/schemas";
import type { SerializedEntry } from "@/lib/api/types";

const KEYS = {
  all: ["entries"] as const,
};

export function useEntries() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<{ entries: SerializedEntry[] }>("/api/entries"),
    select: (data) => data.entries,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEntryInput) =>
      api.post<{ entry: SerializedEntry }>("/api/entries", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, ...patch }: { date: string } & UpdateEntryInput) =>
      api.patch<{ entry: SerializedEntry }>(`/api/entries/${date}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      api.delete<{ ok: true }>(`/api/entries/${date}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
