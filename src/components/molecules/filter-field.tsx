"use client";

// Molecule · FilterField — a labelled wrapper that pairs an eyebrow with any
// input atom, owning the spacing between them (no margin leakage).

export function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
