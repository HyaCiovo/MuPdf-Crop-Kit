import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    open: false,
    port: 4000,
  },
  build: {
    target: "esnext",
    outDir: "build",
    assetsDir: "assets",
    assetsInlineLimit: 4096,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 500,
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react"],
        },
      },
    },
  },
});
