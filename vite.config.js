import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

const API_PROXY_TARGET = process.env.VITE_API_BASE_URL || 'https://api1.mzsh.top'

export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 按需自动导入组件（不再全量打包）
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false,
    }),
    // Element Plus 的 ElMessage / ElMessageBox / ElLoading 等 API 自动引入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: false,
    }),
  ],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 将第三方库拆分到单独 chunk，方便浏览器缓存
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        }
      }
    }
  }
})
