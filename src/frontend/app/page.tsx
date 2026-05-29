import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const owner = !!session?.user?.id;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        animation: "fadeIn .4s ease both",
      }}
    >
      <div
        style={{
          width: "min(440px, 100%)",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "44px 38px",
          textAlign: "center",
          animation: "pop .5s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-.02em",
            marginBottom: 22,
          }}
        >
          <Logo size={28} /> clockin
        </div>
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-.02em",
            textWrap: "balance",
          }}
        >
          Your morning,
          <br />
          in two timestamps.
        </h1>
        <p
          style={{
            margin: "0 0 28px",
            color: "var(--ink-2)",
            fontSize: 14.5,
            lineHeight: 1.5,
          }}
        >
          A personal time-tracking log. Public read · admin write.
        </p>
        {owner ? (
          <div style={{ fontSize: 13.5, color: "var(--muted)" }}>
            Signed in as {session.user.email}
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14.5,
              padding: "13px 22px",
              borderRadius: "var(--radius-sm)",
              boxShadow: "0 6px 18px -6px var(--accent)",
            }}
          >
            Sign in to edit
          </Link>
        )}
      </div>
    </main>
  );
}
