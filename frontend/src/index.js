import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './i18n'; // Initialisation i18n pour multi-langues

// ============================================
// BLOCAGE AGRESSIF de la sélection de texte sur Android/iOS
// Empêche le menu "Copier / Partager / Tout sélectionner"
// ============================================

// 1. Bloquer le démarrage de sélection sur tout sauf les inputs
document.addEventListener('selectstart', (e) => {
  const target = e.target;
  // Autoriser la sélection uniquement dans les champs de saisie
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return;
  }
  e.preventDefault();
}, { passive: false });

// 2. Supprimer immédiatement toute sélection qui apparaît
document.addEventListener('selectionchange', () => {
  const selection = document.getSelection();
  if (selection && selection.toString().length > 0) {
    const anchorNode = selection.anchorNode;
    if (anchorNode) {
      const element = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
      // Vérifier si on est dans un input/textarea
      if (element && !element.closest('input') && !element.closest('textarea') && !element.isContentEditable) {
        selection.removeAllRanges();
      }
    }
  }
});

// 3. Bloquer le menu contextuel sur les éléments non-input
document.addEventListener('contextmenu', (e) => {
  const target = e.target;
  if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
}, { passive: false });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Enregistrer le Service Worker pour PWA et mode offline
serviceWorkerRegistration.register();
serviceWorkerRegistration.setupPWAInstall();
serviceWorkerRegistration.setupOfflineDetection();
