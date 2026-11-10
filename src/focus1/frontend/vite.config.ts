import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3002,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          bypass: (req, res, options) => {
            const url = req.url || "";
            if (
              url.includes(".ts") ||
              url.includes(".tsx") ||
              url.includes(".js") ||
              url.includes(".jsx")
            ) {
              console.log(`[vite proxy] Bypassing module request: ${url}`);
              return false;
            }
            return undefined;
          },
        },
        "/socket.io": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
