import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { safeGet, safeSet } from '../utils/safeStorage';

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
  const saved = safeGet('mamandouce_language');
  if (saved && languages.some(l => l.code === saved)) {
    return saved;
  }
  return null;
};

const isFirstVisit = () => {
  return !safeGet('mamandouce_language_detected');
};

const markLanguageDetected = () => {
  safeSet('mamandouce_language_detected', 'true');
};

try {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: getSavedLanguage() || 'fr',
      fallbackLng: 'fr',
      supportedLngs: languages.map(l => l.code),
      detection: {
        order: ['navigator', 'htmlTag'],
        caches: [],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
} catch (err) {
  console.warn('[i18n] init failed — fallback fr', err);
}

// Fonction pour changer la langue
export const changeLanguage = (languageCode) => {
  i18n.changeLanguage(languageCode);
  safeSet('mamandouce_language', languageCode);
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
