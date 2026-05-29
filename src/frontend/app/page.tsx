import { auth } from "@/auth";
import { Home } from "@/components/Home";
import { TopBar } from "@/components/TopBar";
import { getConfig } from "@/lib/api/config";
import { serializeConfig } from "@/lib/api/serializers";
import { todayIso } from "@/lib/today";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [session, config] = await Promise.all([auth(), getConfig()]);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <TopBar />
      <Home
        isAdmin={isAdmin}
        today={todayIso()}
        config={serializeConfig(config)}
      />
    </>
  );
}
