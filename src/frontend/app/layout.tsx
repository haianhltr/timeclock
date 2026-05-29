import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { getConfig } from "@/lib/api/config";
import { getTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "clockin",
  description: "Your morning, in two timestamps.",
};

const ACCENT_RE = /^#[0-9a-fA-F]{6}$/;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Falling back silently keeps /login renderable if the DB is briefly down.
  let accentHex = "#e8744e";
  try {
    const config = await getConfig();
    if (ACCENT_RE.test(config.accentHex)) accentHex = config.accentHex;
  } catch {
    // use default
  }
  const theme = await getTheme();
  return (
    <html
      lang="en"
      data-theme={theme}
      style={{ ["--accent" as string]: accentHex }}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
