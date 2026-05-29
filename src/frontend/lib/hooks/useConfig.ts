"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ConfigUpdateInput } from "@/lib/api/schemas";
import type { SerializedConfig } from "@/lib/api/types";

const KEY = ["config"] as const;

export function useConfig() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<{ config: SerializedConfig }>("/api/config"),
    select: (data) => data.config,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ConfigUpdateInput) =>
      api.patch<{ config: SerializedConfig }>("/api/config", patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
