import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Config } from "@prisma/client";

// Singleton row, seeded by 20260529152332_add_config. The defensive create
// is a belt-and-braces fallback in case the seed hasn't run (e.g. fresh
// dev DB someone manually migrated past the seed).
//
// `cache()` dedupes within a single request — layout + page can both call
// this without doing two queries.
export const getConfig = cache(async (): Promise<Config> => {
  const existing = await prisma.config.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.config.create({ data: { id: 1 } });
});
