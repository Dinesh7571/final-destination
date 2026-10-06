import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/online-charts': {
        target: 'https://www.irctc.co.in',
        changeOrigin: true,
        secure: false,
        headers: {
          'Origin': 'https://railchart.in',
          'Referer': 'https://railchart.in/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },
      '/railchart-api': {
        target: 'https://railchart.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/railchart-api/, '/api'),
        headers: {
          'Origin': 'https://railchart.in',
          'Referer': 'https://railchart.in/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },
      '/railberth-api': {
        target: 'https://railberth.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/railberth-api/, '/api'),
        headers: {
          'Origin': 'https://railberth.com',
          'Referer': 'https://railberth.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    }
  }
})
