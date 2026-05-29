"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { THEME_COOKIE } from "@/lib/theme";

export async function toggleTheme() {
  const store = await cookies();
  const current = store.get(THEME_COOKIE)?.value;
  const next = current === "dark" ? "light" : "dark";
  store.set(THEME_COOKIE, next, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    // 1 year — user's pick should persist
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
