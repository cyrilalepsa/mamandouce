import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, X, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useTheme } from '../../contexts/ThemeContext';

// Icônes pour les items
const ITEM_ICONS = {
  'preconception': '✨',
  'pregnancy': '🤰',
  'baby-preparation': '🎁',
  'postpartum': '💕',
  'services': '⚙️',
  'faq-baby': '❓',
  'cycle-tracking': '📅',
  'fertility-calc': '📊',
  'preparation-advice': '💡',
  'food-scanner': '📷',
  'food-library': '🍎',
  'favorites': '❤️',
  'history': '📜',
  'baby-names': '👶',
  'tips-evolution': '📖',
  'medical-appointments': '🩺',
  'pregnancy-tracking': '📊',
  'reminders': '🔔',
  'parental-leave': '⚖️',
  'birth-list': '📝',
  'maternity-bag': '🧳',
  'chatbot': '🤖',
  'baby-weight': '⚖️',
  'kick-counter': '👣',
  // Post-partum items
  'postpartum-rdv': '🩺',
  'postpartum-alimentation': '🍼',
  'postpartum-soins': '👶',
  'postpartum-securite': '🛡️',
  // Baby prep items
  'prep-tips': '💡',
  'videos-resources': '🎬',
  // Services items
  'caf': '🏢',
  'ameli': '🏥',
  'maps': '📍',
  'videos': '🎬',
  // Items alimentation post-partum
  'breastfeeding': '🤱',
  'formula': '🍼',
  'diversification': '🥣',
  'recipes': '🍽️',
  'hydration': '💧',
  'supplements': '💊',
  'meal-ideas': '🥗',
  // Items soins bébé
  'diapers': '🧷',
  'babywearing': '👶',
  'bathing': '🛁',
  'skincare': '🧴',
  'sleep': '😴',
  'massage': '👐',
  // Items sécurité
  'difficulties': '⚠️',
  'precautions': '🛡️',
  'home-safety': '🏠',
  'car-safety': '🚗',
  'sleep-safety': '🛏️',
  'first-aid': '🩹',
};

const ITEM_NAMES = {
  'preconception': 'Préconception',
  'pregnancy': 'Grossesse',
  'baby-preparation': 'Préparation bébé',
  'postpartum': 'Post-partum',
  'services': 'Services',
  'faq-baby': 'FAQ Bébé',
  'cycle-tracking': 'Cycles',
  'fertility-calc': 'Fertilité',
  'preparation-advice': 'Conseils',
  'food-scanner': 'Scanner',
  'food-library': 'Bibliothèque',
  'favorites': 'Favoris',
  'history': 'Historique',
  'baby-names': 'Prénoms',
  'tips-evolution': 'Conseils',
  'medical-appointments': 'RDV',
  'pregnancy-tracking': 'Suivi',
  'reminders': 'Rappels',
  'parental-leave': 'Congés',
  'birth-list': 'Naissance',
  'maternity-bag': 'Valise',
  'chatbot': 'Assistant',
  'baby-weight': 'Poids bébé',
  'kick-counter': 'Coups de pied',
  // Post-partum items
  'postpartum-rdv': 'RDV post-partum',
  'postpartum-alimentation': 'Alimentation',
  'postpartum-soins': 'Soins bébé',
  'postpartum-securite': 'Sécurité',
  // Baby prep items
  'prep-tips': 'Conseils',
  'videos-resources': 'Vidéos',
  // Services items
  'caf': 'CAF',
  'ameli': 'Ameli',
  'maps': 'Mairie',
  'videos': 'Vidéos',
  // Items alimentation post-partum
  'breastfeeding': 'Allaitement',
  'formula': 'Biberon',
  'diversification': 'Diversification',
  'recipes': 'Recettes',
  'hydration': 'Hydratation',
  'supplements': 'Compléments',
  'meal-ideas': 'Idées repas',
  // Items soins bébé
  'diapers': 'Couches',
  'babywearing': 'Portage',
  'bathing': 'Bain',
  'skincare': 'Soins peau',
  'sleep': 'Sommeil',
  'massage': 'Massage',
  // Items sécurité
  'difficulties': 'Difficultés',
  'precautions': 'Précautions',
  'home-safety': 'Maison',
  'car-safety': 'Voiture',
  'sleep-safety': 'Sommeil sûr',
  'first-aid': 'Premiers secours',
};

