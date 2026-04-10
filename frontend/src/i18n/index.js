import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import de from './locales/de.json';

export const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
  de: { translation: de }
};

// Récupérer la langue sauvegardée ou détecter automatiquement
const getSavedLanguage = () => {
  const saved = localStorage.getItem('mamandouce_language');
  if (saved && languages.some(l => l.code === saved)) {
    return saved;
  }
  return null;
};

// Vérifier si c'est la première visite
const isFirstVisit = () => {
  return !localStorage.getItem('mamandouce_language_detected');
};

// Marquer la détection comme faite
const markLanguageDetected = () => {
  localStorage.setItem('mamandouce_language_detected', 'true');
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage() || undefined, // Utiliser la langue sauvegardée ou laisser le détecteur choisir
    fallbackLng: 'fr',
    supportedLngs: languages.map(l => l.code),
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'mamandouce_language',
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false // React échappe déjà les valeurs
    },

    react: {
      useSuspense: false // Éviter les problèmes avec Suspense
    }
  });

// Fonction pour changer la langue
export const changeLanguage = (languageCode) => {
  i18n.changeLanguage(languageCode);
  localStorage.setItem('mamandouce_language', languageCode);
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = () => {
  return i18n.language?.split('-')[0] || 'fr';
};

// Fonction pour vérifier si c'est la première visite et obtenir la langue détectée
export const checkFirstVisitLanguage = () => {
  if (isFirstVisit()) {
    const detectedLang = getCurrentLanguage();
    const langInfo = languages.find(l => l.code === detectedLang);
    markLanguageDetected();
    return langInfo || languages[0];
  }
  return null;
};

export default i18n;
