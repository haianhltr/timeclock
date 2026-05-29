import { Prisma } from "@prisma/client";
import { ApiError, apiHandler } from "@/lib/api/auth";
import { createEntrySchema } from "@/lib/api/schemas";
import { parseIsoDate, serializeEntry } from "@/lib/api/serializers";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async () => {
  const rows = await prisma.entry.findMany({ orderBy: { date: "asc" } });
  return { entries: rows.map(serializeEntry) };
});

export const POST = apiHandler(
  async (req: Request) => {
    const input = createEntrySchema.parse(await req.json());
    const { date, ...rest } = input;
    try {
      const created = await prisma.entry.create({
        data: { ...rest, date: parseIsoDate(date) },
      });
      return { entry: serializeEntry(created) };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ApiError(409, `Entry for ${date} already exists`);
      }
      throw err;
    }
  },
  { requireAdmin: true }
);
