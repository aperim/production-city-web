import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../src/**/*.mdx",
    "../stories/**/*.stories.@(ts|tsx)",
    "../stories/**/*.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "storybook/viewport",
    "@storybook/addon-designs",
    "storybook-design-token",
    "@storybook/addon-vitest",
  ],
  // Storybook 10 supports autodocs at runtime, but the current addon-docs
  // type surface in this release has not caught up with the config shape.
  docs: {
    autodocs: "tag",
  } as unknown as StorybookConfig["docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()];
    config.build = {
      ...(config.build ?? {}),
      // Storybook preview bundles include docs, a11y, and testing runtime code
      // that is substantially larger than application chunks. Raise the warning
      // threshold so build-storybook stays signal-rich for this generated output.
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        ...(config.build?.rollupOptions ?? {}),
        output: {
          ...(typeof config.build?.rollupOptions?.output === "object"
            ? config.build.rollupOptions.output
            : {}),
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return undefined;
            }

            if (id.includes("axe-core")) {
              return "axe";
            }

            if (id.includes("/storybook/dist/") || id.includes("@storybook")) {
              return "storybook-core";
            }

            if (id.includes("/react/") || id.includes("/react-dom/")) {
              return "react-vendor";
            }

            return undefined;
          },
        },
      },
    };
    return config;
  },
};

export default config;
