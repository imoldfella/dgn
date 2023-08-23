import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from'vite-plugin-mkcert'

export default defineConfig(() => {
  return {
    proxy: { '/wss': {
        target: 'https://localhost:8082/wss',
        changeOrigin: true,
        secure: false,
        ws: true
      }, 
    },
    server: {
      https: true,
    },
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(),mkcert()],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
