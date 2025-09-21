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
export default defineConfig({
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
  }
})
