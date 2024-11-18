import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { optimize: true }]
          ]
        }
      }),
      nodePolyfills({
        include: ['buffer', 'stream', 'util', 'process'],
        globals: {
          Buffer: true,
          global: true,
          process: true
        }
      }),
      visualizer({
        template: 'sunburst',
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ],
    define: {
      global: 'globalThis',
      'process.env': env
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'chart-vendor': ['chart.js', 'react-chartjs-2'],
            'date-vendor': ['date-fns'],
            'ui-vendor': ['lucide-react']
          }
        }
      },
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'chart.js',
        'date-fns',
        'lucide-react',
        'buffer'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    esbuild: {
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true
    }
  };
});