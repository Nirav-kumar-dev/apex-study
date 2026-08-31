import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function serveBookFolderPlugin(): Plugin {
  return {
    name: 'serve-book-folder',
    configureServer(server) {
      server.middlewares.use('/book', (req, res, next) => {
        try {
          const rawUrl = req.url || '';
          const decoded = decodeURIComponent(rawUrl.split('?')[0]);
          const fullPath = path.join(process.cwd(), 'book', decoded);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath).toLowerCase();
            if (ext === '.pdf') {
              res.setHeader('Content-Type', 'application/pdf');
            } else if (ext === '.jpg' || ext === '.jpeg') {
              res.setHeader('Content-Type', 'image/jpeg');
            } else if (ext === '.png') {
              res.setHeader('Content-Type', 'image/png');
            }
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Disposition', 'inline');
            fs.createReadStream(fullPath).pipe(res);
            return;
          }
        } catch (err) {
          console.error('Error serving book file:', err);
        }
        next();
      });
    },
    closeBundle() {
      const distBookDir = path.join(process.cwd(), 'dist', 'book');
      const srcBookDir = path.join(process.cwd(), 'book');
      if (fs.existsSync(srcBookDir)) {
        fs.cpSync(srcBookDir, distBookDir, { recursive: true });
        console.log('✓ Copied book/ folder to dist/book/ for production deployment');
      }
      const distIndex = path.join(process.cwd(), 'dist', 'index.html');
      const dist404 = path.join(process.cwd(), 'dist', '404.html');
      if (fs.existsSync(distIndex) && !fs.existsSync(dist404)) {
        fs.copyFileSync(distIndex, dist404);
        console.log('✓ Created dist/404.html for GitHub Pages SPA routing fallback');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), serveBookFolderPlugin()],
  server: {
    port: 5173,
    watch: {
      ignored: ['**/build/**', '**/dist/**', '**/*.exe', '**/desktop/**', '**/.git/**'],
    },
    proxy: {
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
        secure: true,
        headers: {
          Origin: 'https://integrate.api.nvidia.com',
        },
      },
      '/api/py': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/py/, ''),
      },
    },
  },
})
