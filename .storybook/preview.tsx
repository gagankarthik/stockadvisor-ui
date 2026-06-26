import type { Preview, Decorator } from "@storybook/react-vite";
import "../src/app/globals.css";

// The design tokens default to the dark "Desk" theme (light is an override on
// [data-theme="light"]). Render every story on the ink chassis with padding so
// components are seen on their real surface.
const withChassis: Decorator = (Story) => (
  <div className="bg-ink p-6" style={{ minHeight: "100vh" }}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withChassis],
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
};

export default preview;
