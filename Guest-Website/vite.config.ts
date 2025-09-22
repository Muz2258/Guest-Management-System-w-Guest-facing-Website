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
  },
  build: {
    // ✅ OPTIMIZATION: Enhanced bundle splitting and compression
    rollupOptions: {
      output: {
        // Smart chunk splitting strategy
        manualChunks: {
          // ✅ Vendor chunk: Core framework dependencies
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          
          // ✅ Supabase chunk: Database and auth (used across app)
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // ✅ Utils chunk: Utility libraries
          'vendor-utils': ['crypto-js', 'zod']
        },
        
        // ✅ Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          
          // Store chunks get special naming for cache optimization
          if (facadeModuleId && facadeModuleId.includes('/stores/')) {
            return `stores/[name]-[hash].js`;
          }
          
          // Component chunks
          if (facadeModuleId && facadeModuleId.includes('/components/')) {
            return `components/[name]-[hash].js`;
          }
          
          // Default naming
          return `chunks/[name]-[hash].js`;
        },
        
        // ✅ Optimize asset naming
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i)) {
            return 'images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/i)) {
            return 'fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    
    // ✅ Enable compression and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      },
      format: {
        comments: false // Remove comments
      }
    },
    
    // ✅ Optimize chunk size limits
    chunkSizeWarningLimit: 1000, // Warn for chunks over 1MB
    
    // ✅ Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
    
    // ✅ Asset optimization
    assetsInlineLimit: 4096, // Inline assets under 4KB as base64
    
    // ✅ CSS optimization
    cssCodeSplit: true, // Split CSS into separate files
    cssMinify: true
  },
  
  // ✅ OPTIMIZATION: Enhanced dependency pre-bundling
  optimizeDeps: {
    include: [
      'vue',
      'vue-router', 
      'pinia',
      '@supabase/supabase-js',
      'crypto-js',
      'zod'
    ],
    exclude: [
      // Don't pre-bundle large views that should be lazy loaded
      './src/views/GalleryView.vue'
    ]
  }
})