// Clés de traduction pour chaque item
const ITEM_TRANSLATION_KEYS = {
  // === SECTIONS PRINCIPALES ===
  'preconception': 'journey.sections.preconception',
  'pregnancy': 'journey.sections.pregnancy',
  'baby-preparation': 'journey.sections.babyPreparation',
  'postpartum': 'journey.sections.postpartum',
  'services': 'journey.sections.services',
  'faq-baby': 'sections.faq',
  
  // === PRÉCONCEPTION ===
  'cycle-tracking': 'preconception.cycleTracking',
  'fertility-calc': 'preconception.fertilityCalc',
  'preparation-advice': 'preconception.preparationAdvice',
  
  // === GROSSESSE ===
  'food-scanner': 'pregnancy.scanner',
  'food-library': 'pregnancy.library',
  'favorites': 'pregnancy.favorites',
  'history': 'pregnancy.history',
  'baby-names': 'pregnancy.babyNames',
  'tips-evolution': 'pregnancy.tipsAndEvolution',
  'medical-appointments': 'pregnancy.appointments',
  'pregnancy-tracking': 'pregnancy.tracking',
  'reminders': 'pregnancy.reminders',
  'parental-leave': 'pregnancy.parentalLeave',
  'baby-weight': 'pregnancy.babyWeight',
  'kick-counter': 'pregnancy.kickCounter',
  
  // === PRÉPARATION BÉBÉ ===
  'birth-list': 'babyPrep.birthList',
  'maternity-bag': 'babyPrep.maternityBag',
  'prep-tips': 'babyPrep.prepTips',
  'videos-resources': 'babyPrep.videosResources',
  
  // === POST-PARTUM ===
  'postpartum-rdv': 'postpartum.rdv',
  'postpartum-alimentation': 'postpartum.alimentation',
  'postpartum-soins': 'postpartum.soins',
  'postpartum-securite': 'postpartum.securite',
  
  // === ALIMENTATION POST-PARTUM (sous-sous-cartes) ===
  'breastfeeding': 'postpartum.alimentation.breastfeeding',
  'formula': 'postpartum.alimentation.formula',
  'diversification': 'postpartum.alimentation.diversification',
  'recipes': 'postpartum.alimentation.recipes',
  
  // === SOINS BÉBÉ (sous-sous-cartes) ===
  'diapers': 'postpartum.soins.diapers',
  'babywearing': 'postpartum.soins.babywearing',
  'bathing': 'postpartum.soins.bathing',
  'skincare': 'postpartum.soins.skincare',
  'sleep': 'postpartum.soins.sleep',
  'massage': 'postpartum.soins.massage',
  
  // === SÉCURITÉ (sous-sous-cartes) ===
  'difficulties': 'postpartum.securite.difficulties',
  'precautions': 'postpartum.securite.precautions',
  'home-safety': 'postpartum.securite.homeSafety',
  'car-safety': 'postpartum.securite.carSafety',
  'sleep-safety': 'postpartum.securite.sleepSafety',
  'first-aid': 'postpartum.securite.firstAid',
  
  // === SERVICES ===
  'chatbot': 'services.chatbot',
  'caf': 'services.caf',
  'ameli': 'services.ameli',
  'maps': 'services.maps',
  'videos': 'services.videos',
};

