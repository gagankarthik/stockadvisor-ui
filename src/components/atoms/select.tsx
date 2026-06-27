"use client";

// Atom · Select — a styled native <select>, keeping native a11y + mobile
// pickers. Options are [value, label] tuples.

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-[var(--radius-panel)] border border-line bg-ink px-2 font-mono text-sm text-chalk outline-none focus:border-brass"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v} className="bg-slate">
          {l}
        </option>
      ))}
    </select>
  );
}
