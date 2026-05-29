import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsForm } from "@/components/SettingsForm";
import { getConfig } from "@/lib/api/config";
import { serializeConfig } from "@/lib/api/serializers";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  const config = await getConfig();
  return <SettingsForm initial={serializeConfig(config)} />;
}
