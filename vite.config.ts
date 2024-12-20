import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    open: true,
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
