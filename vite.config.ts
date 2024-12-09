//@ts-nocheck
import { defineConfig } from 'vite'
import path from "path";
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  root: "./",
  server: {
    port: 5000,
    // proxy: {
    //   '/api': {
    //     target: 'https://vardek.ru',
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/colors.scss" as *;`
      }
    }
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: ({ name, extname }) => {

          if (/\.css$/.test(name ?? '')) {
            return 'assets/style[extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
})
