"use client";

// Organism · BreadthMeter — % above a moving average as a centered depth meter,
// with a 50% reference notch and up/neutral/down tone.

export function BreadthMeter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const tone = v >= 60 ? "var(--color-up)" : v <= 40 ? "var(--color-down)" : "var(--color-brass)";
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-sm tnum text-chalk">{v.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-line">
        {/* 50% reference notch */}
        <div className="absolute left-1/2 top-[-2px] h-3 w-px bg-line-2" />
        <div
          className="h-full rounded-full"
          style={{ width: `${v}%`, background: tone, transition: "width 600ms ease" }}
        />
      </div>
    </div>
  );
}
