import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://hyacinth.aj-captcha-slider.com", // 更换为 自己的服务器地址
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api/h5"),
      },
    },
    host: true,
    open: true,
    port: 4000,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    target: "modules",
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
          antd: ["antd"],
        },
      },
    },
  },
});
