/**
 * Configuration centralisée de navigation — sections et sous-pages.
 * Clé section post-partum : `postpartum` (alignée sur colorRegistry / SECTION_ACCENT).
 */
import { SECTION_COLOR_REGISTRY } from '../utils/colorRegistry.js';

export const POSTPARTUM_SECTION_ID = 'postpartum';

export const POSTPARTUM_SECTION_THEME = SECTION_COLOR_REGISTRY[POSTPARTUM_SECTION_ID];

/** 4 cartes principales du hub Suivi post-partum */
export const POSTPARTUM_CATEGORIES = [
  {
    id: 'alimentation',
    titleKey: 'postpartum.alimentation',
    title: 'Alimentation',
    descKey: 'postpartum.alimentationDesc',
    desc: 'Allaitement, biberons, diversification',
    route: '/postpartum/alimentation',
    icon: 'Utensils',
  },
  {
    id: 'soins',
    titleKey: 'postpartum.soins',
    title: 'Soins quotidiens',
    descKey: 'postpartum.soinsDesc',
    desc: 'Coucher, change, portage',
    route: '/postpartum/soins',
    icon: 'Baby',
  },
  {
    id: 'securite',
    titleKey: 'postpartum.securite',
    title: 'Sécurité',
    descKey: 'postpartum.securiteDesc',
    desc: 'Difficultés, précautions',
    route: '/postpartum/securite',
    icon: 'Shield',
  },
  {
    id: 'rdv',
    titleKey: 'postpartum.rdv',
    title: 'RDV médicaux',
    descKey: 'postpartum.rdvDesc',
    desc: 'Suivi post-accouchement',
    route: '/postpartum/rdv',
    icon: 'Stethoscope',
  },
];

/** Sous-cartes par catégorie post-partum */
export const POSTPARTUM_CATEGORY_ITEMS = {
  alimentation: [
    {
      id: 'breastfeeding',
      emoji: '🤱',
      titleKey: 'postpartum.items.breastfeeding',
      title: 'Allaitement maternel',
      descKey: 'postpartum.items.breastfeedingDesc',
      desc: 'Positions, conseils, difficultés',
      route: '/postpartum/alimentation/allaitement',
    },
    {
      id: 'formula',
      emoji: '🍼',
      titleKey: 'postpartum.items.formula',
      title: 'Biberons',
      descKey: 'postpartum.items.formulaDesc',
      desc: 'Préparation, quantités, stérilisation',
      route: '/postpartum/alimentation/biberons',
    },
    {
      id: 'diversification',
      emoji: '🥕',
      titleKey: 'postpartum.items.diversification',
      title: 'Diversification alimentaire',
      descKey: 'postpartum.items.diversificationDesc',
      desc: 'Introduction des aliments',
      route: '/postpartum/alimentation/diversification',
    },
    {
      id: 'recipes',
      emoji: '👨‍🍳',
      titleKey: 'postpartum.items.recipes',
      title: 'Recettes pour bébé',
      descKey: 'postpartum.items.recipesDesc',
      desc: 'Purées, compotes, petits plats',
      route: '/postpartum/alimentation/recettes',
    },
  ],
  soins: [
    {
      id: 'diapers',
      emoji: '😴',
      titleKey: 'postpartum.items.diapers',
      title: 'Coucher et change',
      descKey: 'postpartum.items.diapersDesc',
      desc: 'Sommeil, couches, soins',
      route: '/postpartum/soins/coucher-change',
    },
    {
      id: 'babywearing',
      emoji: '🤱',
      titleKey: 'postpartum.items.babywearing',
      title: 'Portage',
      descKey: 'postpartum.items.babywearingDesc',
      desc: 'Écharpes, porte-bébé, positions',
      route: '/postpartum/soins/portage',
    },
  ],
  securite: [
    {
      id: 'difficulties',
      emoji: '💭',
      titleKey: 'postpartum.items.difficulties',
      title: 'Difficultés rencontrées',
      descKey: 'postpartum.items.difficultiesDesc',
      desc: 'Baby blues, fatigue, solutions',
      route: '/postpartum/securite/difficultes',
    },
    {
      id: 'precautions',
      emoji: '🛡️',
      titleKey: 'postpartum.items.precautions',
      title: 'Précautions et sécurité',
      descKey: 'postpartum.items.precautionsDesc',
      desc: 'Gestes à éviter, vigilance',
      route: '/postpartum/securite/precautions',
    },
  ],
};

export function getPostpartumCategoryById(categoryId) {
  return POSTPARTUM_CATEGORIES.find((cat) => cat.id === categoryId) ?? null;
}

export function getPostpartumItemsForCategory(categoryId) {
  return POSTPARTUM_CATEGORY_ITEMS[categoryId] ?? [];
}

/** Entrées journey / SectionDetail — dérivées de la config centralisée */
export function getJourneyPostpartumItems() {
  return POSTPARTUM_CATEGORIES.map((cat) => ({
    id: `postpartum-${cat.id}`,
    titleKey: cat.titleKey,
    title: cat.title,
    descKey: cat.descKey,
    desc: cat.desc,
    route: cat.route,
    icon: cat.icon,
  }));
}
