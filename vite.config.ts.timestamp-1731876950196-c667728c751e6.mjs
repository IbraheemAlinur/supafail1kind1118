// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { visualizer } from "file:///home/project/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-transform-react-jsx", { optimize: true }]
          ]
        }
      }),
      visualizer({
        template: "sunburst",
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html"
      })
    ],
    define: {
      // Fix for Supabase client
      global: "globalThis",
      "process.env": env
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "supabase-vendor": ["@supabase/supabase-js"],
            "chart-vendor": ["chart.js", "react-chartjs-2"],
            "date-vendor": ["date-fns"],
            "ui-vendor": ["lucide-react"],
            "analytics": ["./src/components/analytics/*"],
            "events": ["./src/components/events/*"],
            "communities": ["./src/components/communities/*"],
            "messages": ["./src/components/messages/*"],
            "ki-points": ["./src/components/ki-points/*"]
          }
        }
      },
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1e3
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@supabase/supabase-js",
        "chart.js",
        "date-fns",
        "lucide-react"
      ]
    },
    resolve: {
      mainFields: ["module", "main"]
    },
    esbuild: {
      legalComments: "none",
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBiYWJlbDoge1xuICAgICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIFsnQGJhYmVsL3BsdWdpbi10cmFuc2Zvcm0tcmVhY3QtanN4JywgeyBvcHRpbWl6ZTogdHJ1ZSB9XVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgdGVtcGxhdGU6ICdzdW5idXJzdCcsXG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICBmaWxlbmFtZTogJ2Rpc3Qvc3RhdHMuaHRtbCdcbiAgICAgIH0pXG4gICAgXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgIC8vIEZpeCBmb3IgU3VwYWJhc2UgY2xpZW50XG4gICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgICdwcm9jZXNzLmVudic6IGVudlxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgJ3N1cGFiYXNlLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgICAnY2hhcnQtdmVuZG9yJzogWydjaGFydC5qcycsICdyZWFjdC1jaGFydGpzLTInXSxcbiAgICAgICAgICAgICdkYXRlLXZlbmRvcic6IFsnZGF0ZS1mbnMnXSxcbiAgICAgICAgICAgICd1aS12ZW5kb3InOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgICAgJ2FuYWx5dGljcyc6IFsnLi9zcmMvY29tcG9uZW50cy9hbmFseXRpY3MvKiddLFxuICAgICAgICAgICAgJ2V2ZW50cyc6IFsnLi9zcmMvY29tcG9uZW50cy9ldmVudHMvKiddLFxuICAgICAgICAgICAgJ2NvbW11bml0aWVzJzogWycuL3NyYy9jb21wb25lbnRzL2NvbW11bml0aWVzLyonXSxcbiAgICAgICAgICAgICdtZXNzYWdlcyc6IFsnLi9zcmMvY29tcG9uZW50cy9tZXNzYWdlcy8qJ10sXG4gICAgICAgICAgICAna2ktcG9pbnRzJzogWycuL3NyYy9jb21wb25lbnRzL2tpLXBvaW50cy8qJ11cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICBjc3NNaW5pZnk6IHRydWUsXG4gICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDBcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogW1xuICAgICAgICAncmVhY3QnLFxuICAgICAgICAncmVhY3QtZG9tJyxcbiAgICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxuICAgICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcbiAgICAgICAgJ2NoYXJ0LmpzJyxcbiAgICAgICAgJ2RhdGUtZm5zJyxcbiAgICAgICAgJ2x1Y2lkZS1yZWFjdCdcbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIG1haW5GaWVsZHM6IFsnbW9kdWxlJywgJ21haW4nXVxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgbGVnYWxDb21tZW50czogJ25vbmUnLFxuICAgICAgbWluaWZ5SWRlbnRpZmllcnM6IHRydWUsXG4gICAgICBtaW5pZnlTeW50YXg6IHRydWUsXG4gICAgICBtaW5pZnlXaGl0ZXNwYWNlOiB0cnVlLFxuICAgICAgdHJlZVNoYWtpbmc6IHRydWVcbiAgICB9XG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUUzQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLFFBQ0osT0FBTztBQUFBLFVBQ0wsU0FBUztBQUFBLFlBQ1AsQ0FBQyxxQ0FBcUMsRUFBRSxVQUFVLEtBQUssQ0FBQztBQUFBLFVBQzFEO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsV0FBVztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4sUUFBUTtBQUFBLE1BQ1IsZUFBZTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixjQUFjO0FBQUEsWUFDWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsWUFDekQsbUJBQW1CLENBQUMsdUJBQXVCO0FBQUEsWUFDM0MsZ0JBQWdCLENBQUMsWUFBWSxpQkFBaUI7QUFBQSxZQUM5QyxlQUFlLENBQUMsVUFBVTtBQUFBLFlBQzFCLGFBQWEsQ0FBQyxjQUFjO0FBQUEsWUFDNUIsYUFBYSxDQUFDLDhCQUE4QjtBQUFBLFlBQzVDLFVBQVUsQ0FBQywyQkFBMkI7QUFBQSxZQUN0QyxlQUFlLENBQUMsZ0NBQWdDO0FBQUEsWUFDaEQsWUFBWSxDQUFDLDZCQUE2QjtBQUFBLFlBQzFDLGFBQWEsQ0FBQyw4QkFBOEI7QUFBQSxVQUM5QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsWUFBWSxDQUFDLFVBQVUsTUFBTTtBQUFBLElBQy9CO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxlQUFlO0FBQUEsTUFDZixtQkFBbUI7QUFBQSxNQUNuQixjQUFjO0FBQUEsTUFDZCxrQkFBa0I7QUFBQSxNQUNsQixhQUFhO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
