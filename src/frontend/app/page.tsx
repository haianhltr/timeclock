import { auth } from "@/auth";
import { Home } from "@/components/Home";
import { TopBar } from "@/components/TopBar";
import { todayIso } from "@/lib/today";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <TopBar />
      <Home isAdmin={isAdmin} today={todayIso()} />
    </>
  );
}
