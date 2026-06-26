import type { StorybookConfig } from "@storybook/react-vite";

// Vite-based Storybook. It reuses the project's postcss.config.mjs (Tailwind v4)
// and tsconfig path aliases automatically, so stories render with the real
// design tokens and "@/*" imports resolve exactly as in the app.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
