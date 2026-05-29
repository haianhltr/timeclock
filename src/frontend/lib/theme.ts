import "server-only";
import { cookies } from "next/headers";

export const THEME_COOKIE = "clockin.theme";

export type Theme = "light" | "dark";

export async function getTheme(): Promise<Theme> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return v === "dark" ? "dark" : "light";
}
