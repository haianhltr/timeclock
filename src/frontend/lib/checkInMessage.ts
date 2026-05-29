import { fmt } from "./dates";

type Args = {
  boss: string;
  gateMin: number | null;
  deskMin: number | null;
  reason: string | null;
};

// The note the admin sends to the boss each morning. Ported from
// prototype/clockin/app/data.jsx → buildMessage.
export function buildCheckInMessage({
  boss,
  gateMin,
  deskMin,
  reason,
}: Args): string {
  const name = boss.trim() || "Scott";
  const gate = gateMin != null ? fmt(gateMin) : "—";
  const desk = deskMin != null ? fmt(deskMin) : "—";
  let s = `Good morning ${name}, quick check-in for today.`;
  s += ` Time to gate: ${gate}, time to desk: ${desk}.`;
  if (reason) s += ` Reason: ${reason}.`;
  return s;
}
