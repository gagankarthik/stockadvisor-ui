// Public entry for the design-system kit — the single import surface pages and
// tests use (`@/components/ui`). Internally the kit is organized atomically;
// this barrel re-exports the atoms + molecules that make up the public API.
// Charts live under @/components/charts; the shell under @/components/templates.

export * from "@/components/atoms";
export * from "@/components/molecules";
