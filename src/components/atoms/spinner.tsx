"use client";

// Atom · Spinner — an accessible inline loading indicator on the size scale.
// Part of the kit's public surface (used for action-level loading on buttons).

import { clsx } from "@/lib/clsx";

const SIZE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-2",
};

export function Spinner({
  size = "sm",
  className,
  label = "Loading",
}: {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={clsx(
        "inline-block animate-spin rounded-full border-current border-r-transparent align-[-0.125em] text-current",
        SIZE[size],
        className,
      )}
    />
  );
}
