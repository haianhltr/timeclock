import { auth } from "@/auth";
import { HistoryView } from "@/components/HistoryView";
import { getConfig } from "@/lib/api/config";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const config = await getConfig();
  return <HistoryView canEdit={isAdmin} target={config.targetDesk} />;
}
