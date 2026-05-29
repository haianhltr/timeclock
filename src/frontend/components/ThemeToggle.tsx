import { toggleTheme } from "@/app/actions/theme";
import { getTheme } from "@/lib/theme";

export async function ThemeToggle() {
  const theme = await getTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <form action={toggleTheme}>
      <button
        type="submit"
        aria-label={`Switch to ${next} mode`}
        title={`Switch to ${next} mode`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 99,
          background: "var(--surface-2)",
          color: "var(--ink-2)",
          border: "1px solid var(--line)",
          transition: "background .15s, color .15s",
        }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </form>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
