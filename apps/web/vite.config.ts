import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@forzani/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@forzani/types": path.resolve(__dirname, "../../packages/types/src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["@forzani/ui", "@forzani/types"],
  },
});
