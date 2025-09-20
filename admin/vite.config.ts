import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    // Removendo plugins Replit para evitar problemas de resolução no build
  ],
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  optimizeDeps: {
    include: ['date-fns', 'date-fns/locale'],
  },
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "shared"),
      "@assets": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "attached_assets"),
    },
  },
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
    emptyOutDir: true,
    commonjsOptions: {
      include: [/date-fns/, /node_modules/]
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3002,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});