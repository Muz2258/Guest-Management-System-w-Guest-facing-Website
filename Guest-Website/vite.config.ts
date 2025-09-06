import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const customResolvers = {
  '@/utils/supabase.ts': ['supabase']
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
      dirs: ['./src/components'],
      deep: true,
      dts: true
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
