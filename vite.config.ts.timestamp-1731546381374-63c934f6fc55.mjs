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
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "firebase-vendor": ["firebase/app", "firebase/auth", "firebase/firestore"],
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
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "chart.js",
        "date-fns",
        "lucide-react"
      ]
    },
    resolve: {
      mainFields: ["module", "main"]
    },
    define: {
      "process.env": env
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKTtcbiAgXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBiYWJlbDoge1xuICAgICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIFsnQGJhYmVsL3BsdWdpbi10cmFuc2Zvcm0tcmVhY3QtanN4JywgeyBvcHRpbWl6ZTogdHJ1ZSB9XVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgdGVtcGxhdGU6ICdzdW5idXJzdCcsXG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICBmaWxlbmFtZTogJ2Rpc3Qvc3RhdHMuaHRtbCdcbiAgICAgIH0pXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICdyZWFjdC12ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgICAnZmlyZWJhc2UtdmVuZG9yJzogWydmaXJlYmFzZS9hcHAnLCAnZmlyZWJhc2UvYXV0aCcsICdmaXJlYmFzZS9maXJlc3RvcmUnXSxcbiAgICAgICAgICAgICdjaGFydC12ZW5kb3InOiBbJ2NoYXJ0LmpzJywgJ3JlYWN0LWNoYXJ0anMtMiddLFxuICAgICAgICAgICAgJ2RhdGUtdmVuZG9yJzogWydkYXRlLWZucyddLFxuICAgICAgICAgICAgJ3VpLXZlbmRvcic6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgICAgICAgICAnYW5hbHl0aWNzJzogWycuL3NyYy9jb21wb25lbnRzL2FuYWx5dGljcy8qJ10sXG4gICAgICAgICAgICAnZXZlbnRzJzogWycuL3NyYy9jb21wb25lbnRzL2V2ZW50cy8qJ10sXG4gICAgICAgICAgICAnY29tbXVuaXRpZXMnOiBbJy4vc3JjL2NvbXBvbmVudHMvY29tbXVuaXRpZXMvKiddLFxuICAgICAgICAgICAgJ21lc3NhZ2VzJzogWycuL3NyYy9jb21wb25lbnRzL21lc3NhZ2VzLyonXSxcbiAgICAgICAgICAgICdraS1wb2ludHMnOiBbJy4vc3JjL2NvbXBvbmVudHMva2ktcG9pbnRzLyonXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIGNzc01pbmlmeTogdHJ1ZSxcbiAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICdyZWFjdCcsIFxuICAgICAgICAncmVhY3QtZG9tJywgXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJywgXG4gICAgICAgICdmaXJlYmFzZS9hcHAnLFxuICAgICAgICAnZmlyZWJhc2UvYXV0aCcsXG4gICAgICAgICdmaXJlYmFzZS9maXJlc3RvcmUnLFxuICAgICAgICAnY2hhcnQuanMnLCBcbiAgICAgICAgJ2RhdGUtZm5zJywgXG4gICAgICAgICdsdWNpZGUtcmVhY3QnXG4gICAgICBdXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBtYWluRmllbGRzOiBbJ21vZHVsZScsICdtYWluJ11cbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52JzogZW52XG4gICAgfSxcbiAgICBlc2J1aWxkOiB7XG4gICAgICBsZWdhbENvbW1lbnRzOiAnbm9uZScsXG4gICAgICBtaW5pZnlJZGVudGlmaWVyczogdHJ1ZSxcbiAgICAgIG1pbmlmeVN5bnRheDogdHJ1ZSxcbiAgICAgIG1pbmlmeVdoaXRlc3BhY2U6IHRydWUsXG4gICAgICB0cmVlU2hha2luZzogdHJ1ZVxuICAgIH1cbiAgfTtcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxjQUFjLGVBQWU7QUFDL1AsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsa0JBQWtCO0FBRTNCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixPQUFPO0FBQUEsVUFDTCxTQUFTO0FBQUEsWUFDUCxDQUFDLHFDQUFxQyxFQUFFLFVBQVUsS0FBSyxDQUFDO0FBQUEsVUFDMUQ7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxVQUFVO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixZQUFZO0FBQUEsUUFDWixVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFlBQ3pELG1CQUFtQixDQUFDLGdCQUFnQixpQkFBaUIsb0JBQW9CO0FBQUEsWUFDekUsZ0JBQWdCLENBQUMsWUFBWSxpQkFBaUI7QUFBQSxZQUM5QyxlQUFlLENBQUMsVUFBVTtBQUFBLFlBQzFCLGFBQWEsQ0FBQyxjQUFjO0FBQUEsWUFDNUIsYUFBYSxDQUFDLDhCQUE4QjtBQUFBLFlBQzVDLFVBQVUsQ0FBQywyQkFBMkI7QUFBQSxZQUN0QyxlQUFlLENBQUMsZ0NBQWdDO0FBQUEsWUFDaEQsWUFBWSxDQUFDLDZCQUE2QjtBQUFBLFlBQzFDLGFBQWEsQ0FBQyw4QkFBOEI7QUFBQSxVQUM5QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixXQUFXO0FBQUEsTUFDWCxjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxZQUFZLENBQUMsVUFBVSxNQUFNO0FBQUEsSUFDL0I7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLGVBQWU7QUFBQSxJQUNqQjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsZUFBZTtBQUFBLE1BQ2YsbUJBQW1CO0FBQUEsTUFDbkIsY0FBYztBQUFBLE1BQ2Qsa0JBQWtCO0FBQUEsTUFDbEIsYUFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
