import "server-only";
import { cookies } from "next/headers";

export const THEME_COOKIE = "clockin.theme";

export type Theme = "light" | "dark";

// Null when the visitor hasn't picked yet — caller should omit data-theme so
// the @media (prefers-color-scheme) fallback in globals.css takes over.
export async function getTheme(): Promise<Theme | null> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  if (v === "dark") return "dark";
  if (v === "light") return "light";
  return null;
}
