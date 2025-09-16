import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/tdc-guild-generator/" : "/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["guild-logo.svg", "robots.txt"],
      manifest: {
        name: "Gerador de Guildas - Tabuleiro do Caos RPG",
        short_name: "Guild Generator",
        description:
          "Sistema completo para geração procedural de guildas de aventureiros para RPG de mesa",
        theme_color: "#2f8bb0",
        background_color: "#1f2937",
        display: "standalone",
        orientation: "portrait-primary",
        scope:
          process.env.NODE_ENV === "production" ? "/tdc-guild-generator/" : "/",
        start_url:
          process.env.NODE_ENV === "production" ? "/tdc-guild-generator/" : "/",
        id:
          process.env.NODE_ENV === "production" ? "/tdc-guild-generator/" : "/",
        lang: "pt-BR",
        categories: ["games", "utilities", "entertainment"],
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/guild-logo.svg",
            sizes: "100x100",
            type: "image/svg+xml",
          },
        ],
        shortcuts: [
          {
            name: "Gerar Nova Guilda",
            short_name: "Nova Guilda",
            description: "Gera uma nova guilda completa",
            url:
              process.env.NODE_ENV === "production"
                ? "/tdc-guild-generator/guild?action=generate"
                : "/guild?action=generate",
            icons: [{ src: "/guild-logo.svg", sizes: "96x96" }],
          },
          {
            name: "Ver Contratos",
            short_name: "Contratos",
            description: "Visualiza contratos disponíveis",
            url:
              process.env.NODE_ENV === "production"
                ? "/tdc-guild-generator/contracts"
                : "/contracts",
            icons: [{ src: "/guild-logo.svg", sizes: "96x96" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback:
          process.env.NODE_ENV === "production" ? "/tdc-guild-generator/" : "/",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          ui: ["@headlessui/vue", "@heroicons/vue"],
          utils: ["zod"],
        },
      },
    },
  },
});
