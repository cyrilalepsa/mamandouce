import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './i18n';
import { hideBootLoader } from './utils/backendUrl';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

hideBootLoader();
window.addEventListener('error', hideBootLoader);
window.addEventListener('unhandledrejection', hideBootLoader);

// 🚀 On enregistre le Service Worker, et c'est TOUT.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker enregistré avec succès :', registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Échec de l'enregistrement :", error);
      });
  });
}