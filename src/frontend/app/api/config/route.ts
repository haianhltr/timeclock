import { apiHandler } from "@/lib/api/auth";
import { getConfig } from "@/lib/api/config";
import { configUpdateSchema } from "@/lib/api/schemas";
import { serializeConfig } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async () => {
  const config = await getConfig();
  return { config: serializeConfig(config) };
});

export const PATCH = apiHandler(
  async (req: Request) => {
    const patch = configUpdateSchema.parse(await req.json());
    const updated = await prisma.config.upsert({
      where: { id: 1 },
      create: { id: 1, ...patch },
      update: patch,
    });
    return { config: serializeConfig(updated) };
  },
  { requireAdmin: true }
);
