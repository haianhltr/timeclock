import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "./Logo";

export async function TopBar() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px clamp(18px, 4vw, 32px)",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: "-.02em",
        }}
      >
        <Logo size={22} /> clockin
      </Link>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {isAdmin && (
            <Link
              href="/settings"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--ink-2)",
              }}
            >
              Settings
            </Link>
          )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          style={{ display: "flex", alignItems: "center", gap: 11 }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 99,
              background: "var(--accent)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {(user.email?.[0] || "?").toUpperCase()}
          </div>
          <button
            type="submit"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--muted)",
            }}
          >
            Sign out
          </button>
        </form>
        </div>
      ) : (
        <Link
          href="/login"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--accent)",
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--accent)",
          }}
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
