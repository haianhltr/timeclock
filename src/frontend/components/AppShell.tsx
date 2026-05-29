import Link from "next/link";
import { auth, signOut } from "@/auth";
import {
  AppBottomNav,
  AppSidebar,
  AppTopBar,
  NAV_ICON,
  type NavItem,
} from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";

const ADMIN_NAV: NavItem[] = [
  { href: "/check-in", label: "Check-in", icon: NAV_ICON.checkIn },
  { href: "/", label: "Insights", icon: NAV_ICON.insights },
  { href: "/history", label: "History", icon: NAV_ICON.history },
  { href: "/settings", label: "Settings", icon: NAV_ICON.settings },
];

const PUBLIC_NAV: NavItem[] = [
  { href: "/", label: "Insights", icon: NAV_ICON.insights },
  { href: "/history", label: "History", icon: NAV_ICON.history },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const items = isAdmin ? ADMIN_NAV : PUBLIC_NAV;

  const authPill = user ? (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
      style={{ display: "flex", alignItems: "center", gap: 11 }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 99,
          background: "var(--accent)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {(user.email?.[0] || "?").toUpperCase()}
      </div>
      <div style={{ minWidth: 0, lineHeight: 1.25 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.email?.split("@")[0]}
        </div>
        <button
          type="submit"
          style={{
            fontSize: 11.5,
            color: "var(--muted)",
            padding: 0,
          }}
        >
          Sign out
        </button>
      </div>
    </form>
  ) : (
    <Link
      href="/login"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 14px",
        borderRadius: "var(--radius-sm)",
        background: "var(--accent)",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        boxShadow: "0 5px 14px -6px var(--accent)",
        whiteSpace: "nowrap",
      }}
    >
      <LockIcon /> Sign in to edit
    </Link>
  );

  // Theme toggle sits to the right of the auth pill — works in both the
  // sidebar (stacked) and the mobile top bar (inline).
  const authSlotWithToggle = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {authPill}
      <ThemeToggle />
    </div>
  );

  return (
    <div className="app-root" style={{ display: "flex", minHeight: "100vh" }}>
      <AppSidebar
        items={items}
        authSlot={authSlotWithToggle}
        publicHint={!isAdmin}
      />
      <AppTopBar authSlot={authSlotWithToggle} />
      <main
        className="app-main"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "32px clamp(18px, 4vw, 48px) 96px",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>{children}</div>
      </main>
      <AppBottomNav items={items} />
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
