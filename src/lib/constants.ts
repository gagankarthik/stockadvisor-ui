// Shared UI constants — single source of truth for option sets reused across
// pages, so labels and ordering can't drift between screens.

import type { RiskProfile } from "./types";

// The risk-profile choices for the Segmented control (Screener + Allocation).
// Short labels are intentional: the long-form copy lives in PROFILES (format.ts).
export const PROFILE_SEGMENTS: { value: RiskProfile; label: string }[] = [
  { value: "Conservative", label: "Safe" },
  { value: "Balanced", label: "Balanced" },
  { value: "Aggressive", label: "Growth" },
];
