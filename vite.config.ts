import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Plugin to copy .htaccess file during build
    {
      name: 'copy-htaccess',
      writeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'public/.htaccess'),
            resolve(__dirname, 'dist/.htaccess')
          )
          console.log('✅ .htaccess file copied to dist folder')
        } catch (error) {
          console.warn('⚠️ Could not copy .htaccess file:', error)
        }
      }
    }
  ],
  define: {
    // Make environment variables available to the client
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV === 'development'),
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
  },
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
