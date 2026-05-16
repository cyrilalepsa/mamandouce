/**
 * Hook React pour la traduction automatique du contenu dynamique
 * Utilise le service de traduction GPT pour traduire le contenu de la base de données
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText, translateBatch, translateObject } from '../utils/translationService';

/**
 * Hook pour traduire du contenu dynamique
 * @param {string|string[]|Object} content - Contenu à traduire
 * @param {Object} options - Options de traduction
 * @returns {Object} - { translated, isLoading, error }
 */
export function useAutoTranslate(content, options = {}) {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const previousLang = useRef(i18n.language);
  const previousContent = useRef(content);

  const {
    sourceLang = 'fr',
    fields = null, // Pour les objets: liste des champs à traduire
    enabled = true, // Permet de désactiver la traduction
    skipIfSameLanguage = true
  } = options;

  const currentLang = i18n.language?.split('-')[0] || 'fr';

  const doTranslate = useCallback(async () => {
    // Ne pas traduire si désactivé ou même langue
    if (!enabled || (skipIfSameLanguage && currentLang === sourceLang)) {
      setTranslated(content);
      return;
    }

    // Ne pas traduire si pas de contenu
    if (!content || (Array.isArray(content) && content.length === 0)) {
      setTranslated(content);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (Array.isArray(content)) {
        // Traduire un tableau de textes
        result = await translateBatch(content, currentLang, sourceLang);
      } else if (typeof content === 'object' && content !== null) {
        // Traduire un objet
        result = await translateObject(content, currentLang, fields, sourceLang);
      } else if (typeof content === 'string') {
        // Traduire un texte simple
        result = await translateText(content, currentLang, sourceLang);
      } else {
        result = content;
      }

      setTranslated(result);
    } catch (err) {
      console.error('Translation hook error:', err);
      setError(err);
      setTranslated(content); // Fallback au contenu original
    } finally {
      setIsLoading(false);
    }
  }, [content, currentLang, sourceLang, enabled, skipIfSameLanguage, fields]);

  useEffect(() => {
    // Retraduire si la langue change ou si le contenu change
    const langChanged = previousLang.current !== currentLang;
    const contentChanged = JSON.stringify(previousContent.current) !== JSON.stringify(content);

    if (langChanged || contentChanged) {
      previousLang.current = currentLang;
      previousContent.current = content;
      doTranslate();
    }
  }, [currentLang, content, doTranslate]);

  // Fonction pour forcer une retraduction
  const refresh = useCallback(() => {
    doTranslate();
  }, [doTranslate]);

  return {
    translated,
    original: content,
    isLoading,
    error,
    currentLang,
    refresh
  };
}

/**
 * Hook pour traduire une liste d'éléments avec des champs spécifiques
 * @param {Array} items - Liste d'éléments à traduire
 * @param {string[]} fieldsToTranslate - Champs à traduire dans chaque élément
 * @returns {Object} - { items, isLoading, error }
 */
export function useTranslateList(items, fieldsToTranslate = ['title', 'description', 'content']) {
  const { i18n } = useTranslation();
  const [translatedItems, setTranslatedItems] = useState(items);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentLang = i18n.language?.split('-')[0] || 'fr';

  useEffect(() => {
    if (!items || items.length === 0 || currentLang === 'fr') {
      setTranslatedItems(items);
      return;
    }

    const translateItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const translated = await Promise.all(
          items.map(item => translateObject(item, currentLang, fieldsToTranslate, 'fr'))
        );
        setTranslatedItems(translated);
      } catch (err) {
        console.error('List translation error:', err);
        setError(err);
        setTranslatedItems(items);
      } finally {
        setIsLoading(false);
      }
    };

    translateItems();
  }, [items, currentLang, fieldsToTranslate]);

  return {
    items: translatedItems,
    original: items,
    isLoading,
    error,
    currentLang
  };
}

/**
 * Composant wrapper pour le contenu traduit automatiquement
 */
export function AutoTranslate({ children, fallback = null }) {
  const { translated, isLoading } = useAutoTranslate(children);

  if (isLoading && fallback) {
    return fallback;
  }

  return translated;
}

export default useAutoTranslate;
