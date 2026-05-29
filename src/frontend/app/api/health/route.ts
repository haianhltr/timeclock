import { NextResponse } from "next/server";

// Shallow liveness check — no DB query, no auth. Used by smoke.sh and any
// k8s/ingress probe to confirm the Next.js server is up and routing works.
export function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
  });
}
