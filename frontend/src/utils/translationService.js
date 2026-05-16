/**
 * Service de traduction automatique pour le contenu dynamique
 * Utilise l'API GPT via le backend pour traduire le contenu de la base de données
 */
import api from './api';

const CACHE_PREFIX = 'translation_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Récupère une traduction depuis le cache local
 */
const getCachedTranslation = (key, targetLang) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${targetLang}_${key}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { text, timestamp } = JSON.parse(cached);
      // Vérifier si le cache n'est pas expiré
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return text;
      }
      // Cache expiré, le supprimer
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return null;
};

/**
 * Sauvegarde une traduction dans le cache local
 */
const setCachedTranslation = (key, targetLang, text) => {
  try {
    const cacheKey = `${CACHE_PREFIX}${targetLang}_${key}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      text,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
};

/**
 * Génère une clé de cache à partir du texte
 */
const generateCacheKey = (text) => {
  // Simple hash pour créer une clé unique
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Traduit un texte unique
 * @param {string} text - Texte à traduire
 * @param {string} targetLang - Code de la langue cible (en, es, pt, it, de)
 * @param {string} sourceLang - Code de la langue source (défaut: fr)
 * @returns {Promise<string>} - Texte traduit
 */
export const translateText = async (text, targetLang, sourceLang = 'fr') => {
  // Si même langue, retourner le texte original
  if (targetLang === sourceLang || !text || !text.trim()) {
    return text;
  }

  // Vérifier le cache
  const cacheKey = generateCacheKey(text);
  const cached = getCachedTranslation(cacheKey, targetLang);
  if (cached) {
    return cached;
  }

  try {
    const response = await api.post('/translate/text', {
      text,
      target_lang: targetLang,
      source_lang: sourceLang
    });

    const translated = response.data.translated;
    
    // Mettre en cache
    setCachedTranslation(cacheKey, targetLang, translated);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Retourner le texte original en cas d'erreur
  }
};

/**
 * Traduit plusieurs textes en batch
 * @param {string[]} texts - Textes à traduire
 * @param {string} targetLang - Code de la langue cible
 * @param {string} sourceLang - Code de la langue source
 * @returns {Promise<string[]>} - Textes traduits
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'fr') => {
  if (targetLang === sourceLang || !texts || texts.length === 0) {
    return texts;
  }

  // Vérifier le cache pour chaque texte
  const results = [];
  const toTranslate = [];
  const toTranslateIndices = [];

  texts.forEach((text, index) => {
    if (!text || !text.trim()) {
      results[index] = text;
      return;
    }

    const cacheKey = generateCacheKey(text);
    const cached = getCachedTranslation(cacheKey, targetLang);
    if (cached) {
      results[index] = cached;
    } else {
      toTranslate.push(text);
      toTranslateIndices.push(index);
    }
  });

  // Si tout est en cache, retourner directement
  if (toTranslate.length === 0) {
    return results;
  }

  try {
    const response = await api.post('/translate/batch', {
      texts: toTranslate,
      target_lang: targetLang,
      source_lang: sourceLang
    });

    const translated = response.data.translated;

    // Mettre à jour les résultats et le cache
    toTranslateIndices.forEach((originalIndex, i) => {
      const translatedText = translated[i];
      results[originalIndex] = translatedText;
      
      // Mettre en cache
      const cacheKey = generateCacheKey(toTranslate[i]);
      setCachedTranslation(cacheKey, targetLang, translatedText);
    });

    return results;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Retourner les textes originaux pour ceux qui n'ont pas pu être traduits
    toTranslateIndices.forEach((originalIndex, i) => {
      results[originalIndex] = toTranslate[i];
    });
    return results;
  }
};

/**
 * Traduit un objet avec des champs spécifiques
 * @param {Object} data - Objet à traduire
 * @param {string} targetLang - Code de la langue cible
 * @param {string[]} fieldsToTranslate - Champs à traduire
 * @param {string} sourceLang - Code de la langue source
 * @returns {Promise<Object>} - Objet traduit
 */
export const translateObject = async (data, targetLang, fieldsToTranslate = null, sourceLang = 'fr') => {
  if (targetLang === sourceLang || !data) {
    return data;
  }

  try {
    const response = await api.post('/translate/dict', {
      data,
      target_lang: targetLang,
      source_lang: sourceLang,
      fields_to_translate: fieldsToTranslate
    });

    return response.data.translated;
  } catch (error) {
    console.error('Object translation error:', error);
    return data;
  }
};

/**
 * Hook personnalisé pour la traduction dynamique avec état de chargement
 */
export const useTranslateContent = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);

  const translate = async (content, targetLang, options = {}) => {
    setIsTranslating(true);
    setError(null);

    try {
      if (Array.isArray(content)) {
        return await translateBatch(content, targetLang, options.sourceLang);
      } else if (typeof content === 'object') {
        return await translateObject(content, targetLang, options.fields, options.sourceLang);
      } else {
        return await translateText(content, targetLang, options.sourceLang);
      }
    } catch (err) {
      setError(err);
      return content;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translate, isTranslating, error };
};

/**
 * Vide le cache de traduction local
 */
export const clearTranslationCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`Cleared ${keysToRemove.length} cached translations`);
};

/**
 * Récupère les statistiques du cache local
 */
export const getCacheStats = () => {
  let count = 0;
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      count++;
      const item = localStorage.getItem(key);
      if (item) size += item.length;
    }
  }
  return {
    entries: count,
    sizeKB: Math.round(size / 1024 * 100) / 100
  };
};

// Import React for the hook (note: this file should be .jsx or imported where React is available)
import { useState } from 'react';

export default {
  translateText,
  translateBatch,
  translateObject,
  clearTranslationCache,
  getCacheStats
};
