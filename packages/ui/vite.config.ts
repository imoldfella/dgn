import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    server: {
      port: 7083,
      host: '0.0.0.0',
      cors: true,
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
      // Set the content security policy to allow SharedArrayBuffer transfer
      contentSecurityPolicy: {
        directives: {
          'worker-src': "'self' blob: data:;",
          'connect-src': "'self' blob: data:;"
        }
      }
    },
    build: {
      target: "es2020",
      lib: {
        entry: "./src/index.ts",
        formats: ["es", "cjs"],
        fileName: (format) => `index.qwik.${format === "es" ? "mjs" : "cjs"}`,
      },
    },
    plugins: [qwikVite({
      devTools: {
        clickToSource: false
      }
    }), tsconfigPaths()],
  };
});
