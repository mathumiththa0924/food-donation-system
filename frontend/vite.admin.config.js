import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to route all HTML requests to admin.html
const adminSpaPlugin = () => ({
  name: 'admin-spa-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
        req.url = '/admin.html'
      }
      next()
    })
  }
})

export default defineConfig({
  plugins: [react(), adminSpaPlugin()],
  server: {
    port: 4174,
    open: true,
  },
  build: {
    outDir: 'dist/admin',
    rollupOptions: {
      input: {
        main: 'admin.html'
      }
    }
  }
})
