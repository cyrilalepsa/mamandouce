import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs'; // 👈 On ajoute fs pour modifier le fichier généré

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env
  const env = loadEnv(mode, process.cwd(), '');

  // 🤖 PLUGIN MAISON : Automatisation de la version du Service Worker
  const autoUpdateSWPlugin = () => ({
    name: 'auto-update-sw-version',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js');
      
      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf8');
        
        // Génère un timestamp unique propre (ex: 202606022350)
        const timestampVersion = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
        
        // Remplace dynamiquement la variable const APP_VERSION = '...'; dans le build final
        content = content.replace(
          /const APP_VERSION\s*=\s*['"].*?['"]/g,
          `const APP_VERSION = '${timestampVersion}'`
        );
        
        fs.writeFileSync(swPath, content, 'utf8');
        console.log(`\n✨ [PWA] Version du Service Worker automatisée pour la prod : v${timestampVersion}\n`);
      }

      const serveSrc = path.resolve(__dirname, 'serve.json');
      const serveDest = path.resolve(__dirname, 'dist/serve.json');
      if (fs.existsSync(serveSrc)) {
        fs.copyFileSync(serveSrc, serveDest);
      }
    }
  });

  return {
    // 🚀 On ajoute notre plugin à la liste
    plugins: [react(), autoUpdateSWPlugin()],
    
    // Injecte les variables pour que ton code les trouve (évite l'undefined)
    define: {
      'process.env': env 
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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