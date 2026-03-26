import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './i18n'; // Initialisation i18n pour multi-langues

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
