import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

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