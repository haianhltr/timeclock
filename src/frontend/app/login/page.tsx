import { signIn } from "@/auth";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const denied = error === "AccessDenied";
  const safeRedirectTo =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

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
          width: "min(420px, 100%)",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "44px 38px",
          animation: "pop .5s cubic-bezier(.2,.8,.2,1) both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-.02em",
            marginBottom: 22,
            justifyContent: "center",
          }}
        >
          <Logo size={28} /> clockin
        </div>
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-.02em",
            textAlign: "center",
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            margin: "0 0 24px",
            color: "var(--ink-2)",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Sign in to log today&rsquo;s check-in.
        </p>

        {denied && (
          <div
            style={{
              background: "var(--late-soft)",
              color: "var(--late)",
              fontSize: 13,
              padding: "12px 14px",
              borderRadius: "var(--radius-sm)",
              marginBottom: 18,
              lineHeight: 1.45,
            }}
          >
            Access denied. Your Google account isn&rsquo;t on the allowlist for
            this instance.
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: safeRedirectTo });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "var(--surface-2)",
              border: "1.5px solid var(--line)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 14.5,
              padding: "13px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <GoogleMark />
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
