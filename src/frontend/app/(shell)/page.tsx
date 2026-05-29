import { Insights } from "@/components/Insights";
import { getConfig } from "@/lib/api/config";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const config = await getConfig();
  return (
    <div style={{ animation: "fadeIn .35s ease both" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: "-.02em",
        }}
      >
        Your patterns
      </h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-2)", fontSize: 14 }}>
        Public read · admin write
      </p>
      <Insights target={config.targetMin} />
    </div>
  );
}