// Styles bombés et colorés pour chaque item
const ITEM_STYLES = {
  // === SECTIONS PRINCIPALES ===
  'preconception': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'pregnancy': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'baby-preparation': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  'postpartum': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fecdd3 50%, #fda4af 100%)',
    shadow: '0 8px 25px rgba(253, 164, 175, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 113, 133, 0.3)'
  },
  'services': { 
    gradient: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
    shadow: '0 8px 25px rgba(165, 180, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(129, 140, 248, 0.3)'
  },
  'faq-baby': {
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
    shadow: '0 8px 25px rgba(251, 191, 36, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(245, 158, 11, 0.3)'
  },
  
  // === ITEMS PRÉCONCEPTION ===
  'cycle-tracking': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'fertility-calc': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  'preparation-advice': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  
  // === ITEMS GROSSESSE - ALIMENTATION (JAUNE/ORANGE) ===
  'food-scanner': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'food-library': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'favorites': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'history': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  
  // === ITEMS GROSSESSE - PRÉNOMS (BLEU) ===
  'baby-names': { 
    gradient: 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    shadow: '0 8px 25px rgba(147, 197, 253, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(96, 165, 250, 0.3)'
  },
  
  // === ITEMS GROSSESSE - MÉDICAL (VERT) ===
  'tips-evolution': { 
    gradient: 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    shadow: '0 8px 25px rgba(134, 239, 172, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  },
  'medical-appointments': { 
    gradient: 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    shadow: '0 8px 25px rgba(134, 239, 172, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  },
  'pregnancy-tracking': { 
    gradient: 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    shadow: '0 8px 25px rgba(134, 239, 172, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  },
  'reminders': { 
    gradient: 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    shadow: '0 8px 25px rgba(134, 239, 172, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  },
  
  // === ITEMS GROSSESSE - CONGÉS (ROUGE/ROSE) ===
  'parental-leave': { 
    gradient: 'linear-gradient(145deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)',
    shadow: '0 8px 25px rgba(251, 113, 133, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 63, 94, 0.3)'
  },
  
  // === ITEMS PRÉPARATION BÉBÉ ===
  'birth-list': { 
    gradient: 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
    shadow: '0 8px 25px rgba(110, 231, 183, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(52, 211, 153, 0.3)'
  },
  'maternity-bag': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'prep-tips': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'videos-resources': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  
  // === ITEMS POST-PARTUM ===
  'postpartum-rdv': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'postpartum-alimentation': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'postpartum-soins': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'postpartum-securite': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  
  // === ITEMS ALIMENTATION POST-PARTUM ===
  'breastfeeding': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'formula': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'diversification': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'recipes': { 
    gradient: 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
    shadow: '0 8px 25px rgba(110, 231, 183, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(52, 211, 153, 0.3)'
  },
  'hydration': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'supplements': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'meal-ideas': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  
  // === ITEMS SOINS BÉBÉ ===
  'diapers': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'babywearing': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'bathing': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'skincare': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'sleep': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  'massage': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  
  // === ITEMS SÉCURITÉ ===
  'difficulties': { 
    gradient: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
    shadow: '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'precautions': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  'home-safety': { 
    gradient: 'linear-gradient(145deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
    shadow: '0 8px 25px rgba(110, 231, 183, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(52, 211, 153, 0.3)'
  },
  'car-safety': { 
    gradient: 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    shadow: '0 8px 25px rgba(147, 197, 253, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(96, 165, 250, 0.3)'
  },
  'sleep-safety': { 
    gradient: 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 50%, #d8b4fe 100%)',
    shadow: '0 8px 25px rgba(216, 180, 254, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  'first-aid': { 
    gradient: 'linear-gradient(145deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)',
    shadow: '0 8px 25px rgba(251, 113, 133, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 63, 94, 0.3)'
  },
  
  // === ITEMS SERVICES ===
  'chatbot': { 
    gradient: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
    shadow: '0 8px 25px rgba(125, 211, 252, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'caf': { 
    gradient: 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    shadow: '0 8px 25px rgba(147, 197, 253, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(96, 165, 250, 0.3)'
  },
  'ameli': { 
    gradient: 'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%)',
    shadow: '0 8px 25px rgba(134, 239, 172, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  },
  'maps': { 
    gradient: 'linear-gradient(145deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)',
    shadow: '0 8px 25px rgba(251, 113, 133, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 63, 94, 0.3)'
  },
  'videos': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  
  // === ITEMS GROSSESSE ADDITIONNELS ===
  'baby-weight': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'kick-counter': { 
    gradient: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
    shadow: '0 8px 25px rgba(249, 168, 212, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  
  // === STYLE PAR DÉFAUT ===
  'default': { 
    gradient: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    shadow: '0 8px 25px rgba(187, 247, 208, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)',
    border: 'rgba(74, 222, 128, 0.3)'
  }
};

// Routes pour les items
const ITEM_ROUTES = {
  'preconception': '/section/preconception',
  'pregnancy': '/section/pregnancy',
  'baby-preparation': '/section/baby-preparation',
  'postpartum': '/postpartum',
  'services': '/section/services',
  'faq-baby': '/faq-baby',
  'cycle-tracking': '/cycle-tracking',
  'fertility-calc': '/fertility-calculator',
  'preparation-advice': '/preconception-tips',
  'food-scanner': '/scanner',
  'food-library': '/library',
  'favorites': '/favorites',
  'history': '/history',
  'baby-names': '/baby-names',
  'tips-evolution': '/tips',
  'medical-appointments': '/medical',
  'pregnancy-tracking': '/tracking',
  'reminders': '/reminders',
  'parental-leave': '/parental-leave',
  'birth-list': '/birth-list',
  'maternity-bag': '/maternity-bag',
  'chatbot': '/chatbot',
};

// Composant pour un item draggable
export function DraggableItem({ 
  item, 
  index = 0,
  totalItems = 1,
  onDragStart, 
  onDragEnd, 
  onDrop, 
  isDragging,
  isDropTarget,
  onRemove,
  onLongPress,
  showDeleteButton = false,
  // Props pour les pages utilisateur
  isUserPage = false,
  canDrag = false,
  onHidePopup,
  // Callback direct pour créer un groupe (drag sur autre élément)
  onDropOnItem,
  // Callback pour ajouter à un groupe existant
  onAddToGroup
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const longPressTimer = useRef(null);
  const isLongPressRef = useRef(false);
  const isDraggingRef = useRef(false);
  const touchStartTime = useRef(0);
  const [showDelete, setShowDelete] = useState(showDeleteButton);
  
  // Couleur du texte conditionnelle pour le mode sombre
  const textColorClass = isDarkMode ? 'text-black' : 'text-slate-700';
  
  // États pour le déplacement dans la grille (pages utilisateur uniquement)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [isLongPressActive, setIsLongPressActive] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  
  // Durée de l'appui long (1 seconde)
  const LONG_PRESS_DURATION = 1000;
  // Seuil de mouvement pour considérer comme déplacement (en pixels)
  const MOVE_THRESHOLD = 10;
  
  const icon = ITEM_ICONS[item.id] || '📌';
  // Utiliser la traduction si disponible, sinon le nom statique
  const translationKey = ITEM_TRANSLATION_KEYS[item.id];
  const name = translationKey ? t(translationKey, ITEM_NAMES[item.id] || item.id) : (ITEM_NAMES[item.id] || item.id);
  const route = ITEM_ROUTES[item.id];
  const itemStyle = ITEM_STYLES[item.id] || ITEM_STYLES['default'];
  
  // Debug en développement - à retirer en production
  if (!ITEM_STYLES[item.id]) {
    console.warn(`DraggableItem: Style manquant pour item.id="${item.id}". Utilisation du style par défaut.`);
  }

  // Synchroniser avec la prop externe
  useEffect(() => {
    setShowDelete(showDeleteButton);
  }, [showDeleteButton]);

  // Nettoyer les timers au démontage
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    // Empêcher le comportement par défaut pour éviter les conflits
    e.stopPropagation();
    
    isLongPressRef.current = false;
    isDraggingRef.current = false;
    hasMoved.current = false;
    touchStartTime.current = Date.now();
    
    // Stocker la position de départ du toucher
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    setDragOffset({ x: 0, y: 0 });
    
    // Timer pour l'appui long (1 seconde)
    longPressTimer.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsLongPressActive(true);
      
      // Vibration pour indiquer que l'appui long est activé
      if (navigator.vibrate) navigator.vibrate(50);
      
      // Si pas de mouvement après 1s, afficher la popup (duplication ou suppression selon la page)
      if (!hasMoved.current) {
        onLongPress?.(item);
      }
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartPos.current.x;
    const deltaY = touch.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Si on bouge au-delà du seuil (réduit à 5px pour plus de réactivité)
    if (distance > 5) {
      hasMoved.current = true;
      
      // Si l'appui long est actif ET sur une page utilisateur (déplacement autorisé)
      if (isLongPressRef.current && isUserPage && canDrag) {
        // STOPPER la propagation pour empêcher le swipe parent
        e.stopPropagation();
        e.preventDefault();
        
        // Masquer la popup car on déplace
        onHidePopup?.();
        
        isDraggingRef.current = true;
        setIsDraggingState(true);
        
        // Mettre à jour l'offset de déplacement (visuel pendant le drag)
        setDragOffset({ x: deltaX, y: deltaY });
      } else if (!isLongPressRef.current) {
        // Mouvement avant 1s = annuler le long press (c'est un scroll/swipe)
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    // Nettoyer le timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Si on était en train de déplacer sur une page utilisateur
    if (isDraggingRef.current && isUserPage && hasMoved.current) {
      e.stopPropagation();
      e.preventDefault();
      
      // Vérifier si on relâche sur un autre élément ou groupe
      const touch = e.changedTouches[0];
      const elementsAtPoint = document.elementsFromPoint(touch.clientX, touch.clientY);
      
      for (const el of elementsAtPoint) {
        // Vérifier si c'est un groupe
        const targetGroup = el.closest('[data-draggable="group"]');
        if (targetGroup) {
          const groupId = targetGroup.getAttribute('data-group-id');
          if (groupId && onAddToGroup) {
            console.log('Adding to group:', item.id, '→', groupId);
            onAddToGroup(item.id, groupId);
            break;
          }
        }
        
        // Vérifier si c'est un autre item (pour créer un nouveau groupe)
        const targetDraggable = el.closest('[data-draggable="true"]');
        if (targetDraggable && targetDraggable !== e.currentTarget) {
          const targetItemId = targetDraggable.getAttribute('data-item-id');
          if (targetItemId && targetItemId !== item.id && onDropOnItem) {
            console.log('Creating group:', item.id, '+', targetItemId);
            onDropOnItem(item.id, targetItemId);
            break;
          }
        }
      }
    }
    
    // Réinitialiser les états
    isDraggingRef.current = false;
    setIsDraggingState(false);
    setIsLongPressActive(false);
    setDragOffset({ x: 0, y: 0 });
    
    // Si on a glissé après un appui long, ne pas traiter comme un clic
    if (hasMoved.current && isLongPressRef.current) {
      e.preventDefault();
    }
  };

  const handleClick = (e) => {
    // Si c'était un appui long avec mouvement, ne pas naviguer
    if (isLongPressRef.current && hasMoved.current) {
      return;
    }
    
    // Si on montre le bouton supprimer, le cacher
    if (showDelete) {
      setShowDelete(false);
      return;
    }
    
    // Naviguer vers la route de l'item (uniquement sur tap court sans appui long)
    if (route && !isLongPressRef.current) {
      navigate(route);
    }
  };

  return (
    <div
      data-draggable="true"
      data-item-id={item.id}
      data-testid={`draggable-item-${item.id}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={`
        relative rounded-3xl p-4
        ${isDraggingState ? 'cursor-grabbing' : 'cursor-pointer active:scale-[0.97]'}
        ${isLongPressActive && !isDraggingState ? 'scale-105' : ''}
        ${!isDraggingState ? 'transition-all duration-200' : ''} select-none
        ${isDropTarget ? 'ring-2 ring-pink-400 scale-105' : ''}
        ${showDelete ? 'animate-wiggle' : ''}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
        // Appliquer le transform pendant le drag (suivre le doigt)
        transform: isDraggingState 
          ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(1.05)` 
          : undefined,
        transformOrigin: 'center center',
        // ===== STYLES "BOMBÉ" GARANTIS - toujours coloré =====
        background: itemStyle?.gradient || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
        boxShadow: isDraggingState 
          ? '0 20px 40px rgba(0,0,0,0.25), ' + (itemStyle?.shadow || '0 8px 25px rgba(252, 211, 77, 0.35)')
          : (itemStyle?.shadow || '0 8px 25px rgba(252, 211, 77, 0.35), inset 0 -4px 12px rgba(0,0,0,0.08)'),
        border: `1px solid ${itemStyle?.border || 'rgba(251, 191, 36, 0.3)'}`,
        // Taille de la carte
        width: '100%',
        minHeight: '90px',
        // Z-index
        zIndex: isDraggingState ? 100 : 1,
        // Opacité
        opacity: 1,
        // Touch action pour éviter les conflits
        touchAction: isLongPressActive ? 'none' : 'manipulation',
        // Overflow visible pour les badges
        overflow: 'visible',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Voile blanc supprimé */}
      
      {/* Bouton supprimer - visible seulement après appui long */}
      {onRemove && showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors animate-pulse"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
      
      {/* Contenu de la carte */}
      <div className="relative flex flex-col items-center justify-center gap-1 z-10">
        <span className="text-3xl drop-shadow-sm">{icon}</span>
        <span className={`text-xs font-semibold ${textColorClass} text-center leading-tight drop-shadow-sm`}>{name}</span>
      </div>
    </div>
  );
}

// Composant pour un groupe (dossier)
export function ItemGroup({ 
  group, 
  onOpen, 
  onRename, 
  onDelete,
  onRemoveItem,
  onDrop,
  isDropTarget,
  hasSelectedItem = false,
  onAddSelectedItem
}) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showDelete, setShowDelete] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  
  // Couleur du texte conditionnelle pour le mode sombre
  const textColorClass = isDarkMode ? 'text-black' : 'text-slate-700';
  
  // Durée de l'appui long pour suppression (3 secondes)
  const LONG_PRESS_DURATION = 1000;

  const handleTouchStart = (e) => {
    e.stopPropagation(); // Empêcher le déclenchement de la suppression de page
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(100);
      setShowDelete(true);
    }, LONG_PRESS_DURATION); // 1 seconde
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    clearTimeout(longPressTimer.current);
  };

  const handleClick = () => {
    if (isLongPress.current) {
      return;
    }
    
    // Si on a un item sélectionné, l'ajouter au groupe
    if (hasSelectedItem) {
      onAddSelectedItem?.(group);
      return;
    }
    
    // Si on montre le bouton supprimer, le cacher
    if (showDelete) {
      setShowDelete(false);
      return;
    }
    
    // Ouvrir le groupe
    onOpen?.(group);
  };

  const handleRename = () => {
    if (editName.trim() && editName !== group.name) {
      onRename?.(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  // Afficher les 4 premiers items en miniature
  const previewItems = group.items.slice(0, 4);
  
  // Couleur du groupe (avec fallback sur jaune)
  const groupColor = group.color || '#fde68a';
  
  // Générer les couleurs dérivées pour l'effet bombé
  const getGradientColors = (baseColor) => {
    // Créer une version plus claire et plus foncée pour le gradient
    return {
      light: `${baseColor}99`, // 60% opacity
      base: baseColor,
      dark: `${baseColor}dd`   // 87% opacity
    };
  };
  
  const colors = getGradientColors(groupColor);

  return (
    <div
      data-draggable="group"
      data-group-id={group.id}
      data-testid={`item-group-${group.id}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      className={`
        relative rounded-3xl p-3 cursor-pointer
        transition-all duration-200 select-none overflow-visible
        ${isDropTarget ? 'ring-2 ring-purple-400 scale-105' : ''}
        ${showDelete ? 'animate-wiggle' : ''}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
        // Style bombé avec la couleur du groupe
        background: `linear-gradient(145deg, ${colors.light} 0%, ${colors.base} 50%, ${colors.dark} 100%)`,
        boxShadow: `0 8px 25px ${groupColor}55, inset 0 -4px 12px rgba(0,0,0,0.08)`,
        border: `1px solid ${groupColor}44`,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Voile blanc supprimé */}
      
      {/* Bouton supprimer groupe - visible uniquement après appui long */}
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(group.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-red-600 transition-colors animate-pulse"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}

      {/* Badge nombre d'items */}
      <div 
        className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow text-[10px] font-bold text-white z-10"
        style={{ backgroundColor: '#8b5cf6' }}
      >
        {group.items.length}
      </div>

      {/* Grille de miniatures (style iOS) */}
      <div className="relative z-10 grid grid-cols-2 gap-1 mb-2">
        {previewItems.map((item, index) => (
          <div 
            key={item.id} 
            className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center text-sm shadow-inner backdrop-blur-sm"
          >
            {ITEM_ICONS[item.id] || '📌'}
          </div>
        ))}
        {previewItems.length < 4 && Array(4 - previewItems.length).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8 bg-white/40 rounded-lg"></div>
        ))}
      </div>

      {/* Nom du groupe (affiché uniquement si non vide) */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          className="relative z-10 text-xs h-6 text-center bg-white/80"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : group.name ? (
        <p 
          className={`relative z-10 text-xs font-semibold ${textColorClass} text-center truncate drop-shadow-sm`}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {group.name}
        </p>
      ) : null}
    </div>
  );
}

// Couleurs disponibles pour les groupes
const GROUP_COLORS = [
  '#fde68a', // Jaune
  '#fecdd3', // Rose
  '#bbf7d0', // Vert
  '#bfdbfe', // Bleu
  '#ddd6fe', // Violet
  '#fed7aa', // Orange
  '#99f6e4', // Turquoise
  '#fca5a5', // Rouge clair
];

// Popup pour voir le contenu d'un groupe ouvert - Style iOS Folder
export function GroupContentPopup({ group, onClose, onRemoveItem, onChangeColor, onRename, t }) {
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editedName, setEditedName] = useState(group?.name || '');
  const longPressTimer = useRef(null);
  const nameInputRef = useRef(null);
  
  // Durée de l'appui long pour suppression (1 seconde)
  const LONG_PRESS_DURATION = 1000;

  // Mettre à jour editedName quand le groupe change
  useState(() => {
    setEditedName(group?.name || '');
  }, [group?.name]);

  if (!group) return null;
  
  // Couleur actuelle du groupe
  const currentColor = group.color || '#fde68a';

  const handleItemClick = (item) => {
    // Si on est en mode suppression, ne pas naviguer
    if (itemToDelete) {
      setItemToDelete(null);
      return;
    }
    
    // Naviguer vers le contenu de l'item
    const route = ITEM_ROUTES[item.id];
    if (route) {
      onClose();
      navigate(route);
    }
  };

  const handleLongPressStart = (item) => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(100);
      setItemToDelete(item.id);
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleRemoveItem = (itemId) => {
    onRemoveItem?.(itemId);
    setItemToDelete(null);
  };
  
  const handleColorChange = (color) => {
    if (onChangeColor) {
      onChangeColor(group.id, color);
    }
    setShowColorPicker(false);
  };
  
  // Sauvegarder le nom quand on quitte le champ
  const handleSaveName = () => {
    if (onRename && editedName !== group.name) {
      onRename(group.id, editedName.trim());
    }
  };

  // Style de carte pour chaque item (style bombé)
  const getItemStyle = (itemId) => {
    const style = ITEM_STYLES[itemId] || ITEM_STYLES['default'];
    return style;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Conteneur principal - Fond GRIS TRANSPARENT */}
      <div 
        className="relative w-full max-w-[300px] rounded-[28px] p-5"
        style={{
          background: 'rgba(60, 60, 67, 0.45)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'blur(40px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bulle de couleur en haut à droite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(!showColorPicker);
          }}
          className="absolute top-4 right-4 w-5 h-5 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ 
            backgroundColor: currentColor,
            boxShadow: `0 2px 6px ${currentColor}55`
          }}
        />
        
        {/* Sélecteur de couleur */}
        {showColorPicker && (
          <div 
            className="absolute top-11 right-4 p-2 rounded-2xl shadow-lg flex gap-1.5 flex-wrap max-w-[140px] z-10"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          >
            {GROUP_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-5 h-5 rounded-full transition-all ${
                  currentColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Champ de nom visible */}
        <div className="mb-4 pr-8">
          <input
            ref={nameInputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveName();
                nameInputRef.current?.blur();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-base font-semibold text-white bg-transparent border-b border-white/40 focus:border-white/70 outline-none pb-1 transition-colors placeholder-white/50"
            placeholder={t('home.groupName', 'Nom du groupe')}
            style={{ caretColor: 'white' }}
          />
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-3 gap-2.5 justify-items-center mb-4">
          {group.items.map((item) => {
            const itemStyle = getItemStyle(item.id);
            const isDeleting = itemToDelete === item.id;
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onTouchStart={() => handleLongPressStart(item)}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
                className={`
                  flex flex-col items-center gap-1.5 cursor-pointer
                  transition-all duration-200 select-none
                  ${isDeleting ? 'animate-wiggle' : 'active:scale-95'}
                `}
                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
              >
                {/* Icône avec style bombé */}
                <div 
                  className="relative w-[60px] h-[60px] rounded-[16px] flex items-center justify-center"
                  style={{
                    background: itemStyle?.gradient || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
                    boxShadow: itemStyle?.shadow || '0 4px 12px rgba(0,0,0,0.15)',
                    border: `1px solid ${itemStyle?.border || 'rgba(251, 191, 36, 0.3)'}`
                  }}
                >
                  {/* Voile blanc supprimé */}
                  <span className="text-[22px] relative z-10">{ITEM_ICONS[item.id] || '📌'}</span>
                  
                  {/* Bouton supprimer */}
                  {isDeleting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-20"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                
                {/* Nom de l'item */}
                <span className="text-white text-[11px] text-center font-medium leading-tight w-[70px] truncate">
                  {ITEM_NAMES[item.id] || item.id}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bouton Fermer - Fond semi-transparent */}
        <button
          onClick={onClose}
          className="w-full p-2.5 rounded-2xl transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="font-medium text-white/90 text-sm">
            {t('common.close', 'Fermer')}
          </span>
        </button>

        {/* Instructions */}
        <p className="text-white/50 text-[10px] text-center mt-3">
          {itemToDelete 
            ? t('home.tapToRemove', 'Tapez sur X pour retirer')
            : t('home.longPressToDelete', 'Appui long (1s) pour supprimer')
          }
        </p>
      </div>
    </div>
  );
}

// Zone de drop pour créer un groupe
export function DropZone({ onDrop, isActive, children }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('itemId');
    if (draggedItemId) {
      onDrop?.(draggedItemId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        min-h-[100px] rounded-2xl border-2 border-dashed
        transition-all duration-200
        ${isActive 
          ? 'border-pink-400 bg-pink-50/50' 
          : 'border-slate-200 bg-slate-50/30'
        }
      `}
    >
      {children}
    </div>
  );
}

export default { DraggableItem, ItemGroup, GroupContentPopup, DropZone };
