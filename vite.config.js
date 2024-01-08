import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import requireTransform from 'vite-plugin-require-transform'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    requireTransform({
      fileRegex: /.js$|.jsx$|.vue$/,
    }),
  ],
  build: {
    // 静态资源合并打包
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        // 超大静态资源拆分
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        }
      },
    },
    chunkSizeWarningLimit: 8000,
  },
  base: './',
})
