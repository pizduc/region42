import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    proxy: mode === "development"
      ? {
          "/api": {
            target: "http://localhost:10000",
            changeOrigin: true,
            rewrite: (path) => path,
          },
        }
      : undefined,
  },
}));
