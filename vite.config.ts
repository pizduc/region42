import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "0.0.0.0",  // Проверка на доступность через все интерфейсы
    port: 10000,
    proxy: {
      "/api": {
        target: "http://localhost:10000",  // Убедись, что сервер работает на этом порту
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: ['region42.onrender.com', 'localhost'],  // Разрешаем localhost
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
