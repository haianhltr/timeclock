import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsForm } from "@/components/SettingsForm";
import { TopBar } from "@/components/TopBar";
import { getConfig } from "@/lib/api/config";
import { serializeConfig } from "@/lib/api/serializers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  const config = await getConfig();
  return (
    <>
      <TopBar />
      <main
        style={{
          padding: "32px clamp(18px, 4vw, 32px) 64px",
          animation: "fadeIn .4s ease both",
        }}
      >
        <SettingsForm initial={serializeConfig(config)} />
      </main>
    </>
  );
}
