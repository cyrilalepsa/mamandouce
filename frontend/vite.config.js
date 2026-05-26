import { defineConfig, loadEnv } from 'vite'; // Ajoute loadEnv ici
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
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
    }
  };
});