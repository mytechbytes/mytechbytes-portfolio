// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { createLogger } from "vite";

/**
 * Substrings of known, harmless deprecation / noise warnings to suppress,
 * so genuine warnings stay visible. Add new patterns here as needed.
 */
const SUPPRESSED_WARNINGS = [
  "vite:css-post",
  "Could not auto-determine entry point",
  "[@tailwindcss/vite]",
];

const baseLogger = createLogger();
const quietLogger = {
  ...baseLogger,
  warn(msg, options) {
    if (SUPPRESSED_WARNINGS.some((s) => msg.includes(s))) return;
    baseLogger.warn(msg, options);
  },
  warnOnce(msg, options) {
    if (SUPPRESSED_WARNINGS.some((s) => msg.includes(s))) return;
    baseLogger.warnOnce(msg, options);
  },
};

// https://astro.build/config
export default defineConfig({
  // Fully static export — every page is prerendered to HTML at build time. No
  // server adapter is used, so the build output in dist/ is the complete,
  // deployable site (served as static assets on Cloudflare Workers).
  output: "static",
  build: {
    // Emit pretty URLs as files (e.g. /about.html) rather than directories.
    format: "file",
    // Base directory for bundled assets. Astro's client `<script>` bundles land
    // here (-> /js); CSS and images are redirected by the Vite `assetFileNames`
    // hook below to /css and /images respectively.
    assets: "js",
  },
  server: {
    port: 5173,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    customLogger: quietLogger,
    build: {
      rollupOptions: {
        output: {
          // JS bundles go to /js (via `build.assets` above). Redirect the
          // remaining emitted assets by type: CSS -> /css, images -> /images,
          // anything else -> /assets. Filenames keep a content hash, so they
          // stay safe to cache immutably (see public/_headers).
          assetFileNames: (assetInfo) => {
            const source = assetInfo.names?.[0] ?? assetInfo.name ?? "";
            const ext = source.split(".").pop()?.toLowerCase() ?? "";
            if (ext === "css") return "css/style.[hash][extname]";
            if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico"].includes(ext)) {
              return "images/[name].[hash][extname]";
            }
            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
  },
});
