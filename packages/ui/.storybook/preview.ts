import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "../src/globals.css";

const viewports = {
  mobile: {
    name: "Mobile",
    styles: {
      width: "390px",
      height: "844px",
    },
  },
  tablet: {
    name: "Tablet",
    styles: {
      width: "768px",
      height: "1024px",
    },
  },
  laptop: {
    name: "Laptop",
    styles: {
      width: "1280px",
      height: "800px",
    },
  },
  desktop: {
    name: "Desktop",
    styles: {
      width: "1440px",
      height: "900px",
    },
  },
} as const;

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      attributeName: "data-theme",
      defaultTheme: "dark",
      themes: {
        dark: "dark",
        light: "light",
      },
    }),
  ],
  globalTypes: {
    theme: {
      description: "Preview theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        dynamicTitle: true,
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
      },
    },
  },
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    designToken: {
      files: ["../src/globals.css"],
    },
    viewport: {
      options: viewports,
      defaultViewport: "desktop",
    },
  },
};

export default preview;
