import { Prisma } from "@prisma/client";
import { ApiError, apiHandler } from "@/lib/api/auth";
import { isoDate, updateEntrySchema } from "@/lib/api/schemas";
import { parseIsoDate, serializeEntry } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ date: string }> };

async function paramsDate(ctx: Ctx): Promise<Date> {
  const { date } = await ctx.params;
  const parsed = isoDate.safeParse(date);
  if (!parsed.success) throw new ApiError(400, "Invalid date in URL");
  return parseIsoDate(parsed.data);
}

export const PATCH = apiHandler(
  async (req: Request, ctx: Ctx) => {
    const date = await paramsDate(ctx);
    const input = updateEntrySchema.parse(await req.json());

    const existing = await prisma.entry.findUnique({ where: { date } });
    if (!existing) throw new ApiError(404, "Entry not found");

    // Don't let TIMED-only fields land on a NOTE row (or vice versa).
    if (existing.type === "TIMED" && input.note !== undefined) {
      throw new ApiError(400, "Cannot set `note` on a TIMED entry");
    }
    if (existing.type === "NOTE") {
      const timedFields = ["gate", "desk", "reason", "leftHome", "mood"] as const;
      for (const f of timedFields) {
        if (input[f] !== undefined) {
          throw new ApiError(400, `Cannot set \`${f}\` on a NOTE entry`);
        }
      }
    }

    const updated = await prisma.entry.update({ where: { date }, data: input });
    return { entry: serializeEntry(updated) };
  },
  { requireAdmin: true }
);

export const DELETE = apiHandler(
  async (_req: Request, ctx: Ctx) => {
    const date = await paramsDate(ctx);
    try {
      await prisma.entry.delete({ where: { date } });
      return { ok: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new ApiError(404, "Entry not found");
      }
      throw err;
    }
  },
  { requireAdmin: true }
);
