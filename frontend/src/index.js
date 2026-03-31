import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './i18n'; // Initialisation i18n pour multi-langues

// Empêcher la sélection de texte sur mobile (Android/iOS)
// Cela évite le menu "Copier / Partager" lors d'appui long
document.addEventListener('selectionchange', () => {
  const selection = document.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
    
    // Si l'élément est dans un modal, popup, ou zone interactive, annuler la sélection
    if (element && (
      element.closest('[class*="z-50"]') ||
      element.closest('[class*="modal"]') ||
      element.closest('.select-none') ||
      element.closest('button') ||
      element.closest('[data-testid]')
    )) {
      selection.removeAllRanges();
    }
  }
});

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
