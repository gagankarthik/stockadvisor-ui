// Atom · Icon — the nav glyph set. Pure SVG, keyed by name so consumers stay
// declarative.

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PATHS: Record<string, React.ReactNode> = {
  gauge: <><path {...STROKE} d="M3 13a9 9 0 0 1 18 0" /><path {...STROKE} d="M12 13l4-3" /><circle cx="12" cy="13" r="1.3" fill="currentColor" stroke="none" /></>,
  grid: <><rect {...STROKE} x="3" y="3" width="7" height="7" rx="1" /><rect {...STROKE} x="14" y="3" width="7" height="7" rx="1" /><rect {...STROKE} x="3" y="14" width="7" height="7" rx="1" /><rect {...STROKE} x="14" y="14" width="7" height="7" rx="1" /></>,
  pie: <><path {...STROKE} d="M12 3v9l7 4" /><circle {...STROKE} cx="12" cy="12" r="9" /></>,
  flask: <><path {...STROKE} d="M9 3h6M10 3v6l-5 9a1.5 1.5 0 0 0 1.3 2.3h11.4A1.5 1.5 0 0 0 19 18l-5-9V3" /><path {...STROKE} d="M7.5 14h9" /></>,
  ledger: <><rect {...STROKE} x="4" y="3" width="16" height="18" rx="1.5" /><path {...STROKE} d="M8 8h8M8 12h8M8 16h5" /></>,
  cpu: <><rect {...STROKE} x="6" y="6" width="12" height="12" rx="1.5" /><path {...STROKE} d="M10 10h4v4h-4z" /><path {...STROKE} d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" /></>,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
