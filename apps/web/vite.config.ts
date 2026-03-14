import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      /**
       * Redirect the UI barrel import to a slim RSC-safe re-export that
       * cherry-picks only the components used by the app, avoiding
       * module-level React.createContext() calls (Toast, Form) that crash
       * in vinext's RSC/SSR rendering.
       *
       * @see https://github.com/cloudflare/vinext/pull/138
       */
      "@productioncity/holding-ui": resolve(
        __dirname,
        "app/lib/ui-reexports.ts",
      ),
    },
  },
});
