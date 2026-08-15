import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { hideBootLoader } from './utils/backendUrl';

function showBootFailure(err) {
  hideBootLoader();
  const root = document.getElementById('root');
  if (!root) return;
  const message = (err && err.message) || String(err || 'Problème de chargement');
  root.innerHTML =
    '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:sans-serif;color:#334155;text-align:center;">' +
    '<div><p style="font-weight:700;margin-bottom:8px;">Erreur au démarrage</p>' +
    '<p style="font-size:14px;">' +
    message.replace(/</g, '&lt;') +
    '</p></div></div>';
}

async function boot() {
  try {
    await import('./i18n');
    const [{ default: App }, { default: ErrorBoundary }] = await Promise.all([
      import('./App'),
      import('./components/ErrorBoundary'),
    ]);
    const el = document.getElementById('root');
    if (!el) throw new Error('root manquant');
    ReactDOM.createRoot(el).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
    hideBootLoader();
  } catch (err) {
    console.error('[boot] crash top-level', err);
    showBootFailure(err);
  }
}

boot();
window.addEventListener('error', hideBootLoader);
window.addEventListener('unhandledrejection', hideBootLoader);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error("[PWA] Échec de l'enregistrement :", error);
    });
  });
}
