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
  output: "static",
  build: {
    // Emit pretty URLs as files (e.g. /about.html) rather than directories.
    format: "file",
  },
  server: {
    port: 5173,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
    customLogger: quietLogger,
  },
});
