import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

const customResolvers = {
  '@/utils/supabase.ts': ['supabase'],
  '@/utils/guestStorage.ts': ['guestStorage']
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const terserOptions = isProduction ? {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
    },
    format: { comments: false }
  } : undefined;

  return {
    plugins: [
      vue(),
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          customResolvers
        ],
        dirs: ['./src/composables', './src/stores'],
        dts: true
      }),
      components({
        dirs: ['./src/components', './src/views'],
        deep: true,
        dts: true,
        extensions: ['vue'],
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // This alias maps '@' to the 'src' directory
      },
    },
    server: {
      port: 5174,
      strictPort: true,
    },
    build: {
      minify: 'terser',
      // terserOptions,
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
      // assetsInlineLimit: 4096,
      cssCodeSplit: true,
      cssMinify: true
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router', 
        'pinia',
        '@supabase/supabase-js',
        'crypto-js',
        'zod'
      ]
    }
  }
})
