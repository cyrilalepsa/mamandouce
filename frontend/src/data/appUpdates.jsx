// Historique des mises à jour de l'application
// Chaque entrée contient : version, date, titre, description, features (liste)

export const appUpdates = [
  {
    version: "2.6.0",
    date: "2026-04-06",
    title: "Personnalisation avancée & Dark Mode",
    description: "Nouvelles fonctionnalités de personnalisation",
    features: [
      { text: "Mode sombre pour plus de confort visuel", badge: "dark-mode" },
      { text: "Tutoriel interactif à la première connexion", badge: "tutorial" },
      { text: "Dupliquez vos cartes préférées sur vos pages perso", badge: "duplicate" },
      { text: "Supprimez les cartes dont vous n'avez plus besoin", badge: null },
      { text: "Bouton Accueil : tap = retour, appui long = définir par défaut", badge: "home-button" },
      { text: "Ampoule Nouveautés consultable à tout moment", badge: null },
    ],
    type: "major"
  },
  {
    version: "2.5.0",
    date: "2025-12-24",
    title: "Nouvelles fonctionnalités recettes & UX",
    description: "Améliorations majeures de l'expérience utilisateur",
    features: [
      { text: "Créez et partagez vos propres recettes", badge: "recipe-add" },
      { text: "Partagez une recette individuelle avec vos proches", badge: "recipe-share" },
      { text: "Bouton 'Fermer' en bas de tous les menus déroulants", badge: null },
      { text: "Prénom du jour selon le calendrier des saints", badge: "name-of-day" },
      { text: "Message 'Bonne fête' personnalisé sur la page d'accueil", badge: null },
      { text: "Envoi de messages aux utilisateurs depuis l'admin", badge: null },
    ],
    type: "major"
  },
  {
    version: "2.4.0",
    date: "2025-12-23",
    title: "Menus déroulants post-partum",
    description: "Organisation améliorée du contenu post-partum",
    features: [
      { text: "RDV post-partum organisés par période (Semaine 1, Mois 2...)", badge: null },
      { text: "Sections allaitement en accordéons", badge: null },
      { text: "Guide biberon avec menus déroulants", badge: null },
    ],
    type: "minor"
  },
  {
    version: "2.3.0",
    date: "2025-12-22",
    title: "Déploiement Railway & Notifications",
    description: "Application disponible en ligne 24/7",
    features: [
      { text: "Application accessible sur mamandouce.app (écosystème NeriaCorp)", badge: null },
      { text: "Notifications push améliorées", badge: null },
      { text: "Super admin avec accès complet", badge: null },
    ],
    type: "major"
  },
  {
    version: "2.2.0",
    date: "2025-12-20",
    title: "Améliorations design prénoms",
    description: "Nouveau look pour la section prénoms",
    features: [
      { text: "Cartes prénoms avec nuages colorés par genre", badge: null },
      { text: "Signification en bulle blanche élégante", badge: null },
      { text: "Compteur de vues unique par utilisateur", badge: null },
    ],
    type: "minor"
  },
  {
    version: "2.1.0",
    date: "2025-12-18",
    title: "Tableau de bord admin refait",
    description: "Statistiques plus précises et fiables",
    features: [
      { text: "Séparation utilisateurs test et réels", badge: null },
      { text: "Statistiques mensuelles détaillées", badge: null },
      { text: "Système de notification des nouveautés", badge: null },
    ],
    type: "minor"
  }
];

// Obtenir la dernière version
export const getLatestVersion = () => appUpdates[0]?.version || "1.0.0";

// Obtenir les mises à jour depuis une version donnée
export const getUpdatesSince = (lastSeenVersion) => {
  if (!lastSeenVersion) return appUpdates;
  
  const updates = [];
  for (const update of appUpdates) {
    if (update.version === lastSeenVersion) break;
    updates.push(update);
  }
  return updates;
};

// Obtenir tous les badges actifs (fonctionnalités récentes)
export const getActiveBadges = () => {
  // Badges des 2 dernières versions seulement
  const recentUpdates = appUpdates.slice(0, 2);
  const badges = [];
  
  recentUpdates.forEach(update => {
    update.features.forEach(feature => {
      if (feature.badge) {
        badges.push(feature.badge);
      }
    });
  });
  
  return badges;
};
