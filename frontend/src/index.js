import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

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
