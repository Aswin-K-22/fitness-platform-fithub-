import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd());
console.log("VITE_API_BASE_URL:", env.VITE_API_BASE_URL);
  return defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
            });
            proxy.on("proxyRes", (proxyRes) => {
              console.log(`Received response with status: ${proxyRes.statusCode}`);
            });
            proxy.on("error", (err) => {
              console.error("Proxy error:", err);
            });
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Map @ to src/
      },
    },
  });
};