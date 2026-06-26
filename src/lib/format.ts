// Formatting + small presentational helpers.

export function fmtMoney(n: number | null | undefined, dp = 2): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtNum(n: number | null | undefined, dp = 2): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function fmtPct(n: number | null | undefined, dp = 2): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n.toFixed(dp)}%`;
}

export function fmtSignedPct(n: number | null | undefined, dp = 2): string {
  if (n == null || !isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(dp)}%`;
}

export function fmtCompact(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
}

// brass-neutral-up/down direction class for a signed value
export function dirClass(n: number | null | undefined): string {
  if (n == null || !isFinite(n) || n === 0) return "text-mute";
  return n > 0 ? "text-up" : "text-down";
}

export function ageLabel(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// map a 0..100 value to a color stop on a chalk→brass scale (for score chips)
export function scoreTone(score: number | null | undefined): string {
  if (score == null) return "text-mute";
  if (score >= 80) return "text-brass-2";
  if (score >= 60) return "text-brass";
  if (score >= 40) return "text-chalk";
  return "text-mute";
}

export function signalTone(signal: string | null | undefined): {
  fg: string;
  bg: string;
  bd: string;
} {
  switch (signal) {
    case "BUY":
      return { fg: "text-up", bg: "bg-up/10", bd: "border-up/40" };
    case "SELL":
      return { fg: "text-down", bg: "bg-down/10", bd: "border-down/40" };
    default:
      return { fg: "text-mute", bg: "bg-mute/5", bd: "border-line-2" };
  }
}

export const PROFILES: { id: string; label: string; blurb: string }[] = [
  { id: "Conservative", label: "Conservative", blurb: "Capital protection first — heavy on broad funds and calm stocks." },
  { id: "Balanced", label: "Balanced", blurb: "Half diversified funds, half quality stocks. The default." },
  { id: "Aggressive", label: "Aggressive", blurb: "Mostly stocks, bigger swings. Money you won't need for years." },
];
