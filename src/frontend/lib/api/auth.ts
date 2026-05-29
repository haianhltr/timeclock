import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Not authenticated");
  }
  return session.user;
}

export async function requireApiAdmin() {
  const user = await requireApiUser();
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Admin role required");
  }
  return user;
}

// Architectural lever for the public-read model: reads pass no opts; writes
// opt in with { requireAdmin: true }. Forgetting the flag on a write leaks
// write access to the public — review every new route against this rule.
export function apiHandler<TArgs extends unknown[], TBody>(
  handler: (...args: TArgs) => Promise<TBody>,
  opts: { requireAdmin?: boolean } = {}
) {
  return async (...args: TArgs): Promise<NextResponse> => {
    try {
      if (opts.requireAdmin) await requireApiAdmin();
      const body = await handler(...args);
      return NextResponse.json(body);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.issues },
          { status: 400 }
        );
      }
      console.error("[api]", err);
      const message = err instanceof Error ? err.message : "Internal error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
