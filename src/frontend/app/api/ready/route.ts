import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Deep readiness check — confirms the app can reach the database. Distinct
// from /api/health (which only proves the Next.js server is up).
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", db: "ok" });
  } catch (err) {
    return NextResponse.json(
      {
        status: "not-ready",
        db: "error",
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 503 }
    );
  }
}
