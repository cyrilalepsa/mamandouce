import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const rootDir = import.meta.dirname;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const autoUpdateSWPlugin = () => ({
    name: 'auto-update-sw-version',
    closeBundle() {
      const swPath = path.resolve(rootDir, 'dist/sw.js');

      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf8');
        const timestampVersion = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
        content = content.replace(
          /const APP_VERSION\s*=\s*['"].*?['"]/g,
          `const APP_VERSION = '${timestampVersion}'`
        );
        fs.writeFileSync(swPath, content, 'utf8');
        console.log(`\n✨ [PWA] Version du Service Worker automatisée pour la prod : v${timestampVersion}\n`);
      }

      const serveSrc = path.resolve(rootDir, 'serve.json');
      const serveDest = path.resolve(rootDir, 'dist/serve.json');
      if (fs.existsSync(serveSrc)) {
        fs.copyFileSync(serveSrc, serveDest);
      }
    }
  });

  return {
    plugins: [react(), autoUpdateSWPlugin()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : mode),
      'process.env.PUBLIC_URL': JSON.stringify(env.PUBLIC_URL || ''),
    },
    build: {
      chunkSizeWarningLimit: 3500,
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    optimizeDeps: {
      include: ['recharts', 'react-is'],
    },
    server: {
      port: 5173,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
    preview: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  };
});
