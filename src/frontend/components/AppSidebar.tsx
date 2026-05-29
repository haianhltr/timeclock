"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export type NavItem = {
  href: string;
  label: string;
  icon: string; // SVG `d` attribute
};

type Props = {
  items: NavItem[];
  authSlot: React.ReactNode; // signed-in pill OR "Sign in" link, rendered at bottom
  publicHint?: boolean;
};

const NAV_ICONS = {
  checkIn: "M12 6v6l4 2",
  insights: "M4 18 L9 12 L13 15 L20 6",
  history: "M4 6h16M4 12h16M4 18h10",
  settings:
    "M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24",
};

export const NAV_ICON = NAV_ICONS;

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export function AppSidebar({ items, authSlot, publicHint = false }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 230,
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--line)",
        padding: "24px 18px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "-.02em",
          padding: "4px 8px 22px",
        }}
      >
        <Logo size={24} /> clockin
      </Link>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((n) => {
          const active =
            n.href === "/"
              ? pathname === "/"
              : pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 13px",
                borderRadius: "var(--radius-sm)",
                fontSize: 14.5,
                fontWeight: 600,
                textAlign: "left",
                transition: "all .14s",
                background: active ? "var(--accent-soft)" : "transparent",
                color: active ? "var(--accent-ink)" : "var(--ink-2)",
              }}
            >
              <NavIcon d={n.icon} /> {n.label}
            </Link>
          );
        })}
      </nav>
      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        {publicHint && (
          <div
            style={{
              fontSize: 11.5,
              color: "var(--muted)",
              margin: "0 4px 10px",
              lineHeight: 1.45,
            }}
          >
            You&rsquo;re viewing in read-only mode.
          </div>
        )}
        {authSlot}
      </div>
    </aside>
  );
}

export function AppBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      className="app-bottomnav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        display: "none",
        justifyContent: "space-around",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
        zIndex: 40,
      }}
    >
      {items.map((n) => {
        const active =
          n.href === "/"
            ? pathname === "/"
            : pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 18px",
              color: active ? "var(--accent)" : "var(--muted)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <NavIcon d={n.icon} /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppTopBar({ authSlot }: { authSlot: React.ReactNode }) {
  return (
    <header
      className="app-topbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "none",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: "-.02em",
        }}
      >
        <Logo size={22} /> clockin
      </Link>
      {authSlot}
    </header>
  );
}
