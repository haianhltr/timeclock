import "server-only";
import { prisma } from "@/lib/prisma";
import type { Config } from "@prisma/client";

// Singleton row, seeded by 20260529152332_add_config. The defensive create
// is a belt-and-braces fallback in case the seed hasn't run (e.g. fresh
// dev DB someone manually migrated past the seed).
export async function getConfig(): Promise<Config> {
  const existing = await prisma.config.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.config.create({ data: { id: 1 } });
}
