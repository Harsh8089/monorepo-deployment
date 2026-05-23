import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyConfig = {
  '/api': {
    target: process.env.BACKEND_URL || "http://backend:3000",
    changeOrigin: true
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: proxyConfig
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    proxy: proxyConfig,
    allowedHosts: [ process.env.ALLOWED_HOST || '' ]
  }
});
