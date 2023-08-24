/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from'vite-plugin-mkcert'

export default defineConfig(() => {
  return {
    server: { 
      proxy: { '/wss': {
          target: 'https://localhost.direct:8082',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy: { on: (arg0: string, arg1: { (err: any, _req: any, _res: any): void; (proxyReq: any, req: any, _res: any): void; (proxyRes: any, req: any, _res: any): void; }) => void; }, _options: any) => {
            proxy.on('error', (err: any, _req: any, _res: any) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: any, req: { method: any; url: any; }, _res: any) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: { statusCode: any; }, req: { url: any; }, _res: any) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }, 
      }, 
        
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
