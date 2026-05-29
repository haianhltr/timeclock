import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckInPage } from "@/components/CheckInPage";
import { getConfig } from "@/lib/api/config";
import { serializeConfig } from "@/lib/api/serializers";
import { todayIso } from "@/lib/today";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  const config = await getConfig();
  return (
    <CheckInPage today={todayIso()} config={serializeConfig(config)} />
  );
}
