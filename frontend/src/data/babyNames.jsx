// Base de données des prénoms par pays, genre et lettre
// Structure: pays -> genre -> lettre -> [{ name, meaning, personality }]

// Import de la base massive des prénoms français (1000+)
import { frenchNames } from './babyNamesFR.jsx';
// Import de la base des prénoms américains
import { americanNames } from './babyNamesUS.jsx';

export const countries = {
  europe: [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
    { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
    { code: 'SE', name: 'Suède', flag: '🇸🇪' },
    { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
    { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
    { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
    { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
    { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
    { code: 'CZ', name: 'République tchèque', flag: '🇨🇿' },
    { code: 'HU', name: 'Hongrie', flag: '🇭🇺' },
    { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
    { code: 'RU', name: 'Russie', flag: '🇷🇺' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
    { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
    { code: 'SK', name: 'Slovaquie', flag: '🇸🇰' },
    { code: 'BG', name: 'Bulgarie', flag: '🇧🇬' },
  ],
  america: [
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
    { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
    { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombie', flag: '🇨🇴' },
    { code: 'CL', name: 'Chili', flag: '🇨🇱' },
    { code: 'PE', name: 'Pérou', flag: '🇵🇪' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
    { code: 'PR', name: 'Porto Rico', flag: '🇵🇷' },
    { code: 'DO', name: 'République dominicaine', flag: '🇩🇴' },
    { code: 'HT', name: 'Haïti', flag: '🇭🇹' },
    { code: 'JM', name: 'Jamaïque', flag: '🇯🇲' },
    { code: 'EC', name: 'Équateur', flag: '🇪🇨' },
  ],
  asia: [
    { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳' },
    { code: 'IN', name: 'Inde', flag: '🇮🇳' },
    { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'TH', name: 'Thaïlande', flag: '🇹🇭' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  ],
  africa: [
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
    { code: 'EG', name: 'Égypte', flag: '🇪🇬' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  ]
};

// Prénoms gratuits (lettres A-E, 3 pays seulement)
export const freeCountries = ['FR', 'US', 'ES'];
export const freeLetters = ['A', 'B', 'C', 'D', 'E'];

// Base de données des prénoms
export const babyNamesData = {
  // FRANCE - Base massive 1000+ prénoms modernes (importée de babyNamesFR.js)
  FR: frenchNames,

  // ÉTATS-UNIS - Base de prénoms américains populaires
  US: americanNames,

  // ESPAGNE
  ES: {
    girls: {
      A: [
        { name: 'Alba', meaning: 'Aube', personality: 'Lumineuse et nouvelle, Alba annonce de beaux jours.' },
        { name: 'Alicia', meaning: 'Noble', personality: 'Noble et élégante, Alicia a de la classe.' },
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana est authentique.' },
        { name: 'Andrea', meaning: 'Courageuse', personality: 'Brave et forte, Andrea affronte tout.' },
        { name: 'Angela', meaning: 'Messagère', personality: 'Communicative et aimable, Angela transmet.' },
      ],
      B: [
        { name: 'Beatriz', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et positive, Beatriz répand le bonheur.' },
        { name: 'Blanca', meaning: 'Blanche', personality: 'Pure et innocente, Blanca est sincère.' },
      ],
      C: [
        { name: 'Carla', meaning: 'Femme libre', personality: 'Indépendante et forte, Carla vit librement.' },
        { name: 'Carmen', meaning: 'Jardin', personality: 'Naturelle et florissante, Carmen s\'épanouit.' },
        { name: 'Claudia', meaning: 'Boiteuse', personality: 'Persévérante malgré les obstacles, Claudia avance.' },
        { name: 'Cristina', meaning: 'Chrétienne', personality: 'Fidèle et dévouée, Cristina croit.' },
      ],
      D: [
        { name: 'Daniela', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniela juge bien.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
        { name: 'Eva', meaning: 'Vie', personality: 'Vivante et première, Eva est l\'origine.' },
      ],
      F: [
        { name: 'Fernanda', meaning: 'Aventurière courageuse', personality: 'Audacieuse et exploratrice, Fernanda découvre.' },
      ],
      G: [
        { name: 'Gabriela', meaning: 'Force de Dieu', personality: 'Puissante et gracieuse, Gabriela impressionne.' },
      ],
      H: [
        { name: 'Helena', meaning: 'Éclat', personality: 'Brillante et lumineuse, Helena rayonne.' },
      ],
      I: [
        { name: 'Inés', meaning: 'Pure', personality: 'Pure et innocente, Inés est sincère.' },
        { name: 'Isabel', meaning: 'Dieu est serment', personality: 'Royale et fidèle, Isabel tient parole.' },
        { name: 'Irene', meaning: 'Paix', personality: 'Pacifique et calme, Irene apaise.' },
      ],
      J: [
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
      ],
      K: [
        { name: 'Karen', meaning: 'Pure', personality: 'Simple et vraie, Karen est authentique.' },
      ],
      L: [
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe.' },
        { name: 'Lucia', meaning: 'Lumière', personality: 'Lumineuse et claire, Lucia guide.' },
        { name: 'Luna', meaning: 'Lune', personality: 'Mystérieuse et douce, Luna brille la nuit.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Aimée universellement, Maria est précieuse.' },
        { name: 'Marta', meaning: 'Dame', personality: 'Noble et distinguée, Marta commande le respect.' },
        { name: 'Marina', meaning: 'De la mer', personality: 'Profonde et mystérieuse, Marina attire.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natalia apporte le renouveau.' },
        { name: 'Nuria', meaning: 'Lumière', personality: 'Brillante et guidante, Nuria éclaire.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      P: [
        { name: 'Paula', meaning: 'Petite', personality: 'Humble et modeste, Paula reste simple.' },
        { name: 'Patricia', meaning: 'Noble', personality: 'Distinguée et fière, Patricia a de la prestance.' },
      ],
      Q: [
        { name: 'Queralt', meaning: 'Rocher', personality: 'Solide et stable, Queralt est un roc.' },
      ],
      R: [
        { name: 'Raquel', meaning: 'Brebis', personality: 'Douce et aimable, Raquel suit son cœur.' },
        { name: 'Rosa', meaning: 'Rose', personality: 'Belle et parfumée, Rosa embellit.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      T: [
        { name: 'Teresa', meaning: 'Chasseresse', personality: 'Déterminée et vive, Teresa atteint ses buts.' },
      ],
      U: [
        { name: 'Uxia', meaning: 'Bien née', personality: 'Noble et fortunée, Uxia est bénie.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Veronica', meaning: 'Vraie image', personality: 'Authentique et sincère, Veronica est vraie.' },
      ],
      W: [
        { name: 'Wendy', meaning: 'Amie', personality: 'Amicale et loyale, Wendy est une vraie amie.' },
      ],
      X: [
        { name: 'Ximena', meaning: 'Celle qui écoute', personality: 'Attentive et sage, Ximena entend.' },
      ],
      Y: [
        { name: 'Yolanda', meaning: 'Violette', personality: 'Discrète et belle, Yolanda charme en silence.' },
      ],
      Z: [
        { name: 'Zaira', meaning: 'Florissante', personality: 'Épanouie et radieuse, Zaira s\'épanouit.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alejandro', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alejandro défend.' },
        { name: 'Alvaro', meaning: 'Gardien de tous', personality: 'Vigilant et protecteur, Alvaro veille.' },
        { name: 'Antonio', meaning: 'Inestimable', personality: 'Précieux et unique, Antonio est irremplaçable.' },
        { name: 'Adrian', meaning: 'Sombre', personality: 'Mystérieux et profond, Adrian intrigue.' },
      ],
      B: [
        { name: 'Bruno', meaning: 'Brun', personality: 'Solide et terre-à-terre, Bruno est ancré.' },
      ],
      C: [
        { name: 'Carlos', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlos suit sa voie.' },
        { name: 'Cristian', meaning: 'Chrétien', personality: 'Fidèle et dévoué, Cristian croit.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniel juge bien.' },
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire.' },
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      E: [
        { name: 'Eduardo', meaning: 'Gardien prospère', personality: 'Protecteur et prospère, Eduardo veille.' },
        { name: 'Enrique', meaning: 'Chef de maison', personality: 'Leader et responsable, Enrique dirige.' },
      ],
      F: [
        { name: 'Fernando', meaning: 'Aventurier courageux', personality: 'Audacieux et brave, Fernando explore.' },
        { name: 'Francisco', meaning: 'Français, libre', personality: 'Libre et honnête, Francisco dit vrai.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriel annonce.' },
        { name: 'Gonzalo', meaning: 'Génie au combat', personality: 'Stratège et fort, Gonzalo gagne.' },
      ],
      H: [
        { name: 'Hugo', meaning: 'Esprit', personality: 'Intelligent et vif, Hugo pense vite.' },
        { name: 'Hector', meaning: 'Défenseur', personality: 'Protecteur et brave, Hector défend.' },
      ],
      I: [
        { name: 'Ivan', meaning: 'Dieu est gracieux', personality: 'Béni et gracieux, Ivan rayonne.' },
        { name: 'Ignacio', meaning: 'Feu', personality: 'Ardent et passionné, Ignacio brûle.' },
      ],
      J: [
        { name: 'Javier', meaning: 'Nouvelle maison', personality: 'Bâtisseur et novateur, Javier construit.' },
        { name: 'Jorge', meaning: 'Agriculteur', personality: 'Travailleur et patient, Jorge cultive.' },
        { name: 'Jose', meaning: 'Il ajoutera', personality: 'Croissant et généreux, Jose multiplie.' },
        { name: 'Juan', meaning: 'Dieu est gracieux', personality: 'Béni et traditionnel, Juan est un pilier.' },
      ],
      K: [
        { name: 'Kevin', meaning: 'Beau', personality: 'Charmant et aimable, Kevin séduit.' },
      ],
      L: [
        { name: 'Luis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luis triomphe.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et clair, Lucas guide.' },
      ],
      M: [
        { name: 'Manuel', meaning: 'Dieu est avec nous', personality: 'Protégé et guidé, Manuel a la foi.' },
        { name: 'Mario', meaning: 'Mars, guerrier', personality: 'Combatif et fort, Mario se bat.' },
        { name: 'Marcos', meaning: 'Consacré à Mars', personality: 'Martial et courageux, Marcos affronte.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Divin et humble, Miguel cherche.' },
      ],
      N: [
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicolas rassemble.' },
      ],
      O: [
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Puissant et divin, Oscar impressionne.' },
      ],
      P: [
        { name: 'Pablo', meaning: 'Petit', personality: 'Humble et modeste, Pablo reste simple.' },
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et fiable, Pedro est un roc.' },
      ],
      Q: [
        { name: 'Quique', meaning: 'Chef de maison', personality: 'Leader et responsable, Quique dirige.' },
      ],
      R: [
        { name: 'Rafael', meaning: 'Dieu guérit', personality: 'Guérisseur et bienveillant, Rafael soigne.' },
        { name: 'Roberto', meaning: 'Gloire brillante', personality: 'Brillant et glorieux, Roberto rayonne.' },
        { name: 'Rodrigo', meaning: 'Gloire du souverain', personality: 'Royal et glorieux, Rodrigo règne.' },
      ],
      S: [
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Spirituel et pèlerin, Santiago cherche.' },
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
        { name: 'Sergio', meaning: 'Gardien', personality: 'Protecteur et vigilant, Sergio veille.' },
      ],
      T: [
        { name: 'Tomas', meaning: 'Jumeau', personality: 'Connecté et empathique, Tomas comprend.' },
      ],
      U: [
        { name: 'Ulises', meaning: 'Blessé', personality: 'Survivant et fort, Ulises persévère.' },
      ],
      V: [
        { name: 'Victor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Victor gagne.' },
        { name: 'Vicente', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vicente conquiert.' },
      ],
      W: [
        { name: 'Walter', meaning: 'Chef d\'armée', personality: 'Leader et stratège, Walter commande.' },
      ],
      X: [
        { name: 'Xavier', meaning: 'Nouvelle maison', personality: 'Bâtisseur et novateur, Xavier innove.' },
      ],
      Y: [
        { name: 'Yago', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Yago planifie.' },
      ],
      Z: [
        { name: 'Zacarias', meaning: 'Dieu se souvient', personality: 'Mémorable et fidèle, Zacarias est inoubliable.' },
      ],
    },
  },

  // ITALIE
  IT: {
    girls: {
      A: [
        { name: 'Alessia', meaning: 'Défenseur', personality: 'Protectrice et loyale, Alessia défend ceux qu\'elle aime.' },
        { name: 'Alice', meaning: 'Noble', personality: 'Élégante et distinguée, Alice a une grâce naturelle.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Simple et authentique, Anna rayonne de bonté.' },
        { name: 'Aurora', meaning: 'Aurore', personality: 'Lumineuse et optimiste, Aurora annonce de beaux jours.' },
        { name: 'Arianna', meaning: 'Très sainte', personality: 'Spirituelle et sage, Arianna guide les autres.' },
      ],
      B: [
        { name: 'Beatrice', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et positive, Beatrice répand le bonheur.' },
        { name: 'Bianca', meaning: 'Blanche', personality: 'Pure et innocente, Bianca est sincère et vraie.' },
      ],
      C: [
        { name: 'Camilla', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camilla se consacre aux autres.' },
        { name: 'Chiara', meaning: 'Claire, lumineuse', personality: 'Brillante et transparente, Chiara éclaire son entourage.' },
        { name: 'Carlotta', meaning: 'Femme libre', personality: 'Indépendante et forte, Carlotta vit selon ses principes.' },
      ],
      D: [
        { name: 'Diana', meaning: 'Divine', personality: 'Majestueuse et noble, Diana impressionne par sa prestance.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe les cœurs.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Elisa', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Elisa tient ses promesses.' },
      ],
      F: [
        { name: 'Federica', meaning: 'Paix du souverain', personality: 'Noble et paisible, Federica règne avec sagesse.' },
        { name: 'Francesca', meaning: 'Libre', personality: 'Indépendante et honnête, Francesca dit toujours la vérité.' },
        { name: 'Fiamma', meaning: 'Flamme', personality: 'Passionnée et ardente, Fiamma brûle de vie.' },
      ],
      G: [
        { name: 'Giada', meaning: 'Jade', personality: 'Précieuse et unique, Giada est un trésor rare.' },
        { name: 'Giulia', meaning: 'De la famille de Jules', personality: 'Noble et raffinée, Giulia a de la classe.' },
        { name: 'Gaia', meaning: 'Terre', personality: 'Connectée à la nature, Gaia est ancrée et stable.' },
        { name: 'Giorgia', meaning: 'Agricultrice', personality: 'Travailleuse et patiente, Giorgia cultive ses rêves.' },
      ],
      I: [
        { name: 'Ilaria', meaning: 'Joyeuse', personality: 'Gaie et souriante, Ilaria apporte la joie.' },
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
      ],
      L: [
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe toujours.' },
        { name: 'Lucia', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucia guide les autres.' },
        { name: 'Ludovica', meaning: 'Célèbre guerrière', personality: 'Combative et glorieuse, Ludovica ne renonce jamais.' },
      ],
      M: [
        { name: 'Martina', meaning: 'Guerrière de Mars', personality: 'Combative et courageuse, Martina affronte tout.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est un océan de tendresse.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille avec justesse.' },
        { name: 'Serena', meaning: 'Sereine', personality: 'Calme et paisible, Serena apporte la tranquillité.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime intensément.' },
        { name: 'Vittoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Vittoria triomphe toujours.' },
        { name: 'Viola', meaning: 'Violette', personality: 'Discrète et belle, Viola cache une beauté secrète.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alessandro', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alessandro défend les faibles.' },
        { name: 'Andrea', meaning: 'Viril, courageux', personality: 'Brave et fort, Andrea fait face à tout.' },
        { name: 'Antonio', meaning: 'Inestimable', personality: 'Précieux et unique, Antonio est irremplaçable.' },
      ],
      C: [
        { name: 'Carlo', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlo suit sa propre voie.' },
        { name: 'Christian', meaning: 'Chrétien', personality: 'Fidèle et dévoué, Christian croit en ses valeurs.' },
      ],
      D: [
        { name: 'Davide', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, Davide attire l\'affection.' },
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet son savoir.' },
      ],
      E: [
        { name: 'Edoardo', meaning: 'Gardien prospère', personality: 'Protecteur et prospère, Edoardo veille sur les siens.' },
        { name: 'Enrico', meaning: 'Chef de maison', personality: 'Leader et responsable, Enrico dirige avec sagesse.' },
      ],
      F: [
        { name: 'Federico', meaning: 'Paix du souverain', personality: 'Noble et paisible, Federico règne avec sagesse.' },
        { name: 'Francesco', meaning: 'Libre', personality: 'Honnête et direct, Francesco dit toujours la vérité.' },
        { name: 'Filippo', meaning: 'Ami des chevaux', personality: 'Libre et noble, Filippo aime la liberté.' },
      ],
      G: [
        { name: 'Gabriele', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriele annonce les bonnes nouvelles.' },
        { name: 'Giorgio', meaning: 'Agriculteur', personality: 'Travailleur et patient, Giorgio cultive ses rêves.' },
        { name: 'Giovanni', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Giovanni est un pilier.' },
        { name: 'Giuseppe', meaning: 'Il ajoutera', personality: 'Croissant et généreux, Giuseppe multiplie les bontés.' },
        { name: 'Giulio', meaning: 'De la famille de Jules', personality: 'Noble et distingué, Giulio a de la prestance.' },
      ],
      L: [
        { name: 'Leonardo', meaning: 'Fort comme un lion', personality: 'Courageux et créatif, Leonardo est un génie.' },
        { name: 'Lorenzo', meaning: 'Couronné de lauriers', personality: 'Victorieux et honoré, Lorenzo triomphe.' },
        { name: 'Luca', meaning: 'Lumière', personality: 'Lumineux et brillant, Luca éclaire son chemin.' },
        { name: 'Luigi', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luigi triomphe.' },
      ],
      M: [
        { name: 'Marco', meaning: 'Consacré à Mars', personality: 'Fort et martial, Marco est un guerrier.' },
        { name: 'Matteo', meaning: 'Don de Dieu', personality: 'Béni et généreux, Matteo partage ses dons.' },
        { name: 'Michele', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Michele cherche le divin.' },
      ],
      N: [
        { name: 'Nicola', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicola rassemble.' },
      ],
      P: [
        { name: 'Paolo', meaning: 'Petit', personality: 'Humble et modeste, Paolo reste simple.' },
        { name: 'Pietro', meaning: 'Pierre', personality: 'Solide et fiable, Pietro est un roc.' },
      ],
      R: [
        { name: 'Riccardo', meaning: 'Puissant et brave', personality: 'Fort et courageux, Riccardo affronte tout.' },
        { name: 'Roberto', meaning: 'Gloire brillante', personality: 'Brillant et glorieux, Roberto rayonne.' },
      ],
      S: [
        { name: 'Simone', meaning: 'Qui écoute', personality: 'Attentif et sage, Simone écoute avant de parler.' },
        { name: 'Stefano', meaning: 'Couronné', personality: 'Victorieux et accompli, Stefano réussit.' },
      ],
      T: [
        { name: 'Tommaso', meaning: 'Jumeau', personality: 'Empathique et connecté, Tommaso comprend les autres.' },
      ],
      V: [
        { name: 'Vincenzo', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vincenzo conquiert.' },
      ],
    },
  },

  // ALLEMAGNE
  DE: {
    girls: {
      A: [
        { name: 'Anna', meaning: 'Grâce', personality: 'Simple et authentique, Anna rayonne de bonté.' },
        { name: 'Amelie', meaning: 'Travailleuse', personality: 'Déterminée et énergique, Amelie atteint ses objectifs.' },
        { name: 'Annika', meaning: 'Grâce', personality: 'Gracieuse et douce, Annika apaise son entourage.' },
      ],
      B: [
        { name: 'Birgit', meaning: 'Force', personality: 'Forte et protectrice, Birgit veille sur les siens.' },
      ],
      C: [
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Indépendante et forte, Charlotte vit selon ses principes.' },
        { name: 'Clara', meaning: 'Claire', personality: 'Lumineuse et brillante, Clara éclaire son entourage.' },
      ],
      E: [
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Emilia', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emilia vise l\'excellence.' },
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe les cœurs.' },
      ],
      F: [
        { name: 'Frieda', meaning: 'Paix', personality: 'Paisible et sereine, Frieda apporte la tranquillité.' },
      ],
      G: [
        { name: 'Greta', meaning: 'Perle', personality: 'Précieuse et rare, Greta est un trésor.' },
      ],
      H: [
        { name: 'Hannah', meaning: 'Grâce', personality: 'Gracieuse et douce, Hannah apaise.' },
        { name: 'Heidi', meaning: 'Noble', personality: 'Noble et simple, Heidi reste authentique.' },
      ],
      I: [
        { name: 'Ida', meaning: 'Travailleuse', personality: 'Laborieuse et déterminée, Ida atteint ses buts.' },
      ],
      J: [
        { name: 'Jana', meaning: 'Dieu fait grâce', personality: 'Bénie et reconnaissante, Jana apprécie la vie.' },
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
      ],
      K: [
        { name: 'Katharina', meaning: 'Pure', personality: 'Pure et noble, Katharina a de la classe.' },
        { name: 'Klara', meaning: 'Claire', personality: 'Lumineuse et intelligente, Klara éclaire.' },
      ],
      L: [
        { name: 'Lena', meaning: 'Lumière', personality: 'Brillante et chaleureuse, Lena illumine.' },
        { name: 'Leonie', meaning: 'Lionne', personality: 'Majestueuse et fière, Leonie en impose.' },
        { name: 'Lisa', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Lisa tient parole.' },
        { name: 'Lina', meaning: 'Douce', personality: 'Tendre et affectueuse, Lina câline.' },
      ],
      M: [
        { name: 'Marie', meaning: 'Aimée', personality: 'Douce et aimante, Marie est un océan de tendresse.' },
        { name: 'Maja', meaning: 'Grande', personality: 'Grande par le cœur, Maja est généreuse.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      N: [
        { name: 'Nele', meaning: 'Lumière', personality: 'Brillante et douce, Nele éclaire avec douceur.' },
      ],
      S: [
        { name: 'Sarah', meaning: 'Princesse', personality: 'Royale et élégante, Sarah règne avec grâce.' },
        { name: 'Sophie', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophie conseille avec justesse.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend les faibles.' },
        { name: 'Anton', meaning: 'Inestimable', personality: 'Précieux et unique, Anton est irremplaçable.' },
      ],
      B: [
        { name: 'Ben', meaning: 'Fils', personality: 'Aimé et chéri, Ben est un fils béni.' },
      ],
      C: [
        { name: 'Christian', meaning: 'Chrétien', personality: 'Fidèle et dévoué, Christian croit en ses valeurs.' },
      ],
      D: [
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire l\'affection.' },
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et intègre, Daniel juge avec sagesse.' },
      ],
      E: [
        { name: 'Elias', meaning: 'Mon Dieu est Yahweh', personality: 'Spirituel et puissant, Elias inspire.' },
        { name: 'Emil', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emil vise la première place.' },
      ],
      F: [
        { name: 'Felix', meaning: 'Heureux', personality: 'Joyeux et chanceux, Felix attire le bonheur.' },
        { name: 'Finn', meaning: 'Blanc, juste', personality: 'Pur et juste, Finn agit avec droiture.' },
        { name: 'Friedrich', meaning: 'Paix du souverain', personality: 'Noble et paisible, Friedrich règne avec sagesse.' },
      ],
      H: [
        { name: 'Hans', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Hans est un pilier.' },
        { name: 'Heinrich', meaning: 'Chef de maison', personality: 'Leader et responsable, Heinrich dirige.' },
      ],
      J: [
        { name: 'Jonas', meaning: 'Colombe', personality: 'Pacifique et doux, Jonas apporte la paix.' },
        { name: 'Julian', meaning: 'Jeune', personality: 'Éternel jeune, Julian garde sa fraîcheur.' },
        { name: 'Jakob', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jakob planifie.' },
      ],
      K: [
        { name: 'Karl', meaning: 'Homme libre', personality: 'Libre et indépendant, Karl suit sa propre voie.' },
        { name: 'Konrad', meaning: 'Conseiller audacieux', personality: 'Sage et courageux, Konrad conseille.' },
      ],
      L: [
        { name: 'Leon', meaning: 'Lion', personality: 'Courageux et royal, Leon règne.' },
        { name: 'Lukas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lukas éclaire.' },
        { name: 'Luis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luis triomphe.' },
      ],
      M: [
        { name: 'Maximilian', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Maximilian vise haut.' },
        { name: 'Moritz', meaning: 'Sombre', personality: 'Mystérieux et profond, Moritz intrigue.' },
      ],
      N: [
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme les tempêtes.' },
        { name: 'Niklas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Niklas rassemble.' },
      ],
      P: [
        { name: 'Paul', meaning: 'Petit', personality: 'Humble et modeste, Paul reste simple.' },
        { name: 'Philipp', meaning: 'Ami des chevaux', personality: 'Libre et noble, Philipp aime la liberté.' },
      ],
      S: [
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire le respect.' },
        { name: 'Stefan', meaning: 'Couronné', personality: 'Victorieux et accompli, Stefan réussit.' },
      ],
      T: [
        { name: 'Tim', meaning: 'Qui honore Dieu', personality: 'Spirituel et dévoué, Tim honore ses engagements.' },
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Thomas comprend.' },
      ],
      W: [
        { name: 'Wilhelm', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, Wilhelm défend.' },
        { name: 'Wolfgang', meaning: 'Loup qui marche', personality: 'Libre et sauvage, Wolfgang suit son instinct.' },
      ],
    },
  },

  // ROYAUME-UNI
  GB: {
    girls: {
      A: [
        { name: 'Amelia', meaning: 'Travailleuse', personality: 'Déterminée et ambitieuse, Amelia atteint ses objectifs.' },
        { name: 'Ava', meaning: 'Vie', personality: 'Vivante et énergique, Ava célèbre l\'existence.' },
        { name: 'Alice', meaning: 'Noble', personality: 'Curieuse et imaginative, Alice explore de nouveaux mondes.' },
      ],
      B: [
        { name: 'Bella', meaning: 'Belle', personality: 'Belle et gracieuse, Bella charme tout le monde.' },
        { name: 'Beatrice', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et positive, Beatrice répand le bonheur.' },
      ],
      C: [
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Classique et élégante, Charlotte a du style.' },
        { name: 'Chloe', meaning: 'Jeune pousse', personality: 'Fraîche et naturelle, Chloe respire la vie.' },
      ],
      D: [
        { name: 'Daisy', meaning: 'Marguerite', personality: 'Joyeuse et simple, Daisy embellit le quotidien.' },
      ],
      E: [
        { name: 'Eleanor', meaning: 'Lumière brillante', personality: 'Brillante et inspirante, Eleanor guide.' },
        { name: 'Emily', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emily vise l\'excellence.' },
        { name: 'Evie', meaning: 'Vie', personality: 'Vivante et pétillante, Evie illumine.' },
        { name: 'Ella', meaning: 'Belle fée', personality: 'Magique et charmante, Ella enchante.' },
      ],
      F: [
        { name: 'Florence', meaning: 'Florissante', personality: 'Épanouie et radieuse, Florence s\'épanouit.' },
        { name: 'Freya', meaning: 'Noble dame', personality: 'Noble et belle, Freya inspire le respect.' },
      ],
      G: [
        { name: 'Grace', meaning: 'Grâce', personality: 'Gracieuse et élégante, Grace danse dans la vie.' },
        { name: 'Georgia', meaning: 'Agricultrice', personality: 'Terre-à-terre et fiable, Georgia est ancrée.' },
      ],
      H: [
        { name: 'Harper', meaning: 'Joueur de harpe', personality: 'Musicale et artistique, Harper crée de la beauté.' },
        { name: 'Holly', meaning: 'Houx', personality: 'Festive et joyeuse, Holly célèbre la vie.' },
      ],
      I: [
        { name: 'Isla', meaning: 'Île', personality: 'Unique et paisible, Isla est un havre de paix.' },
        { name: 'Ivy', meaning: 'Lierre', personality: 'Persistante et fidèle, Ivy s\'accroche.' },
        { name: 'Imogen', meaning: 'Fille bien-aimée', personality: 'Aimée et précieuse, Imogen est chérie.' },
      ],
      J: [
        { name: 'Jessica', meaning: 'Dieu regarde', personality: 'Observée et protégée, Jessica est guidée.' },
      ],
      K: [
        { name: 'Kate', meaning: 'Pure', personality: 'Pure et noble, Kate a de la classe.' },
      ],
      L: [
        { name: 'Lily', meaning: 'Lys', personality: 'Pure et belle, Lily est une fleur précieuse.' },
        { name: 'Lucy', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucy éclaire.' },
      ],
      M: [
        { name: 'Maisie', meaning: 'Perle', personality: 'Précieuse et unique, Maisie est un trésor.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
        { name: 'Molly', meaning: 'Aimée', personality: 'Aimée et douce, Molly est un amour.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      P: [
        { name: 'Poppy', meaning: 'Pavot', personality: 'Colorée et joyeuse, Poppy égaye la vie.' },
        { name: 'Phoebe', meaning: 'Brillante', personality: 'Lumineuse et intelligente, Phoebe brille.' },
      ],
      R: [
        { name: 'Rose', meaning: 'Rose', personality: 'Belle et parfumée, Rose embellit la vie.' },
        { name: 'Ruby', meaning: 'Rubis', personality: 'Précieuse et passionnée, Ruby brûle d\'intensité.' },
      ],
      S: [
        { name: 'Sophia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophia conseille.' },
        { name: 'Scarlett', meaning: 'Rouge écarlate', personality: 'Passionnée et intense, Scarlett vit pleinement.' },
        { name: 'Sienna', meaning: 'Orange-rouge', personality: 'Chaleureuse et vibrante, Sienna rayonne.' },
      ],
      V: [
        { name: 'Victoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Victoria triomphe.' },
      ],
      W: [
        { name: 'Willow', meaning: 'Saule', personality: 'Flexible et gracieuse, Willow s\'adapte.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alfie', meaning: 'Conseil des elfes', personality: 'Sage et mystérieux, Alfie guide.' },
        { name: 'Archie', meaning: 'Véritable', personality: 'Authentique et sincère, Archie est vrai.' },
        { name: 'Arthur', meaning: 'Ours noble', personality: 'Fort et noble, Arthur est un leader.' },
      ],
      B: [
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Favorisé et talentueux, Benjamin excelle.' },
      ],
      C: [
        { name: 'Charlie', meaning: 'Homme libre', personality: 'Libre et joyeux, Charlie vit pleinement.' },
        { name: 'Connor', meaning: 'Amoureux des loups', personality: 'Sauvage et loyal, Connor protège sa meute.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et intègre, Daniel juge avec sagesse.' },
      ],
      E: [
        { name: 'Edward', meaning: 'Gardien des richesses', personality: 'Prudent et responsable, Edward gère avec sagesse.' },
        { name: 'Ethan', meaning: 'Fort, ferme', personality: 'Solide et fiable, Ethan ne vacille pas.' },
      ],
      F: [
        { name: 'Freddie', meaning: 'Paix du souverain', personality: 'Paisible et noble, Freddie règne avec douceur.' },
        { name: 'Finley', meaning: 'Héros blond', personality: 'Héroïque et lumineux, Finley brille.' },
      ],
      G: [
        { name: 'George', meaning: 'Agriculteur', personality: 'Travailleur et patient, George cultive.' },
      ],
      H: [
        { name: 'Harry', meaning: 'Chef de maison', personality: 'Leader et responsable, Harry dirige.' },
        { name: 'Henry', meaning: 'Maître de maison', personality: 'Chef et responsable, Henry commande.' },
        { name: 'Hugo', meaning: 'Esprit', personality: 'Brillant et créatif, Hugo a des idées géniales.' },
      ],
      J: [
        { name: 'Jack', meaning: 'Dieu est gracieux', personality: 'Classique et fiable, Jack est un pilier.' },
        { name: 'Jacob', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jacob planifie.' },
        { name: 'James', meaning: 'Supplanteur', personality: 'Noble et classique, James a de la prestance.' },
        { name: 'Joshua', meaning: 'Dieu est salut', personality: 'Sauveur et leader, Joshua guide.' },
      ],
      L: [
        { name: 'Leo', meaning: 'Lion', personality: 'Courageux et royal, Leo règne.' },
        { name: 'Lewis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Lewis triomphe.' },
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
      ],
      M: [
        { name: 'Mason', meaning: 'Tailleur de pierre', personality: 'Constructeur et solide, Mason bâtit.' },
        { name: 'Max', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Max vise haut.' },
      ],
      N: [
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Paisible et sage, Oliver apporte la paix.' },
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Puissant et divin, Oscar impressionne.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
      T: [
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Thomas comprend.' },
        { name: 'Theo', meaning: 'Dieu', personality: 'Divin et inspiré, Theo a la foi.' },
      ],
      W: [
        { name: 'William', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, William défend.' },
      ],
    },
  },

  // PORTUGAL
  PT: {
    girls: {
      A: [
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana est authentique.' },
        { name: 'Alice', meaning: 'Noble', personality: 'Curieuse et imaginative, Alice explore.' },
        { name: 'Aurora', meaning: 'Aurore', personality: 'Lumineuse et nouvelle, Aurora annonce de beaux jours.' },
      ],
      B: [
        { name: 'Beatriz', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et positive, Beatriz répand le bonheur.' },
        { name: 'Bianca', meaning: 'Blanche', personality: 'Pure et innocente, Bianca est sincère.' },
      ],
      C: [
        { name: 'Carolina', meaning: 'Femme libre', personality: 'Indépendante et forte, Carolina vit librement.' },
        { name: 'Catarina', meaning: 'Pure', personality: 'Pure et noble, Catarina a de la classe.' },
        { name: 'Clara', meaning: 'Claire', personality: 'Lumineuse et brillante, Clara éclaire.' },
      ],
      D: [
        { name: 'Diana', meaning: 'Divine', personality: 'Majestueuse et noble, Diana impressionne.' },
      ],
      E: [
        { name: 'Eva', meaning: 'Vie', personality: 'Vivante et première, Eva est l\'origine.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
      ],
      I: [
        { name: 'Inês', meaning: 'Pure', personality: 'Pure et innocente, Inês est sincère.' },
        { name: 'Iris', meaning: 'Arc-en-ciel', personality: 'Colorée et joyeuse, Iris apporte de la couleur.' },
      ],
      L: [
        { name: 'Leonor', meaning: 'Lumière', personality: 'Brillante et noble, Leonor éclaire avec grâce.' },
        { name: 'Lara', meaning: 'Protection', personality: 'Protectrice et forte, Lara veille.' },
        { name: 'Luísa', meaning: 'Guerrière glorieuse', personality: 'Combative et victorieuse, Luísa triomphe.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est un océan de tendresse.' },
        { name: 'Mariana', meaning: 'De la mer', personality: 'Profonde et mystérieuse, Mariana fascine.' },
        { name: 'Madalena', meaning: 'De Magdala', personality: 'Dévouée et fidèle, Madalena suit son cœur.' },
        { name: 'Matilde', meaning: 'Puissante au combat', personality: 'Forte et déterminée, Matilde est une guerrière.' },
      ],
      R: [
        { name: 'Rita', meaning: 'Perle', personality: 'Précieuse et rare, Rita est un trésor.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille avec justesse.' },
      ],
    },
    boys: {
      A: [
        { name: 'Afonso', meaning: 'Noble et prêt', personality: 'Noble et préparé, Afonso est toujours prêt.' },
        { name: 'Alexandre', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexandre défend.' },
        { name: 'António', meaning: 'Inestimable', personality: 'Précieux et unique, António est irremplaçable.' },
      ],
      B: [
        { name: 'Bernardo', meaning: 'Fort comme un ours', personality: 'Fort et courageux, Bernardo protège.' },
      ],
      D: [
        { name: 'Diogo', meaning: 'Enseignant', personality: 'Sage et patient, Diogo transmet son savoir.' },
        { name: 'Duarte', meaning: 'Gardien des richesses', personality: 'Prudent et responsable, Duarte gère.' },
      ],
      F: [
        { name: 'Francisco', meaning: 'Libre', personality: 'Honnête et direct, Francisco dit la vérité.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriel annonce.' },
        { name: 'Gonçalo', meaning: 'Génie au combat', personality: 'Stratège et fort, Gonçalo gagne.' },
        { name: 'Guilherme', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, Guilherme défend.' },
      ],
      H: [
        { name: 'Henrique', meaning: 'Chef de maison', personality: 'Leader et responsable, Henrique dirige.' },
      ],
      J: [
        { name: 'João', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, João est un pilier.' },
        { name: 'José', meaning: 'Il ajoutera', personality: 'Croissant et généreux, José multiplie.' },
      ],
      L: [
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Lourenço', meaning: 'Couronné de lauriers', personality: 'Victorieux et honoré, Lourenço triomphe.' },
      ],
      M: [
        { name: 'Manuel', meaning: 'Dieu est avec nous', personality: 'Protégé et guidé, Manuel a la foi.' },
        { name: 'Martim', meaning: 'Guerrier de Mars', personality: 'Combatif et courageux, Martim affronte.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Miguel cherche.' },
        { name: 'Mateus', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mateus partage.' },
      ],
      P: [
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et fiable, Pedro est un roc.' },
      ],
      R: [
        { name: 'Rafael', meaning: 'Dieu guérit', personality: 'Guérisseur et bienveillant, Rafael soigne.' },
        { name: 'Rodrigo', meaning: 'Gloire du souverain', personality: 'Royal et glorieux, Rodrigo règne.' },
        { name: 'Rui', meaning: 'Célèbre', personality: 'Connu et admiré, Rui laisse sa marque.' },
      ],
      S: [
        { name: 'Salvador', meaning: 'Sauveur', personality: 'Protecteur et sauveur, Salvador aide.' },
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Spirituel et pèlerin, Santiago cherche.' },
        { name: 'Simão', meaning: 'Qui écoute', personality: 'Attentif et sage, Simão écoute.' },
      ],
      T: [
        { name: 'Tiago', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Tiago planifie.' },
        { name: 'Tomás', meaning: 'Jumeau', personality: 'Empathique et connecté, Tomás comprend.' },
      ],
      V: [
        { name: 'Vicente', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vicente conquiert.' },
      ],
    },
  },

  // BRÉSIL
  BR: {
    girls: {
      A: [
        { name: 'Alice', meaning: 'Noble', personality: 'Curieuse et imaginative, Alice explore.' },
        { name: 'Amanda', meaning: 'Digne d\'amour', personality: 'Aimable et douce, Amanda mérite l\'amour.' },
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana est authentique.' },
        { name: 'Beatriz', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et positive, Beatriz répand le bonheur.' },
      ],
      B: [
        { name: 'Bianca', meaning: 'Blanche', personality: 'Pure et innocente, Bianca est sincère.' },
        { name: 'Bruna', meaning: 'Brune', personality: 'Naturelle et terre-à-terre, Bruna est ancrée.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camila se consacre.' },
        { name: 'Carolina', meaning: 'Femme libre', personality: 'Indépendante et forte, Carolina vit librement.' },
        { name: 'Clara', meaning: 'Claire', personality: 'Lumineuse et brillante, Clara éclaire.' },
      ],
      D: [
        { name: 'Daniela', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniela juge bien.' },
      ],
      E: [
        { name: 'Eduarda', meaning: 'Gardienne prospère', personality: 'Protectrice et prospère, Eduarda veille.' },
        { name: 'Emanuelle', meaning: 'Dieu est avec nous', personality: 'Protégée et guidée, Emanuelle a la foi.' },
      ],
      F: [
        { name: 'Fernanda', meaning: 'Aventurière courageuse', personality: 'Audacieuse et exploratrice, Fernanda découvre.' },
      ],
      G: [
        { name: 'Gabriela', meaning: 'Force de Dieu', personality: 'Puissante et gracieuse, Gabriela impressionne.' },
        { name: 'Giovanna', meaning: 'Dieu fait grâce', personality: 'Bénie et gracieuse, Giovanna rayonne.' },
      ],
      H: [
        { name: 'Helena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Helena réchauffe.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
        { name: 'Isadora', meaning: 'Don d\'Isis', personality: 'Mystérieuse et divine, Isadora fascine.' },
      ],
      J: [
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
        { name: 'Juliana', meaning: 'Jeune', personality: 'Éternellement jeune, Juliana garde sa fraîcheur.' },
      ],
      L: [
        { name: 'Lara', meaning: 'Protection', personality: 'Protectrice et forte, Lara veille.' },
        { name: 'Larissa', meaning: 'Joyeuse', personality: 'Gaie et souriante, Larissa apporte la joie.' },
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe.' },
        { name: 'Letícia', meaning: 'Joie', personality: 'Joyeuse et lumineuse, Letícia illumine.' },
        { name: 'Luísa', meaning: 'Guerrière glorieuse', personality: 'Combative et victorieuse, Luísa triomphe.' },
      ],
      M: [
        { name: 'Manuela', meaning: 'Dieu est avec nous', personality: 'Protégée et guidée, Manuela a la foi.' },
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
        { name: 'Mariana', meaning: 'De la mer', personality: 'Profonde et mystérieuse, Mariana fascine.' },
      ],
      N: [
        { name: 'Natália', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natália apporte le renouveau.' },
      ],
      R: [
        { name: 'Rafaela', meaning: 'Dieu guérit', personality: 'Guérisseuse et bienveillante, Rafaela soigne.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
        { name: 'Sophia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophia est une conseillère.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Vitória', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Vitória triomphe.' },
      ],
    },
    boys: {
      A: [
        { name: 'Arthur', meaning: 'Ours noble', personality: 'Fort et noble, Arthur est un leader.' },
        { name: 'André', meaning: 'Viril, courageux', personality: 'Brave et fort, André fait face.' },
        { name: 'Antonio', meaning: 'Inestimable', personality: 'Précieux et unique, Antonio est irremplaçable.' },
      ],
      B: [
        { name: 'Bernardo', meaning: 'Fort comme un ours', personality: 'Fort et courageux, Bernardo protège.' },
        { name: 'Bruno', meaning: 'Brun', personality: 'Solide et terre-à-terre, Bruno est ancré.' },
      ],
      C: [
        { name: 'Caio', meaning: 'Joyeux', personality: 'Joyeux et enthousiaste, Caio célèbre la vie.' },
        { name: 'Carlos', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlos suit sa voie.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniel juge bien.' },
        { name: 'Davi', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, Davi attire.' },
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      E: [
        { name: 'Eduardo', meaning: 'Gardien prospère', personality: 'Protecteur et prospère, Eduardo veille.' },
        { name: 'Enzo', meaning: 'Maître de maison', personality: 'Leader et responsable, Enzo dirige.' },
      ],
      F: [
        { name: 'Felipe', meaning: 'Ami des chevaux', personality: 'Libre et noble, Felipe aime la liberté.' },
        { name: 'Fernando', meaning: 'Aventurier courageux', personality: 'Audacieux et brave, Fernando explore.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriel annonce.' },
        { name: 'Gustavo', meaning: 'Bâton des Goths', personality: 'Fort et protecteur, Gustavo soutient.' },
        { name: 'Guilherme', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, Guilherme défend.' },
      ],
      H: [
        { name: 'Heitor', meaning: 'Défenseur', personality: 'Protecteur et brave, Heitor défend.' },
        { name: 'Henrique', meaning: 'Chef de maison', personality: 'Leader et responsable, Henrique dirige.' },
      ],
      J: [
        { name: 'João', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, João est un pilier.' },
        { name: 'José', meaning: 'Il ajoutera', personality: 'Croissant et généreux, José multiplie.' },
      ],
      L: [
        { name: 'Leonardo', meaning: 'Fort comme un lion', personality: 'Courageux et créatif, Leonardo est un génie.' },
        { name: 'Lorenzo', meaning: 'Couronné de lauriers', personality: 'Victorieux et honoré, Lorenzo triomphe.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Luiz', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luiz triomphe.' },
      ],
      M: [
        { name: 'Matheus', meaning: 'Don de Dieu', personality: 'Béni et généreux, Matheus partage.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Miguel cherche.' },
        { name: 'Murilo', meaning: 'Petit mur', personality: 'Protecteur et solide, Murilo défend.' },
      ],
      N: [
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicolas rassemble.' },
      ],
      P: [
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et fiable, Pedro est un roc.' },
        { name: 'Paulo', meaning: 'Petit', personality: 'Humble et modeste, Paulo reste simple.' },
      ],
      R: [
        { name: 'Rafael', meaning: 'Dieu guérit', personality: 'Guérisseur et bienveillant, Rafael soigne.' },
        { name: 'Rodrigo', meaning: 'Gloire du souverain', personality: 'Royal et glorieux, Rodrigo règne.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
      ],
      T: [
        { name: 'Thiago', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Thiago planifie.' },
        { name: 'Theo', meaning: 'Dieu', personality: 'Divin et inspiré, Theo a la foi.' },
      ],
      V: [
        { name: 'Vinícius', meaning: 'Vin', personality: 'Festif et joyeux, Vinícius célèbre la vie.' },
        { name: 'Victor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Victor gagne.' },
      ],
    },
  },

  // BELGIQUE
  BE: {
    girls: {
      A: [
        { name: 'Amélie', meaning: 'Travailleuse', personality: 'Déterminée et énergique, Amélie atteint ses objectifs.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna rayonne de bonté.' },
        { name: 'Axelle', meaning: 'Père de la paix', personality: 'Dynamique et sportive, Axelle est une battante.' },
      ],
      B: [
        { name: 'Bieke', meaning: 'Abeille', personality: 'Travailleuse et sociale, Bieke est toujours active.' },
      ],
      C: [
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Indépendante et forte, Charlotte vit selon ses principes.' },
        { name: 'Chloé', meaning: 'Jeune pousse', personality: 'Fraîche et naturelle, Chloé respire la joie.' },
        { name: 'Clara', meaning: 'Claire', personality: 'Lumineuse et brillante, Clara éclaire.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe les cœurs.' },
        { name: 'Elise', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Elise tient parole.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
      ],
      L: [
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe.' },
        { name: 'Léa', meaning: 'Lionne', personality: 'Forte et courageuse, Léa protège les siens.' },
        { name: 'Lotte', meaning: 'Femme libre', personality: 'Libre et joyeuse, Lotte vit pleinement.' },
        { name: 'Louise', meaning: 'Glorieuse combattante', personality: 'Combative et déterminée, Louise ne renonce jamais.' },
      ],
      M: [
        { name: 'Manon', meaning: 'Celle qui élève', personality: 'Maternelle et protectrice, Manon prend soin.' },
        { name: 'Marie', meaning: 'Aimée', personality: 'Douce et aimante, Marie est tendresse.' },
      ],
      S: [
        { name: 'Sarah', meaning: 'Princesse', personality: 'Royale et élégante, Sarah règne avec grâce.' },
        { name: 'Sophie', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophie conseille.' },
      ],
    },
    boys: {
      A: [
        { name: 'Arthur', meaning: 'Ours noble', personality: 'Fort et noble, Arthur est un leader.' },
        { name: 'Axel', meaning: 'Père de la paix', personality: 'Pacifique et diplomate, Axel résout les conflits.' },
      ],
      B: [
        { name: 'Baptiste', meaning: 'Celui qui baptise', personality: 'Spirituel et bienveillant, Baptiste guide.' },
      ],
      E: [
        { name: 'Emile', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emile vise l\'excellence.' },
      ],
      J: [
        { name: 'Julien', meaning: 'De la famille de Jules', personality: 'Raffiné et élégant, Julien a du style.' },
      ],
      L: [
        { name: 'Louis', meaning: 'Glorieux combattant', personality: 'Victorieux et noble, Louis triomphe.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
      ],
      M: [
        { name: 'Mathis', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mathis partage.' },
        { name: 'Maxime', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Maxime vise haut.' },
      ],
      N: [
        { name: 'Nathan', meaning: 'Donné par Dieu', personality: 'Béni et précieux, Nathan est un cadeau.' },
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      T: [
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Thomas comprend.' },
      ],
      V: [
        { name: 'Victor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Victor gagne.' },
      ],
    },
  },

  // SUISSE
  CH: {
    girls: {
      A: [
        { name: 'Aline', meaning: 'Noble', personality: 'Noble et gracieuse, Aline a de la classe.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna rayonne.' },
      ],
      C: [
        { name: 'Chiara', meaning: 'Claire', personality: 'Lumineuse et brillante, Chiara éclaire.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Emilia', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emilia excelle.' },
      ],
      L: [
        { name: 'Lara', meaning: 'Protection', personality: 'Protectrice et forte, Lara veille.' },
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe.' },
        { name: 'Lea', meaning: 'Lionne', personality: 'Forte et courageuse, Lea protège.' },
        { name: 'Lena', meaning: 'Lumière', personality: 'Brillante et chaleureuse, Lena illumine.' },
      ],
      M: [
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      N: [
        { name: 'Nina', meaning: 'Grâce', personality: 'Gracieuse et élégante, Nina danse dans la vie.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
      ],
      D: [
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire.' },
      ],
      E: [
        { name: 'Elias', meaning: 'Mon Dieu est Yahweh', personality: 'Spirituel et puissant, Elias inspire.' },
      ],
      F: [
        { name: 'Finn', meaning: 'Blanc, juste', personality: 'Pur et juste, Finn agit avec droiture.' },
      ],
      J: [
        { name: 'Jan', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Jan est un pilier.' },
        { name: 'Jonas', meaning: 'Colombe', personality: 'Pacifique et doux, Jonas apporte la paix.' },
        { name: 'Julian', meaning: 'Jeune', personality: 'Éternel jeune, Julian garde sa fraîcheur.' },
      ],
      L: [
        { name: 'Leon', meaning: 'Lion', personality: 'Courageux et royal, Leon règne.' },
        { name: 'Luca', meaning: 'Lumière', personality: 'Lumineux et brillant, Luca éclaire.' },
        { name: 'Luis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luis triomphe.' },
      ],
      M: [
        { name: 'Matteo', meaning: 'Don de Dieu', personality: 'Béni et généreux, Matteo partage.' },
      ],
      N: [
        { name: 'Nico', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nico rassemble.' },
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
      ],
      T: [
        { name: 'Tim', meaning: 'Qui honore Dieu', personality: 'Spirituel et dévoué, Tim honore.' },
      ],
    },
  },

  // PAYS-BAS
  NL: {
    girls: {
      A: [
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna rayonne de bonté.' },
        { name: 'Amber', meaning: 'Ambre', personality: 'Chaleureuse et précieuse, Amber brille.' },
      ],
      B: [
        { name: 'Britt', meaning: 'Exaltée', personality: 'Enthousiaste et joyeuse, Britt célèbre la vie.' },
      ],
      D: [
        { name: 'Danique', meaning: 'Étoile du matin', personality: 'Lumineuse et nouvelle, Danique annonce le jour.' },
      ],
      E: [
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Eva', meaning: 'Vie', personality: 'Vivante et première, Eva est l\'origine.' },
      ],
      F: [
        { name: 'Femke', meaning: 'Petite fille', personality: 'Douce et mignonne, Femke charme.' },
        { name: 'Fleur', meaning: 'Fleur', personality: 'Délicate et belle, Fleur embellit.' },
      ],
      I: [
        { name: 'Iris', meaning: 'Arc-en-ciel', personality: 'Colorée et joyeuse, Iris apporte de la couleur.' },
      ],
      J: [
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
      ],
      L: [
        { name: 'Lieke', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Lieke tient parole.' },
        { name: 'Lisa', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Lisa tient ses promesses.' },
        { name: 'Lotte', meaning: 'Femme libre', personality: 'Libre et joyeuse, Lotte vit pleinement.' },
      ],
      M: [
        { name: 'Mila', meaning: 'Gracieuse', personality: 'Gracieuse et douce, Mila enchante.' },
      ],
      N: [
        { name: 'Noa', meaning: 'Repos', personality: 'Apaisante et sage, Noa calme.' },
      ],
      S: [
        { name: 'Sanne', meaning: 'Lys', personality: 'Pure et belle, Sanne est une fleur précieuse.' },
        { name: 'Sophie', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophie conseille.' },
      ],
      T: [
        { name: 'Tessa', meaning: 'Moissonneuse', personality: 'Travailleuse et productive, Tessa récolte.' },
      ],
    },
    boys: {
      A: [
        { name: 'Adam', meaning: 'Terre rouge', personality: 'Originel et authentique, Adam est un fondateur.' },
      ],
      B: [
        { name: 'Bram', meaning: 'Père des nations', personality: 'Leader et visionnaire, Bram guide.' },
      ],
      D: [
        { name: 'Daan', meaning: 'Dieu est mon juge', personality: 'Juste et intègre, Daan juge avec sagesse.' },
      ],
      J: [
        { name: 'Jasper', meaning: 'Trésorier', personality: 'Prudent et responsable, Jasper gère.' },
        { name: 'Jesse', meaning: 'Cadeau', personality: 'Précieux et donné, Jesse est un présent.' },
      ],
      L: [
        { name: 'Lars', meaning: 'Couronné de lauriers', personality: 'Victorieux et honoré, Lars triomphe.' },
        { name: 'Levi', meaning: 'Attaché', personality: 'Loyal et connecté, Levi reste fidèle.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Luuk', meaning: 'Lumière', personality: 'Clair et guidant, Luuk montre la voie.' },
      ],
      M: [
        { name: 'Milan', meaning: 'Gracieux', personality: 'Élégant et raffiné, Milan a du style.' },
      ],
      N: [
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      R: [
        { name: 'Ruben', meaning: 'Voyez, un fils', personality: 'Béni et précieux, Ruben est un trésor.' },
      ],
      S: [
        { name: 'Sem', meaning: 'Nom, renommée', personality: 'Célèbre et respecté, Sem laisse sa marque.' },
        { name: 'Stijn', meaning: 'Pierre', personality: 'Solide et fiable, Stijn est un roc.' },
      ],
      T: [
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Thomas comprend.' },
        { name: 'Tim', meaning: 'Qui honore Dieu', personality: 'Spirituel et dévoué, Tim honore.' },
      ],
    },
  },

  // POLOGNE
  PL: {
    girls: {
      A: [
        { name: 'Aleksandra', meaning: 'Défenseur de l\'humanité', personality: 'Protectrice et forte, Aleksandra défend.' },
        { name: 'Alicja', meaning: 'Noble', personality: 'Noble et gracieuse, Alicja a de la classe.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna rayonne.' },
      ],
      E: [
        { name: 'Emilia', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emilia excelle.' },
        { name: 'Ewa', meaning: 'Vie', personality: 'Vivante et première, Ewa est l\'origine.' },
      ],
      J: [
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
      ],
      K: [
        { name: 'Kasia', meaning: 'Pure', personality: 'Pure et noble, Kasia a de la classe.' },
        { name: 'Karolina', meaning: 'Femme libre', personality: 'Indépendante et forte, Karolina vit librement.' },
      ],
      L: [
        { name: 'Lena', meaning: 'Lumière', personality: 'Brillante et chaleureuse, Lena illumine.' },
      ],
      M: [
        { name: 'Maja', meaning: 'Grande', personality: 'Grande par le cœur, Maja est généreuse.' },
        { name: 'Magdalena', meaning: 'De Magdala', personality: 'Dévouée et fidèle, Magdalena suit son cœur.' },
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
        { name: 'Marta', meaning: 'Dame', personality: 'Noble et distinguée, Marta commande le respect.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natalia apporte le renouveau.' },
      ],
      O: [
        { name: 'Oliwia', meaning: 'Olivier', personality: 'Paisible et sage, Oliwia apporte la paix.' },
      ],
      P: [
        { name: 'Paulina', meaning: 'Petite', personality: 'Humble et modeste, Paulina reste simple.' },
      ],
      Z: [
        { name: 'Zofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Zofia conseille.' },
        { name: 'Zuzanna', meaning: 'Lys', personality: 'Pure et belle, Zuzanna est une fleur.' },
      ],
    },
    boys: {
      A: [
        { name: 'Adam', meaning: 'Terre rouge', personality: 'Originel et authentique, Adam est un fondateur.' },
        { name: 'Antoni', meaning: 'Inestimable', personality: 'Précieux et unique, Antoni est irremplaçable.' },
      ],
      B: [
        { name: 'Bartosz', meaning: 'Fils de Talmai', personality: 'Fort et endurant, Bartosz persévère.' },
      ],
      D: [
        { name: 'Dawid', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, Dawid attire.' },
      ],
      F: [
        { name: 'Filip', meaning: 'Ami des chevaux', personality: 'Libre et noble, Filip aime la liberté.' },
      ],
      J: [
        { name: 'Jakub', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jakub planifie.' },
        { name: 'Jan', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Jan est un pilier.' },
      ],
      K: [
        { name: 'Kacper', meaning: 'Trésorier', personality: 'Prudent et responsable, Kacper gère.' },
        { name: 'Kamil', meaning: 'Parfait', personality: 'Perfectionniste et déterminé, Kamil vise l\'excellence.' },
        { name: 'Krzysztof', meaning: 'Porteur du Christ', personality: 'Dévoué et protecteur, Krzysztof porte.' },
      ],
      L: [
        { name: 'Leon', meaning: 'Lion', personality: 'Courageux et royal, Leon règne.' },
      ],
      M: [
        { name: 'Mateusz', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mateusz partage.' },
        { name: 'Michał', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Michał cherche.' },
      ],
      P: [
        { name: 'Piotr', meaning: 'Pierre', personality: 'Solide et fiable, Piotr est un roc.' },
        { name: 'Paweł', meaning: 'Petit', personality: 'Humble et modeste, Paweł reste simple.' },
      ],
      S: [
        { name: 'Szymon', meaning: 'Qui écoute', personality: 'Attentif et sage, Szymon écoute.' },
        { name: 'Stanisław', meaning: 'Gloire de l\'État', personality: 'Patriote et noble, Stanisław sert.' },
      ],
      T: [
        { name: 'Tomasz', meaning: 'Jumeau', personality: 'Empathique et connecté, Tomasz comprend.' },
      ],
      W: [
        { name: 'Wojciech', meaning: 'Consolation de l\'armée', personality: 'Réconfortant et fort, Wojciech soutient.' },
      ],
    },
  },

  // IRLANDE
  IE: {
    girls: {
      A: [
        { name: 'Aisling', meaning: 'Rêve, vision', personality: 'Rêveuse et visionnaire, Aisling voit l\'avenir.' },
        { name: 'Aoife', meaning: 'Belle, radieuse', personality: 'Belle et lumineuse, Aoife rayonne.' },
      ],
      B: [
        { name: 'Bridget', meaning: 'Exaltée', personality: 'Noble et exaltée, Bridget inspire.' },
      ],
      C: [
        { name: 'Caoimhe', meaning: 'Gentille, belle', personality: 'Douce et belle, Caoimhe charme.' },
        { name: 'Ciara', meaning: 'Sombre', personality: 'Mystérieuse et profonde, Ciara intrigue.' },
      ],
      E: [
        { name: 'Emily', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emily excelle.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
      ],
      F: [
        { name: 'Fiona', meaning: 'Blanche, belle', personality: 'Pure et belle, Fiona rayonne.' },
      ],
      G: [
        { name: 'Grace', meaning: 'Grâce', personality: 'Gracieuse et élégante, Grace danse dans la vie.' },
      ],
      M: [
        { name: 'Maeve', meaning: 'Enivrante', personality: 'Captivante et forte, Maeve fascine.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      N: [
        { name: 'Niamh', meaning: 'Brillante', personality: 'Lumineuse et radieuse, Niamh brille.' },
      ],
      O: [
        { name: 'Orla', meaning: 'Princesse dorée', personality: 'Royale et précieuse, Orla règne.' },
      ],
      R: [
        { name: 'Roisin', meaning: 'Petite rose', personality: 'Délicate et belle, Roisin embellit.' },
      ],
      S: [
        { name: 'Saoirse', meaning: 'Liberté', personality: 'Libre et indépendante, Saoirse vole.' },
        { name: 'Siobhan', meaning: 'Dieu est gracieux', personality: 'Bénie et gracieuse, Siobhan rayonne.' },
        { name: 'Sophie', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophie conseille.' },
      ],
    },
    boys: {
      A: [
        { name: 'Aidan', meaning: 'Petit feu', personality: 'Passionné et ardent, Aidan brûle de vie.' },
      ],
      B: [
        { name: 'Brian', meaning: 'Noble, fort', personality: 'Noble et puissant, Brian commande.' },
      ],
      C: [
        { name: 'Cian', meaning: 'Ancien', personality: 'Sage et ancestral, Cian porte la tradition.' },
        { name: 'Conor', meaning: 'Amoureux des loups', personality: 'Sauvage et loyal, Conor protège.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et intègre, Daniel juge avec sagesse.' },
        { name: 'Declan', meaning: 'Plein de bonté', personality: 'Bon et généreux, Declan donne.' },
      ],
      E: [
        { name: 'Eoin', meaning: 'Dieu est gracieux', personality: 'Béni et gracieux, Eoin rayonne.' },
      ],
      F: [
        { name: 'Finn', meaning: 'Blanc, juste', personality: 'Pur et juste, Finn agit avec droiture.' },
      ],
      J: [
        { name: 'Jack', meaning: 'Dieu est gracieux', personality: 'Classique et fiable, Jack est un pilier.' },
        { name: 'James', meaning: 'Supplanteur', personality: 'Noble et classique, James a de la prestance.' },
      ],
      L: [
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
      ],
      N: [
        { name: 'Niall', meaning: 'Champion', personality: 'Victorieux et champion, Niall gagne.' },
      ],
      O: [
        { name: 'Oisin', meaning: 'Petit cerf', personality: 'Gracieux et rapide, Oisin s\'élance.' },
      ],
      P: [
        { name: 'Patrick', meaning: 'Noble', personality: 'Noble et patriote, Patrick honore.' },
      ],
      R: [
        { name: 'Ryan', meaning: 'Petit roi', personality: 'Royal et leader, Ryan commande.' },
        { name: 'Rory', meaning: 'Roi rouge', personality: 'Royal et passionné, Rory règne avec feu.' },
      ],
      S: [
        { name: 'Sean', meaning: 'Dieu est gracieux', personality: 'Béni et charmant, Sean plaît.' },
      ],
    },
  },

  // GRÈCE
  GR: {
    girls: {
      A: [
        { name: 'Athina', meaning: 'Sagesse', personality: 'Sage et intelligente, Athina conseille.' },
        { name: 'Alexandra', meaning: 'Défenseur de l\'humanité', personality: 'Protectrice et forte, Alexandra défend.' },
        { name: 'Anastasia', meaning: 'Résurrection', personality: 'Renaissante et forte, Anastasia se relève toujours.' },
      ],
      D: [
        { name: 'Dimitra', meaning: 'De Déméter', personality: 'Nourricière et généreuse, Dimitra donne.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
        { name: 'Eleni', meaning: 'Lumière', personality: 'Lumineuse et brillante, Eleni éclaire.' },
        { name: 'Evi', meaning: 'Vie', personality: 'Vivante et énergique, Evi célèbre.' },
      ],
      I: [
        { name: 'Ioanna', meaning: 'Dieu fait grâce', personality: 'Bénie et gracieuse, Ioanna rayonne.' },
      ],
      K: [
        { name: 'Katerina', meaning: 'Pure', personality: 'Pure et noble, Katerina a de la classe.' },
        { name: 'Konstantina', meaning: 'Constante', personality: 'Fidèle et stable, Konstantina ne change pas.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
      ],
      N: [
        { name: 'Niki', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Niki triomphe.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
        { name: 'Stavroula', meaning: 'Croix', personality: 'Spirituelle et dévouée, Stavroula croit.' },
      ],
    },
    boys: {
      A: [
        { name: 'Andreas', meaning: 'Viril, courageux', personality: 'Brave et fort, Andreas fait face.' },
        { name: 'Alexandros', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexandros défend.' },
      ],
      D: [
        { name: 'Dimitris', meaning: 'De Déméter', personality: 'Nourricier et généreux, Dimitris donne.' },
      ],
      G: [
        { name: 'Georgios', meaning: 'Agriculteur', personality: 'Travailleur et patient, Georgios cultive.' },
        { name: 'Giorgos', meaning: 'Agriculteur', personality: 'Terre-à-terre et fiable, Giorgos est ancré.' },
      ],
      I: [
        { name: 'Ioannis', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Ioannis est un pilier.' },
      ],
      K: [
        { name: 'Konstantinos', meaning: 'Constant', personality: 'Fidèle et stable, Konstantinos ne change pas.' },
        { name: 'Kostas', meaning: 'Constant', personality: 'Stable et fiable, Kostas est un roc.' },
      ],
      M: [
        { name: 'Michalis', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Michalis cherche.' },
      ],
      N: [
        { name: 'Nikos', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nikos rassemble.' },
      ],
      P: [
        { name: 'Panagiotis', meaning: 'Tout saint', personality: 'Spirituel et dévoué, Panagiotis prie.' },
        { name: 'Petros', meaning: 'Pierre', personality: 'Solide et fiable, Petros est un roc.' },
      ],
      S: [
        { name: 'Spiros', meaning: 'Esprit', personality: 'Spirituel et vivant, Spiros inspire.' },
        { name: 'Stavros', meaning: 'Croix', personality: 'Spirituel et dévoué, Stavros croit.' },
      ],
      V: [
        { name: 'Vasilis', meaning: 'Roi', personality: 'Royal et noble, Vasilis règne.' },
      ],
    },
  },

  // CANADA
  CA: {
    girls: {
      A: [
        { name: 'Abigail', meaning: 'Joie du père', personality: 'Joyeuse et aimante, Abigail apporte le bonheur.' },
        { name: 'Amélie', meaning: 'Travailleuse', personality: 'Déterminée et énergique, Amélie atteint ses objectifs.' },
        { name: 'Audrey', meaning: 'Noble force', personality: 'Élégante et forte, Audrey impressionne.' },
        { name: 'Ava', meaning: 'Vie', personality: 'Vivante et énergique, Ava célèbre l\'existence.' },
      ],
      C: [
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Classique et élégante, Charlotte a du style.' },
        { name: 'Chloe', meaning: 'Jeune pousse', personality: 'Fraîche et naturelle, Chloe respire la vie.' },
      ],
      E: [
        { name: 'Emily', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emily vise l\'excellence.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
      ],
      G: [
        { name: 'Grace', meaning: 'Grâce', personality: 'Gracieuse et élégante, Grace danse dans la vie.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
      ],
      L: [
        { name: 'Léa', meaning: 'Lionne', personality: 'Forte et courageuse, Léa protège les siens.' },
        { name: 'Lily', meaning: 'Lys', personality: 'Pure et belle, Lily est une fleur précieuse.' },
      ],
      M: [
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      S: [
        { name: 'Sophia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophia conseille.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
      ],
      B: [
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Favorisé et talentueux, Benjamin excelle.' },
      ],
      E: [
        { name: 'Ethan', meaning: 'Fort, ferme', personality: 'Solide et fiable, Ethan ne vacille pas.' },
      ],
      J: [
        { name: 'Jack', meaning: 'Dieu est gracieux', personality: 'Classique et fiable, Jack est un pilier.' },
        { name: 'Jacob', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jacob planifie.' },
        { name: 'James', meaning: 'Supplanteur', personality: 'Noble et classique, James a de la prestance.' },
      ],
      L: [
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Léo', meaning: 'Lion', personality: 'Courageux et royal, Léo règne.' },
      ],
      M: [
        { name: 'Mason', meaning: 'Tailleur de pierre', personality: 'Constructeur et solide, Mason bâtit.' },
      ],
      N: [
        { name: 'Nathan', meaning: 'Donné par Dieu', personality: 'Béni et précieux, Nathan est un cadeau.' },
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Paisible et sage, Oliver apporte la paix.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
      ],
      W: [
        { name: 'William', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, William défend.' },
      ],
    },
  },

  // MEXIQUE
  MX: {
    girls: {
      A: [
        { name: 'Alejandra', meaning: 'Défenseur de l\'humanité', personality: 'Protectrice et forte, Alejandra défend.' },
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana est authentique.' },
        { name: 'Andrea', meaning: 'Courageuse', personality: 'Brave et forte, Andrea affronte tout.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camila se consacre.' },
        { name: 'Carolina', meaning: 'Femme libre', personality: 'Indépendante et forte, Carolina vit librement.' },
      ],
      D: [
        { name: 'Daniela', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniela juge bien.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
      ],
      F: [
        { name: 'Fernanda', meaning: 'Aventurière courageuse', personality: 'Audacieuse et exploratrice, Fernanda découvre.' },
      ],
      G: [
        { name: 'Gabriela', meaning: 'Force de Dieu', personality: 'Puissante et gracieuse, Gabriela impressionne.' },
        { name: 'Guadalupe', meaning: 'Vallée des loups', personality: 'Mystérieuse et protectrice, Guadalupe veille.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
      ],
      J: [
        { name: 'Jimena', meaning: 'Celle qui écoute', personality: 'Attentive et sage, Jimena entend.' },
        { name: 'Juana', meaning: 'Dieu fait grâce', personality: 'Bénie et traditionnelle, Juana est un pilier.' },
      ],
      L: [
        { name: 'Lucia', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucia guide.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
        { name: 'Mariana', meaning: 'De la mer', personality: 'Profonde et mystérieuse, Mariana fascine.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natalia apporte le renouveau.' },
      ],
      P: [
        { name: 'Paola', meaning: 'Petite', personality: 'Humble et modeste, Paola reste simple.' },
      ],
      R: [
        { name: 'Regina', meaning: 'Reine', personality: 'Royale et majestueuse, Regina règne.' },
        { name: 'Renata', meaning: 'Renaissante', personality: 'Renaissante et forte, Renata se relève.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Valeria', meaning: 'Forte', personality: 'Puissante et déterminée, Valeria conquiert.' },
      ],
      X: [
        { name: 'Ximena', meaning: 'Celle qui écoute', personality: 'Attentive et sage, Ximena entend tout.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alejandro', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alejandro défend.' },
        { name: 'Angel', meaning: 'Messager', personality: 'Messager et guide, Angel annonce.' },
        { name: 'Antonio', meaning: 'Inestimable', personality: 'Précieux et unique, Antonio est irremplaçable.' },
      ],
      C: [
        { name: 'Carlos', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlos suit sa voie.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniel juge bien.' },
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire.' },
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      E: [
        { name: 'Eduardo', meaning: 'Gardien prospère', personality: 'Protecteur et prospère, Eduardo veille.' },
        { name: 'Emiliano', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emiliano excelle.' },
      ],
      F: [
        { name: 'Fernando', meaning: 'Aventurier courageux', personality: 'Audacieux et brave, Fernando explore.' },
        { name: 'Francisco', meaning: 'Libre', personality: 'Honnête et direct, Francisco dit la vérité.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriel annonce.' },
      ],
      J: [
        { name: 'Javier', meaning: 'Nouvelle maison', personality: 'Bâtisseur et novateur, Javier construit.' },
        { name: 'Jorge', meaning: 'Agriculteur', personality: 'Travailleur et patient, Jorge cultive.' },
        { name: 'Jose', meaning: 'Il ajoutera', personality: 'Croissant et généreux, Jose multiplie.' },
        { name: 'Juan', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Juan est un pilier.' },
      ],
      L: [
        { name: 'Luis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luis triomphe.' },
      ],
      M: [
        { name: 'Manuel', meaning: 'Dieu est avec nous', personality: 'Protégé et guidé, Manuel a la foi.' },
        { name: 'Mateo', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mateo partage.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Miguel cherche.' },
      ],
      P: [
        { name: 'Pablo', meaning: 'Petit', personality: 'Humble et modeste, Pablo reste simple.' },
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et fiable, Pedro est un roc.' },
      ],
      R: [
        { name: 'Rafael', meaning: 'Dieu guérit', personality: 'Guérisseur et bienveillant, Rafael soigne.' },
        { name: 'Ricardo', meaning: 'Puissant et brave', personality: 'Fort et courageux, Ricardo affronte.' },
        { name: 'Roberto', meaning: 'Gloire brillante', personality: 'Brillant et glorieux, Roberto rayonne.' },
      ],
      S: [
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Spirituel et pèlerin, Santiago cherche.' },
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
    },
  },

  // ARGENTINE
  AR: {
    girls: {
      A: [
        { name: 'Agustina', meaning: 'Vénérable', personality: 'Respectable et digne, Agustina inspire.' },
        { name: 'Alma', meaning: 'Âme', personality: 'Spirituelle et profonde, Alma touche les cœurs.' },
      ],
      B: [
        { name: 'Bianca', meaning: 'Blanche', personality: 'Pure et innocente, Bianca est sincère.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camila se consacre.' },
        { name: 'Catalina', meaning: 'Pure', personality: 'Pure et noble, Catalina a de la classe.' },
      ],
      D: [
        { name: 'Delfina', meaning: 'Dauphin', personality: 'Gracieuse et joueuse, Delfina nage dans la joie.' },
      ],
      E: [
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
        { name: 'Emilia', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emilia excelle.' },
      ],
      F: [
        { name: 'Florencia', meaning: 'Florissante', personality: 'Épanouie et radieuse, Florencia s\'épanouit.' },
        { name: 'Francisca', meaning: 'Libre', personality: 'Honnête et directe, Francisca dit la vérité.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
      ],
      J: [
        { name: 'Josefina', meaning: 'Dieu ajoutera', personality: 'Croissante et bénie, Josefina prospère.' },
        { name: 'Juana', meaning: 'Dieu fait grâce', personality: 'Bénie et traditionnelle, Juana est un pilier.' },
        { name: 'Julia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Julia garde sa vivacité.' },
      ],
      L: [
        { name: 'Lucia', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucia guide.' },
        { name: 'Luna', meaning: 'Lune', personality: 'Mystérieuse et douce, Luna brille la nuit.' },
      ],
      M: [
        { name: 'Martina', meaning: 'Guerrière de Mars', personality: 'Combative et courageuse, Martina affronte.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Victoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Victoria triomphe.' },
      ],
    },
    boys: {
      A: [
        { name: 'Agustin', meaning: 'Vénérable', personality: 'Respectable et digne, Agustin inspire.' },
      ],
      B: [
        { name: 'Bautista', meaning: 'Celui qui baptise', personality: 'Spirituel et guide, Bautista mène.' },
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Favorisé et talentueux, Benjamin excelle.' },
        { name: 'Bruno', meaning: 'Brun', personality: 'Solide et terre-à-terre, Bruno est ancré.' },
      ],
      D: [
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      E: [
        { name: 'Emiliano', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emiliano excelle.' },
      ],
      F: [
        { name: 'Felipe', meaning: 'Ami des chevaux', personality: 'Libre et noble, Felipe aime la liberté.' },
        { name: 'Francisco', meaning: 'Libre', personality: 'Honnête et direct, Francisco dit la vérité.' },
      ],
      G: [
        { name: 'Gonzalo', meaning: 'Génie au combat', personality: 'Stratège et fort, Gonzalo gagne.' },
      ],
      I: [
        { name: 'Ignacio', meaning: 'Feu', personality: 'Ardent et passionné, Ignacio brûle.' },
      ],
      J: [
        { name: 'Joaquin', meaning: 'Dieu établira', personality: 'Béni et établi, Joaquin est stable.' },
        { name: 'Juan', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Juan est un pilier.' },
      ],
      L: [
        { name: 'Lautaro', meaning: 'Faucon rapide', personality: 'Rapide et vif, Lautaro s\'élance.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
      ],
      M: [
        { name: 'Martin', meaning: 'Guerrier de Mars', personality: 'Combatif et courageux, Martin affronte.' },
        { name: 'Mateo', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mateo partage.' },
        { name: 'Matias', meaning: 'Don de Dieu', personality: 'Béni et reconnaissant, Matias apprécie.' },
      ],
      N: [
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicolas rassemble.' },
      ],
      S: [
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Spirituel et pèlerin, Santiago cherche.' },
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
      T: [
        { name: 'Tomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Tomas comprend.' },
      ],
    },
  },

  // RUSSIE
  RU: {
    girls: {
      A: [
        { name: 'Anastasia', meaning: 'Résurrection', personality: 'Renaissante et forte, Anastasia se relève toujours.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna rayonne de bonté.' },
        { name: 'Alina', meaning: 'Noble', personality: 'Noble et gracieuse, Alina a de la classe.' },
        { name: 'Alexandra', meaning: 'Défenseur de l\'humanité', personality: 'Protectrice et forte, Alexandra défend.' },
      ],
      D: [
        { name: 'Daria', meaning: 'Celle qui possède le bien', personality: 'Généreuse et prospère, Daria partage.' },
      ],
      E: [
        { name: 'Ekaterina', meaning: 'Pure', personality: 'Pure et noble, Ekaterina a de la prestance.' },
        { name: 'Elena', meaning: 'Éclat du soleil', personality: 'Radieuse et chaleureuse, Elena réchauffe.' },
        { name: 'Eva', meaning: 'Vie', personality: 'Vivante et première, Eva est l\'origine.' },
      ],
      I: [
        { name: 'Irina', meaning: 'Paix', personality: 'Paisible et sereine, Irina apporte la tranquillité.' },
      ],
      K: [
        { name: 'Kira', meaning: 'Dame', personality: 'Noble et distinguée, Kira commande le respect.' },
        { name: 'Ksenia', meaning: 'Hospitalière', personality: 'Accueillante et généreuse, Ksenia ouvre sa maison.' },
      ],
      L: [
        { name: 'Lara', meaning: 'Protection', personality: 'Protectrice et forte, Lara veille.' },
        { name: 'Ludmila', meaning: 'Aimée du peuple', personality: 'Populaire et aimée, Ludmila rassemble.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
        { name: 'Masha', meaning: 'Aimée', personality: 'Adorable et douce, Masha charme.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natalia apporte le renouveau.' },
        { name: 'Nadya', meaning: 'Espoir', personality: 'Pleine d\'espoir, Nadya inspire l\'optimisme.' },
        { name: 'Nina', meaning: 'Grâce', personality: 'Gracieuse et élégante, Nina danse dans la vie.' },
      ],
      O: [
        { name: 'Olga', meaning: 'Sainte', personality: 'Spirituelle et sage, Olga guide.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
        { name: 'Svetlana', meaning: 'Lumière', personality: 'Lumineuse et brillante, Svetlana éclaire.' },
      ],
      T: [
        { name: 'Tatiana', meaning: 'Fée', personality: 'Magique et enchanteresse, Tatiana fascine.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Vera', meaning: 'Foi', personality: 'Croyante et confiante, Vera a foi en la vie.' },
        { name: 'Victoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Victoria triomphe.' },
      ],
      Y: [
        { name: 'Yulia', meaning: 'Jeune', personality: 'Fraîche et jeune d\'esprit, Yulia garde sa vivacité.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
        { name: 'Alexei', meaning: 'Défenseur', personality: 'Protecteur et loyal, Alexei veille.' },
        { name: 'Andrei', meaning: 'Viril, courageux', personality: 'Brave et fort, Andrei fait face.' },
        { name: 'Anton', meaning: 'Inestimable', personality: 'Précieux et unique, Anton est irremplaçable.' },
      ],
      B: [
        { name: 'Boris', meaning: 'Combattant', personality: 'Guerrier et fort, Boris se bat.' },
      ],
      D: [
        { name: 'Dmitri', meaning: 'De Déméter', personality: 'Nourricier et généreux, Dmitri donne.' },
        { name: 'Denis', meaning: 'Consacré à Dionysos', personality: 'Festif et joyeux, Denis célèbre.' },
      ],
      E: [
        { name: 'Evgeni', meaning: 'Bien né', personality: 'Noble et fortuné, Evgeni est béni.' },
      ],
      G: [
        { name: 'Grigori', meaning: 'Vigilant', personality: 'Attentif et prudent, Grigori ne rate rien.' },
      ],
      I: [
        { name: 'Igor', meaning: 'Guerrier', personality: 'Combatif et brave, Igor affronte.' },
        { name: 'Ivan', meaning: 'Dieu est gracieux', personality: 'Béni et traditionnel, Ivan est un pilier.' },
      ],
      K: [
        { name: 'Konstantin', meaning: 'Constant', personality: 'Fidèle et stable, Konstantin ne change pas.' },
        { name: 'Kirill', meaning: 'Seigneur', personality: 'Noble et digne, Kirill commande le respect.' },
      ],
      L: [
        { name: 'Lev', meaning: 'Lion', personality: 'Courageux et royal, Lev règne.' },
      ],
      M: [
        { name: 'Maxim', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Maxim vise haut.' },
        { name: 'Mikhail', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Mikhail cherche.' },
      ],
      N: [
        { name: 'Nikolai', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nikolai rassemble.' },
        { name: 'Nikita', meaning: 'Invaincu', personality: 'Invincible et fort, Nikita ne perd jamais.' },
      ],
      O: [
        { name: 'Oleg', meaning: 'Saint', personality: 'Spirituel et sage, Oleg guide.' },
      ],
      P: [
        { name: 'Pavel', meaning: 'Petit', personality: 'Humble et modeste, Pavel reste simple.' },
        { name: 'Pyotr', meaning: 'Pierre', personality: 'Solide et fiable, Pyotr est un roc.' },
      ],
      S: [
        { name: 'Sergei', meaning: 'Gardien', personality: 'Protecteur et vigilant, Sergei veille.' },
        { name: 'Stanislav', meaning: 'Gloire', personality: 'Glorieux et noble, Stanislav brille.' },
      ],
      V: [
        { name: 'Viktor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Viktor gagne.' },
        { name: 'Vladimir', meaning: 'Prince du monde', personality: 'Royal et puissant, Vladimir règne.' },
        { name: 'Vasili', meaning: 'Roi', personality: 'Royal et noble, Vasili commande.' },
      ],
      Y: [
        { name: 'Yuri', meaning: 'Agriculteur', personality: 'Travailleur et patient, Yuri cultive.' },
      ],
    },
  },

  // SUÈDE
  SE: {
    girls: {
      A: [
        { name: 'Agnes', meaning: 'Pure', personality: 'Pure et innocente, Agnes est sincère.' },
        { name: 'Alice', meaning: 'Noble', personality: 'Noble et gracieuse, Alice a de la classe.' },
        { name: 'Alva', meaning: 'Elfe', personality: 'Magique et mystérieuse, Alva enchante.' },
        { name: 'Astrid', meaning: 'Force divine', personality: 'Forte et divine, Astrid impressionne.' },
      ],
      E: [
        { name: 'Ebba', meaning: 'Forte', personality: 'Puissante et déterminée, Ebba ne recule pas.' },
        { name: 'Elsa', meaning: 'Noble', personality: 'Noble et pure, Elsa a de la prestance.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Elin', meaning: 'Torche', personality: 'Lumineuse et guidante, Elin éclaire.' },
      ],
      F: [
        { name: 'Freja', meaning: 'Dame noble', personality: 'Noble et belle, Freja inspire le respect.' },
        { name: 'Filippa', meaning: 'Amie des chevaux', personality: 'Libre et noble, Filippa aime la liberté.' },
      ],
      I: [
        { name: 'Ida', meaning: 'Travailleuse', personality: 'Laborieuse et déterminée, Ida atteint ses buts.' },
        { name: 'Ingrid', meaning: 'Belle', personality: 'Belle et gracieuse, Ingrid charme.' },
      ],
      L: [
        { name: 'Linnea', meaning: 'Tilleul', personality: 'Naturelle et douce, Linnea apaise.' },
        { name: 'Lovisa', meaning: 'Guerrière glorieuse', personality: 'Combative et victorieuse, Lovisa triomphe.' },
      ],
      M: [
        { name: 'Maja', meaning: 'Grande', personality: 'Grande par le cœur, Maja est généreuse.' },
        { name: 'Molly', meaning: 'Aimée', personality: 'Aimée et douce, Molly est un amour.' },
      ],
      N: [
        { name: 'Nora', meaning: 'Honneur', personality: 'Honorable et digne, Nora inspire le respect.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      S: [
        { name: 'Saga', meaning: 'Conte, légende', personality: 'Légendaire et fascinante, Saga raconte.' },
        { name: 'Sigrid', meaning: 'Belle victoire', personality: 'Victorieuse et belle, Sigrid triomphe.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      V: [
        { name: 'Vera', meaning: 'Foi', personality: 'Croyante et confiante, Vera a foi.' },
        { name: 'Vilma', meaning: 'Protection', personality: 'Protectrice et forte, Vilma veille.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
        { name: 'Axel', meaning: 'Père de la paix', personality: 'Pacifique et diplomate, Axel résout.' },
      ],
      E: [
        { name: 'Elias', meaning: 'Mon Dieu est Yahweh', personality: 'Spirituel et puissant, Elias inspire.' },
        { name: 'Emil', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emil vise l\'excellence.' },
        { name: 'Erik', meaning: 'Roi pour toujours', personality: 'Royal et éternel, Erik règne.' },
      ],
      F: [
        { name: 'Filip', meaning: 'Ami des chevaux', personality: 'Libre et noble, Filip aime la liberté.' },
      ],
      G: [
        { name: 'Gustav', meaning: 'Bâton des Goths', personality: 'Fort et protecteur, Gustav soutient.' },
      ],
      H: [
        { name: 'Hugo', meaning: 'Esprit', personality: 'Brillant et créatif, Hugo a des idées géniales.' },
      ],
      L: [
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Ludvig', meaning: 'Guerrier célèbre', personality: 'Combatif et glorieux, Ludvig triomphe.' },
      ],
      N: [
        { name: 'Nils', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nils rassemble.' },
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Paisible et sage, Oliver apporte la paix.' },
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Puissant et divin, Oscar impressionne.' },
      ],
      S: [
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
        { name: 'Sven', meaning: 'Jeune homme', personality: 'Jeune et vigoureux, Sven est plein de vie.' },
      ],
      V: [
        { name: 'Viktor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Viktor gagne.' },
        { name: 'Vincent', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vincent conquiert.' },
      ],
      W: [
        { name: 'William', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, William défend.' },
      ],
    },
  },

  // NORVÈGE
  NO: {
    girls: {
      A: [
        { name: 'Amalie', meaning: 'Travailleuse', personality: 'Déterminée et énergique, Amalie atteint ses objectifs.' },
        { name: 'Aurora', meaning: 'Aurore', personality: 'Lumineuse et nouvelle, Aurora annonce de beaux jours.' },
      ],
      E: [
        { name: 'Ella', meaning: 'Belle fée', personality: 'Magique et charmante, Ella enchante.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma a un charme universel.' },
        { name: 'Emilie', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emilie excelle.' },
      ],
      F: [
        { name: 'Frida', meaning: 'Paix', personality: 'Paisible et sereine, Frida apporte la tranquillité.' },
        { name: 'Freya', meaning: 'Noble dame', personality: 'Noble et belle, Freya inspire le respect.' },
      ],
      I: [
        { name: 'Ingrid', meaning: 'Belle', personality: 'Belle et gracieuse, Ingrid charme.' },
        { name: 'Ida', meaning: 'Travailleuse', personality: 'Laborieuse et déterminée, Ida atteint ses buts.' },
      ],
      L: [
        { name: 'Leah', meaning: 'Fatiguée', personality: 'Persévérante malgré tout, Leah continue.' },
        { name: 'Linnea', meaning: 'Tilleul', personality: 'Naturelle et douce, Linnea apaise.' },
      ],
      M: [
        { name: 'Maja', meaning: 'Grande', personality: 'Grande par le cœur, Maja est généreuse.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      N: [
        { name: 'Nora', meaning: 'Honneur', personality: 'Honorable et digne, Nora inspire le respect.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
        { name: 'Sofie', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofie est une conseillère.' },
      ],
      T: [
        { name: 'Thea', meaning: 'Déesse', personality: 'Divine et inspirante, Thea est une muse.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
        { name: 'Aksel', meaning: 'Père de la paix', personality: 'Pacifique et diplomate, Aksel résout.' },
      ],
      E: [
        { name: 'Emil', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emil vise l\'excellence.' },
        { name: 'Erik', meaning: 'Roi pour toujours', personality: 'Royal et éternel, Erik règne.' },
      ],
      F: [
        { name: 'Filip', meaning: 'Ami des chevaux', personality: 'Libre et noble, Filip aime la liberté.' },
      ],
      H: [
        { name: 'Henrik', meaning: 'Chef de maison', personality: 'Leader et responsable, Henrik dirige.' },
      ],
      J: [
        { name: 'Jakob', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jakob planifie.' },
        { name: 'Jonas', meaning: 'Colombe', personality: 'Pacifique et doux, Jonas apporte la paix.' },
      ],
      L: [
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
      ],
      M: [
        { name: 'Magnus', meaning: 'Grand', personality: 'Grand et puissant, Magnus impressionne.' },
        { name: 'Mathias', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mathias partage.' },
      ],
      N: [
        { name: 'Noah', meaning: 'Repos', personality: 'Apaisant et sage, Noah calme.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Paisible et sage, Oliver apporte la paix.' },
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Puissant et divin, Oscar impressionne.' },
      ],
      S: [
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
      T: [
        { name: 'Tobias', meaning: 'Dieu est bon', personality: 'Bon et généreux, Tobias donne.' },
      ],
      W: [
        { name: 'William', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, William défend.' },
      ],
    },
  },

  // COLOMBIE
  CO: {
    girls: {
      A: [
        { name: 'Alejandra', meaning: 'Défenseur de l\'humanité', personality: 'Protectrice et forte, Alejandra défend.' },
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana est authentique.' },
        { name: 'Andrea', meaning: 'Courageuse', personality: 'Brave et forte, Andrea affronte tout.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camila se consacre.' },
        { name: 'Carolina', meaning: 'Femme libre', personality: 'Indépendante et forte, Carolina vit librement.' },
        { name: 'Catalina', meaning: 'Pure', personality: 'Pure et noble, Catalina a de la classe.' },
      ],
      D: [
        { name: 'Daniela', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniela juge bien.' },
      ],
      G: [
        { name: 'Gabriela', meaning: 'Force de Dieu', personality: 'Puissante et gracieuse, Gabriela impressionne.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dieu est mon serment', personality: 'Royale et fidèle, Isabella tient parole.' },
      ],
      J: [
        { name: 'Juliana', meaning: 'Jeune', personality: 'Éternellement jeune, Juliana garde sa fraîcheur.' },
      ],
      L: [
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et honorée, Laura triomphe.' },
        { name: 'Lucia', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucia guide.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Douce et aimante, Maria est tendresse.' },
        { name: 'Mariana', meaning: 'De la mer', personality: 'Profonde et mystérieuse, Mariana fascine.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Naissance', personality: 'Nouvelle et fraîche, Natalia apporte le renouveau.' },
      ],
      P: [
        { name: 'Paola', meaning: 'Petite', personality: 'Humble et modeste, Paola reste simple.' },
        { name: 'Paula', meaning: 'Petite', personality: 'Humble et douce, Paula reste simple.' },
      ],
      S: [
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et élégante, Sara règne avec grâce.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Valeria', meaning: 'Forte', personality: 'Puissante et déterminée, Valeria conquiert.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alejandro', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alejandro défend.' },
        { name: 'Andres', meaning: 'Viril, courageux', personality: 'Brave et fort, Andres fait face.' },
      ],
      C: [
        { name: 'Carlos', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlos suit sa voie.' },
        { name: 'Camilo', meaning: 'Serviteur du temple', personality: 'Dévoué et fidèle, Camilo se consacre.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et sage, Daniel juge bien.' },
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire.' },
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      F: [
        { name: 'Felipe', meaning: 'Ami des chevaux', personality: 'Libre et noble, Felipe aime la liberté.' },
      ],
      J: [
        { name: 'Juan', meaning: 'Dieu fait grâce', personality: 'Béni et traditionnel, Juan est un pilier.' },
        { name: 'Julian', meaning: 'Jeune', personality: 'Éternel jeune, Julian garde sa fraîcheur.' },
      ],
      L: [
        { name: 'Luis', meaning: 'Guerrier glorieux', personality: 'Combatif et victorieux, Luis triomphe.' },
      ],
      M: [
        { name: 'Manuel', meaning: 'Dieu est avec nous', personality: 'Protégé et guidé, Manuel a la foi.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Miguel cherche.' },
      ],
      N: [
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicolas rassemble.' },
      ],
      P: [
        { name: 'Pablo', meaning: 'Petit', personality: 'Humble et modeste, Pablo reste simple.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Spirituel et pèlerin, Santiago cherche.' },
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
    },
  },

  // CHILI
  CL: {
    girls: {
      A: [
        { name: 'Agustina', meaning: 'Vénérable', personality: 'Respectable et digne, Agustina inspire.' },
        { name: 'Antonia', meaning: 'Inestimable', personality: 'Précieuse et unique, Antonia est irremplaçable.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et fidèle, Camila se consacre.' },
        { name: 'Catalina', meaning: 'Pure', personality: 'Pure et noble, Catalina a de la classe.' },
        { name: 'Constanza', meaning: 'Constante', personality: 'Fidèle et stable, Constanza ne change pas.' },
      ],
      F: [
        { name: 'Fernanda', meaning: 'Aventurière courageuse', personality: 'Audacieuse et exploratrice, Fernanda découvre.' },
        { name: 'Florencia', meaning: 'Florissante', personality: 'Épanouie et radieuse, Florencia s\'épanouit.' },
        { name: 'Francisca', meaning: 'Libre', personality: 'Honnête et directe, Francisca dit la vérité.' },
      ],
      I: [
        { name: 'Ignacia', meaning: 'Feu', personality: 'Ardente et passionnée, Ignacia brûle.' },
        { name: 'Isidora', meaning: 'Don d\'Isis', personality: 'Mystérieuse et divine, Isidora fascine.' },
      ],
      J: [
        { name: 'Javiera', meaning: 'Nouvelle maison', personality: 'Bâtisseuse et novatrice, Javiera construit.' },
        { name: 'Josefa', meaning: 'Dieu ajoutera', personality: 'Croissante et bénie, Josefa prospère.' },
      ],
      M: [
        { name: 'Martina', meaning: 'Guerrière de Mars', personality: 'Combative et courageuse, Martina affronte.' },
        { name: 'Maite', meaning: 'Aimée', personality: 'Aimée et précieuse, Maite est chérie.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia conseille.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Puissante et passionnée, Valentina aime fort.' },
        { name: 'Victoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Victoria triomphe.' },
      ],
    },
    boys: {
      A: [
        { name: 'Agustin', meaning: 'Vénérable', personality: 'Respectable et digne, Agustin inspire.' },
        { name: 'Alonso', meaning: 'Noble et prêt', personality: 'Noble et préparé, Alonso est toujours prêt.' },
      ],
      B: [
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Favorisé et talentueux, Benjamin excelle.' },
      ],
      C: [
        { name: 'Cristobal', meaning: 'Porteur du Christ', personality: 'Dévoué et protecteur, Cristobal porte.' },
      ],
      D: [
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego transmet.' },
      ],
      F: [
        { name: 'Felipe', meaning: 'Ami des chevaux', personality: 'Libre et noble, Felipe aime la liberté.' },
        { name: 'Francisco', meaning: 'Libre', personality: 'Honnête et direct, Francisco dit la vérité.' },
      ],
      G: [
        { name: 'Gaspar', meaning: 'Trésorier', personality: 'Prudent et responsable, Gaspar gère.' },
      ],
      I: [
        { name: 'Ignacio', meaning: 'Feu', personality: 'Ardent et passionné, Ignacio brûle.' },
      ],
      J: [
        { name: 'Joaquin', meaning: 'Dieu établira', personality: 'Béni et établi, Joaquin est stable.' },
        { name: 'Jose', meaning: 'Il ajoutera', personality: 'Croissant et généreux, Jose multiplie.' },
      ],
      L: [
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
      ],
      M: [
        { name: 'Martin', meaning: 'Guerrier de Mars', personality: 'Combatif et courageux, Martin affronte.' },
        { name: 'Matias', meaning: 'Don de Dieu', personality: 'Béni et reconnaissant, Matias apprécie.' },
        { name: 'Maximiliano', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Maximiliano vise haut.' },
      ],
      N: [
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicolas rassemble.' },
      ],
      P: [
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et fiable, Pedro est un roc.' },
      ],
      S: [
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
      T: [
        { name: 'Tomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Tomas comprend.' },
      ],
      V: [
        { name: 'Vicente', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vicente conquiert.' },
      ],
    },
  },

  // UKRAINE
  UA: {
    girls: {
      A: [
        { name: 'Anastasia', meaning: 'Résurrection', personality: 'Forte et résiliente, Anastasia renaît de ses cendres.' },
        { name: 'Alina', meaning: 'Lumière', personality: 'Radieuse et brillante, Alina éclaire son entourage.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et élégante, Anna charme par sa simplicité.' },
      ],
      B: [
        { name: 'Bohdana', meaning: 'Donnée par Dieu', personality: 'Bénie et reconnaissante, Bohdana apprécie la vie.' },
      ],
      D: [
        { name: 'Daryna', meaning: 'Don de Dieu', personality: 'Généreuse et aimante, Daryna offre sans compter.' },
        { name: 'Diana', meaning: 'Divine', personality: 'Majestueuse et noble, Diana inspire le respect.' },
      ],
      I: [
        { name: 'Iryna', meaning: 'Paix', personality: 'Pacifique et sereine, Iryna apaise les tensions.' },
        { name: 'Ivanna', meaning: 'Dieu est gracieux', personality: 'Spirituelle et bienveillante, Ivanna guide.' },
      ],
      K: [
        { name: 'Kateryna', meaning: 'Pure', personality: 'Pure et innocente, Kateryna touche les cœurs.' },
        { name: 'Khrystyna', meaning: 'Chrétienne', personality: 'Dévouée et fidèle, Khrystyna croit fermement.' },
      ],
      L: [
        { name: 'Lesia', meaning: 'Protectrice', personality: 'Protectrice et courageuse, Lesia défend les siens.' },
        { name: 'Larysa', meaning: 'Mouette', personality: 'Libre et indépendante, Larysa vole haut.' },
      ],
      M: [
        { name: 'Maria', meaning: 'Aimée', personality: 'Aimante et maternelle, Maria prend soin de tous.' },
        { name: 'Myroslava', meaning: 'Gloire et paix', personality: 'Glorieuse et paisible, Myroslava rayonne.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Jour de naissance', personality: 'Joyeuse et festive, Natalia célèbre la vie.' },
      ],
      O: [
        { name: 'Oksana', meaning: 'Hospitalière', personality: 'Accueillante et chaleureuse, Oksana ouvre sa porte.' },
        { name: 'Olena', meaning: 'Lumière brillante', personality: 'Brillante et éclairée, Olena illumine.' },
        { name: 'Olha', meaning: 'Sacrée', personality: 'Sacrée et respectée, Olha commande le respect.' },
      ],
      S: [
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofia conseille avec justesse.' },
        { name: 'Svitlana', meaning: 'Lumière', personality: 'Lumineuse et positive, Svitlana brille.' },
      ],
      T: [
        { name: 'Tetiana', meaning: 'Organisatrice', personality: 'Organisée et efficace, Tetiana gère tout.' },
      ],
      V: [
        { name: 'Valentyna', meaning: 'Forte', personality: 'Forte et courageuse, Valentyna ne fléchit pas.' },
        { name: 'Veronika', meaning: 'Porteuse de victoire', personality: 'Victorieuse et triomphante, Veronika gagne.' },
        { name: 'Viktoria', meaning: 'Victoire', personality: 'Conquérante et ambitieuse, Viktoria réussit.' },
      ],
      Y: [
        { name: 'Yaryna', meaning: 'Printemps', personality: 'Fraîche et renouvelée, Yaryna apporte l\'espoir.' },
        { name: 'Yulia', meaning: 'Jeune', personality: 'Jeune d\'esprit et dynamique, Yulia inspire.' },
      ],
      Z: [
        { name: 'Zoriana', meaning: 'Étoile du matin', personality: 'Étoilée et brillante, Zoriana guide dans la nuit.' },
      ],
    },
    boys: {
      A: [
        { name: 'Andriy', meaning: 'Courageux', personality: 'Brave et vaillant, Andriy affronte les défis.' },
        { name: 'Artem', meaning: 'Sain', personality: 'Vigoureux et en bonne santé, Artem est robuste.' },
        { name: 'Oleksandr', meaning: 'Défenseur', personality: 'Protecteur et loyal, Oleksandr défend.' },
      ],
      B: [
        { name: 'Bohdan', meaning: 'Donné par Dieu', personality: 'Béni et reconnaissant, Bohdan valorise la vie.' },
      ],
      D: [
        { name: 'Dmytro', meaning: 'Terre mère', personality: 'Ancré et stable, Dmytro est fiable.' },
        { name: 'Danylo', meaning: 'Dieu est juge', personality: 'Juste et équitable, Danylo arbitre.' },
      ],
      I: [
        { name: 'Ivan', meaning: 'Dieu est gracieux', personality: 'Gracieux et bienveillant, Ivan pardonne.' },
        { name: 'Ihor', meaning: 'Guerrier', personality: 'Combattant et fort, Ihor ne recule pas.' },
      ],
      K: [
        { name: 'Kyrylo', meaning: 'Seigneur', personality: 'Noble et respecté, Kyrylo commande.' },
      ],
      M: [
        { name: 'Maksym', meaning: 'Le plus grand', personality: 'Ambitieux et excellent, Maksym vise haut.' },
        { name: 'Mykhailo', meaning: 'Qui est comme Dieu', personality: 'Spirituel et sage, Mykhailo inspire.' },
        { name: 'Mykola', meaning: 'Victoire du peuple', personality: 'Populaire et aimé, Mykola rassemble.' },
      ],
      O: [
        { name: 'Oleh', meaning: 'Saint', personality: 'Sacré et respecté, Oleh inspire la dévotion.' },
      ],
      P: [
        { name: 'Pavlo', meaning: 'Petit', personality: 'Humble et modeste, Pavlo reste simple.' },
        { name: 'Petro', meaning: 'Pierre', personality: 'Solide et inébranlable, Petro est un roc.' },
      ],
      R: [
        { name: 'Roman', meaning: 'Romain', personality: 'Fort et structuré, Roman construit.' },
        { name: 'Ruslan', meaning: 'Lion', personality: 'Féroce et courageux, Ruslan protège.' },
      ],
      S: [
        { name: 'Serhiy', meaning: 'Serviteur', personality: 'Dévoué et fidèle, Serhiy sert.' },
        { name: 'Stepan', meaning: 'Couronne', personality: 'Royal et noble, Stepan règne.' },
      ],
      T: [
        { name: 'Taras', meaning: 'Fils de Taras', personality: 'Patriote et fier, Taras honore ses racines.' },
      ],
      V: [
        { name: 'Vadym', meaning: 'Dirigeant', personality: 'Leader et influent, Vadym guide.' },
        { name: 'Viktor', meaning: 'Conquérant', personality: 'Victorieux et triomphant, Viktor gagne.' },
        { name: 'Volodymyr', meaning: 'Dirigeant du monde', personality: 'Puissant et sage, Volodymyr règne.' },
      ],
      Y: [
        { name: 'Yaroslav', meaning: 'Gloire printanière', personality: 'Glorieux et renouvelé, Yaroslav inspire.' },
        { name: 'Yuriy', meaning: 'Fermier', personality: 'Travailleur et humble, Yuriy cultive.' },
      ],
    },
  },

  // FINLANDE
  FI: {
    girls: {
      A: [
        { name: 'Aino', meaning: 'La seule', personality: 'Unique et spéciale, Aino se distingue.' },
        { name: 'Anni', meaning: 'Grâce', personality: 'Gracieuse et douce, Anni charme.' },
        { name: 'Aurora', meaning: 'Aurore', personality: 'Lumineuse comme l\'aurore boréale, Aurora éblouit.' },
      ],
      E: [
        { name: 'Eevi', meaning: 'Vie', personality: 'Pleine de vie et d\'énergie, Eevi rayonne.' },
        { name: 'Elina', meaning: 'Lumière', personality: 'Brillante et intelligente, Elina éclaire.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Ouverte et accueillante, Emma inclut tout le monde.' },
      ],
      H: [
        { name: 'Helmi', meaning: 'Perle', personality: 'Précieuse et rare, Helmi est un trésor.' },
        { name: 'Hilla', meaning: 'Mûre arctique', personality: 'Délicate et sauvage, Hilla est authentique.' },
      ],
      I: [
        { name: 'Iida', meaning: 'Travailleuse', personality: 'Diligente et appliquée, Iida excelle.' },
        { name: 'Ilona', meaning: 'Lumière', personality: 'Radieuse et chaleureuse, Ilona réchauffe.' },
      ],
      K: [
        { name: 'Kaisla', meaning: 'Roseau', personality: 'Flexible et résistante, Kaisla s\'adapte.' },
        { name: 'Katri', meaning: 'Pure', personality: 'Pure et sincère, Katri est authentique.' },
      ],
      L: [
        { name: 'Lumi', meaning: 'Neige', personality: 'Pure et cristalline, Lumi apaise.' },
        { name: 'Linnea', meaning: 'Fleur de tilleul', personality: 'Délicate et naturelle, Linnea fleurit.' },
      ],
      M: [
        { name: 'Milla', meaning: 'Gracieuse', personality: 'Élégante et raffinée, Milla enchante.' },
        { name: 'Minea', meaning: 'Amour', personality: 'Aimante et tendre, Minea chérit.' },
      ],
      O: [
        { name: 'Oona', meaning: 'Agneau', personality: 'Douce et innocente, Oona apaise.' },
      ],
      P: [
        { name: 'Pihla', meaning: 'Sorbier', personality: 'Naturelle et ancrée, Pihla est terre-à-terre.' },
      ],
      S: [
        { name: 'Saara', meaning: 'Princesse', personality: 'Royale et noble, Saara règne avec grâce.' },
        { name: 'Siiri', meaning: 'Belle victoire', personality: 'Victorieuse et belle, Siiri triomphe.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofia conseille.' },
      ],
      T: [
        { name: 'Tuuli', meaning: 'Vent', personality: 'Libre et insaisissable, Tuuli voyage.' },
      ],
      V: [
        { name: 'Venla', meaning: 'Voyageuse', personality: 'Aventurière et curieuse, Venla explore.' },
        { name: 'Viivi', meaning: 'Vivante', personality: 'Pleine de vie, Viivi anime.' },
      ],
    },
    boys: {
      A: [
        { name: 'Aaro', meaning: 'Montagne de force', personality: 'Fort et stable, Aaro est un pilier.' },
        { name: 'Aleksi', meaning: 'Défenseur', personality: 'Protecteur et loyal, Aleksi défend.' },
      ],
      E: [
        { name: 'Eemeli', meaning: 'Rival', personality: 'Compétitif et ambitieux, Eemeli excelle.' },
        { name: 'Eetu', meaning: 'Gardien des richesses', personality: 'Prudent et sage, Eetu protège.' },
        { name: 'Elias', meaning: 'Dieu est mon Dieu', personality: 'Spirituel et dévoué, Elias croit.' },
      ],
      H: [
        { name: 'Heikki', meaning: 'Chef de maison', personality: 'Responsable et fiable, Heikki gère.' },
      ],
      J: [
        { name: 'Joel', meaning: 'Dieu est Dieu', personality: 'Fidèle et constant, Joel persévère.' },
        { name: 'Juhani', meaning: 'Dieu est gracieux', personality: 'Bienveillant et doux, Juhani pardonne.' },
      ],
      K: [
        { name: 'Kalle', meaning: 'Homme libre', personality: 'Libre et indépendant, Kalle vit pleinement.' },
      ],
      L: [
        { name: 'Lauri', meaning: 'Laurier', personality: 'Victorieux et couronné, Lauri triomphe.' },
        { name: 'Leo', meaning: 'Lion', personality: 'Courageux et fier, Leo règne.' },
      ],
      M: [
        { name: 'Matias', meaning: 'Don de Dieu', personality: 'Béni et reconnaissant, Matias apprécie.' },
        { name: 'Mikael', meaning: 'Qui est comme Dieu', personality: 'Spirituel et sage, Mikael guide.' },
      ],
      N: [
        { name: 'Niilo', meaning: 'Champion du peuple', personality: 'Populaire et aimé, Niilo rassemble.' },
      ],
      O: [
        { name: 'Onni', meaning: 'Bonheur', personality: 'Joyeux et positif, Onni répand le bonheur.' },
        { name: 'Otto', meaning: 'Richesse', personality: 'Prospère et généreux, Otto partage.' },
      ],
      P: [
        { name: 'Paavo', meaning: 'Petit', personality: 'Humble et modeste, Paavo reste simple.' },
      ],
      T: [
        { name: 'Toivo', meaning: 'Espoir', personality: 'Optimiste et positif, Toivo inspire l\'espoir.' },
      ],
      V: [
        { name: 'Veeti', meaning: 'Forêt', personality: 'Naturel et calme, Veeti apaise.' },
        { name: 'Vilho', meaning: 'Protecteur résolu', personality: 'Déterminé et protecteur, Vilho veille.' },
      ],
    },
  },

  // DANEMARK
  DK: {
    girls: {
      A: [
        { name: 'Alma', meaning: 'Nourricière', personality: 'Maternelle et aimante, Alma prend soin.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Gracieuse et simple, Anna touche.' },
        { name: 'Astrid', meaning: 'Belle divinité', personality: 'Divine et majestueuse, Astrid éblouit.' },
      ],
      C: [
        { name: 'Clara', meaning: 'Claire', personality: 'Lumineuse et transparente, Clara éclaire.' },
      ],
      E: [
        { name: 'Ella', meaning: 'Belle fée', personality: 'Magique et enchanteresse, Ella ensorcelle.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Ouverte et inclusive, Emma accueille.' },
      ],
      F: [
        { name: 'Freja', meaning: 'Dame noble', personality: 'Noble et royale, Freja commande le respect.' },
        { name: 'Frida', meaning: 'Paix', personality: 'Paisible et sereine, Frida calme.' },
      ],
      I: [
        { name: 'Ida', meaning: 'Travailleuse', personality: 'Diligente et appliquée, Ida excelle.' },
        { name: 'Ingrid', meaning: 'Belle', personality: 'Belle intérieurement et extérieurement, Ingrid rayonne.' },
      ],
      K: [
        { name: 'Karla', meaning: 'Femme libre', personality: 'Libre et indépendante, Karla vit.' },
      ],
      L: [
        { name: 'Laura', meaning: 'Laurier', personality: 'Victorieuse et couronnée, Laura triomphe.' },
        { name: 'Liv', meaning: 'Vie', personality: 'Pleine de vie et d\'énergie, Liv anime.' },
        { name: 'Lærke', meaning: 'Alouette', personality: 'Joyeuse et chantante, Lærke égaye.' },
      ],
      M: [
        { name: 'Maja', meaning: 'Perle', personality: 'Précieuse et rare, Maja est un trésor.' },
        { name: 'Mathilde', meaning: 'Puissante au combat', personality: 'Forte et combative, Mathilde gagne.' },
      ],
      N: [
        { name: 'Nanna', meaning: 'Courageuse', personality: 'Brave et audacieuse, Nanna ose.' },
        { name: 'Nora', meaning: 'Honneur', personality: 'Honorable et digne, Nora inspire le respect.' },
      ],
      S: [
        { name: 'Saga', meaning: 'Voyante', personality: 'Intuitive et sage, Saga perçoit.' },
        { name: 'Sigrid', meaning: 'Belle victoire', personality: 'Victorieuse et belle, Sigrid triomphe.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofia conseille.' },
        { name: 'Signe', meaning: 'Nouvelle victoire', personality: 'Renouvelée et victorieuse, Signe renaît.' },
      ],
      V: [
        { name: 'Victoria', meaning: 'Victoire', personality: 'Conquérante et ambitieuse, Victoria réussit.' },
      ],
    },
    boys: {
      A: [
        { name: 'Adam', meaning: 'Terre', personality: 'Ancré et stable, Adam est fiable.' },
        { name: 'Alexander', meaning: 'Défenseur', personality: 'Protecteur et fort, Alexander défend.' },
        { name: 'Alfred', meaning: 'Conseiller elfique', personality: 'Sage et mystérieux, Alfred conseille.' },
      ],
      C: [
        { name: 'Carl', meaning: 'Homme libre', personality: 'Libre et indépendant, Carl vit pleinement.' },
        { name: 'Christian', meaning: 'Chrétien', personality: 'Fidèle et dévoué, Christian croit.' },
      ],
      E: [
        { name: 'Emil', meaning: 'Rival', personality: 'Compétitif et ambitieux, Emil excelle.' },
        { name: 'Erik', meaning: 'Dirigeant éternel', personality: 'Leader et visionnaire, Erik guide.' },
      ],
      F: [
        { name: 'Frederik', meaning: 'Dirigeant pacifique', personality: 'Sage et pacifique, Frederik unit.' },
      ],
      H: [
        { name: 'Henrik', meaning: 'Chef de maison', personality: 'Responsable et fiable, Henrik gère.' },
        { name: 'Hugo', meaning: 'Esprit', personality: 'Intelligent et vif, Hugo pense.' },
      ],
      J: [
        { name: 'Jonas', meaning: 'Colombe', personality: 'Pacifique et doux, Jonas apaise.' },
      ],
      K: [
        { name: 'Kasper', meaning: 'Trésorier', personality: 'Prudent et sage, Kasper protège.' },
      ],
      L: [
        { name: 'Lars', meaning: 'Laurier', personality: 'Victorieux et couronné, Lars triomphe.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Brillant et éclairant, Lucas guide.' },
      ],
      M: [
        { name: 'Magnus', meaning: 'Grand', personality: 'Grand d\'esprit et de cœur, Magnus inspire.' },
        { name: 'Mikkel', meaning: 'Qui est comme Dieu', personality: 'Spirituel et sage, Mikkel guide.' },
      ],
      N: [
        { name: 'Nikolaj', meaning: 'Victoire du peuple', personality: 'Populaire et aimé, Nikolaj rassemble.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Pacifique et durable, Oliver persiste.' },
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Guerrier et noble, Oscar combat.' },
      ],
      S: [
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
        { name: 'Søren', meaning: 'Sévère', personality: 'Sérieux et discipliné, Søren structure.' },
      ],
      V: [
        { name: 'Victor', meaning: 'Conquérant', personality: 'Victorieux et triomphant, Victor gagne.' },
        { name: 'Valdemar', meaning: 'Célèbre dirigeant', personality: 'Renommé et respecté, Valdemar règne.' },
      ],
    },
  },

  // PÉROU
  PE: {
    girls: {
      A: [
        { name: 'Adriana', meaning: 'De l\'Adriatique', personality: 'Mystérieuse et profonde, Adriana fascine.' },
        { name: 'Alejandra', meaning: 'Protectrice', personality: 'Protectrice et forte, Alejandra défend.' },
        { name: 'Ana', meaning: 'Grâce', personality: 'Gracieuse et simple, Ana touche.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Servante du temple', personality: 'Dévouée et spirituelle, Camila sert.' },
        { name: 'Carolina', meaning: 'Femme libre', personality: 'Libre et indépendante, Carolina vit.' },
        { name: 'Catalina', meaning: 'Pure', personality: 'Pure et sincère, Catalina est authentique.' },
      ],
      D: [
        { name: 'Daniela', meaning: 'Dieu est juge', personality: 'Juste et équitable, Daniela arbitre.' },
      ],
      F: [
        { name: 'Fernanda', meaning: 'Aventurière courageuse', personality: 'Aventurière et brave, Fernanda explore.' },
        { name: 'Flor', meaning: 'Fleur', personality: 'Délicate et belle, Flor embellit.' },
      ],
      G: [
        { name: 'Gabriela', meaning: 'Force de Dieu', personality: 'Forte et spirituelle, Gabriela inspire.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dévouée à Dieu', personality: 'Dévouée et fidèle, Isabella croit.' },
        { name: 'Inca', meaning: 'Princesse inca', personality: 'Royale et ancestrale, Inca honore.' },
      ],
      L: [
        { name: 'Luciana', meaning: 'Lumière', personality: 'Brillante et éclairante, Luciana guide.' },
        { name: 'Luz', meaning: 'Lumière', personality: 'Radieuse et positive, Luz illumine.' },
      ],
      M: [
        { name: 'María', meaning: 'Aimée', personality: 'Aimante et maternelle, María chérit.' },
        { name: 'Milagros', meaning: 'Miracles', personality: 'Miraculeuse et bénie, Milagros inspire.' },
      ],
      N: [
        { name: 'Natalia', meaning: 'Jour de naissance', personality: 'Joyeuse et festive, Natalia célèbre.' },
      ],
      P: [
        { name: 'Paola', meaning: 'Petite', personality: 'Humble et modeste, Paola reste simple.' },
      ],
      R: [
        { name: 'Rosa', meaning: 'Rose', personality: 'Belle et délicate, Rosa embellit.' },
      ],
      S: [
        { name: 'Sofía', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofía conseille.' },
        { name: 'Sol', meaning: 'Soleil', personality: 'Radieuse et chaude, Sol réchauffe.' },
      ],
      V: [
        { name: 'Valentina', meaning: 'Forte', personality: 'Forte et courageuse, Valentina combat.' },
        { name: 'Valeria', meaning: 'Forte', personality: 'Puissante et déterminée, Valeria réussit.' },
      ],
    },
    boys: {
      A: [
        { name: 'Alejandro', meaning: 'Défenseur', personality: 'Protecteur et loyal, Alejandro défend.' },
        { name: 'Andrés', meaning: 'Courageux', personality: 'Brave et vaillant, Andrés affronte.' },
        { name: 'Antonio', meaning: 'Inestimable', personality: 'Précieux et unique, Antonio est irremplaçable.' },
      ],
      C: [
        { name: 'Carlos', meaning: 'Homme libre', personality: 'Libre et indépendant, Carlos vit.' },
        { name: 'César', meaning: 'Chevelu', personality: 'Majestueux et impérial, César règne.' },
      ],
      D: [
        { name: 'Diego', meaning: 'Enseignant', personality: 'Sage et patient, Diego enseigne.' },
      ],
      E: [
        { name: 'Eduardo', meaning: 'Gardien prospère', personality: 'Protecteur et prospère, Eduardo veille.' },
      ],
      F: [
        { name: 'Fernando', meaning: 'Voyageur courageux', personality: 'Aventurier et brave, Fernando explore.' },
        { name: 'Francisco', meaning: 'Français', personality: 'Libre et franc, Francisco parle vrai.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Fort et spirituel, Gabriel guide.' },
      ],
      J: [
        { name: 'José', meaning: 'Dieu ajoutera', personality: 'Béni et reconnaissant, José apprécie.' },
        { name: 'Juan', meaning: 'Dieu est gracieux', personality: 'Bienveillant et doux, Juan pardonne.' },
      ],
      L: [
        { name: 'Luis', meaning: 'Guerrier célèbre', personality: 'Combattant et renommé, Luis triomphe.' },
      ],
      M: [
        { name: 'Manuel', meaning: 'Dieu avec nous', personality: 'Spirituel et présent, Manuel accompagne.' },
        { name: 'Marco', meaning: 'Guerrier', personality: 'Combattant et fort, Marco protège.' },
        { name: 'Miguel', meaning: 'Qui est comme Dieu', personality: 'Spirituel et sage, Miguel guide.' },
      ],
      P: [
        { name: 'Pablo', meaning: 'Petit', personality: 'Humble et modeste, Pablo reste simple.' },
        { name: 'Pedro', meaning: 'Pierre', personality: 'Solide et inébranlable, Pedro est un roc.' },
      ],
      R: [
        { name: 'Ricardo', meaning: 'Dirigeant puissant', personality: 'Puissant et sage, Ricardo règne.' },
        { name: 'Rodrigo', meaning: 'Célèbre dirigeant', personality: 'Renommé et respecté, Rodrigo guide.' },
      ],
      S: [
        { name: 'Santiago', meaning: 'Saint Jacques', personality: 'Pèlerin et spirituel, Santiago cherche.' },
        { name: 'Sebastián', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastián inspire.' },
      ],
    },
  },

  // JAPON
  JP: {
    girls: {
      A: [
        { name: 'Aiko', meaning: 'Enfant de l\'amour', personality: 'Aimante et tendre, Aiko chérit.' },
        { name: 'Akiko', meaning: 'Enfant de l\'automne', personality: 'Douce et mélancolique, Akiko réfléchit.' },
        { name: 'Asuka', meaning: 'Parfum de demain', personality: 'Optimiste et fraîche, Asuka espère.' },
        { name: 'Ayumi', meaning: 'Pas, marche', personality: 'Progressive et déterminée, Ayumi avance.' },
      ],
      E: [
        { name: 'Emi', meaning: 'Beauté bénie', personality: 'Belle et gracieuse, Emi enchante.' },
      ],
      H: [
        { name: 'Hana', meaning: 'Fleur', personality: 'Délicate et belle, Hana fleurit.' },
        { name: 'Haruka', meaning: 'Lointaine, printanière', personality: 'Rêveuse et douce, Haruka inspire.' },
        { name: 'Hikari', meaning: 'Lumière', personality: 'Lumineuse et brillante, Hikari éclaire.' },
        { name: 'Hinata', meaning: 'Vers le soleil', personality: 'Radieuse et positive, Hinata réchauffe.' },
      ],
      K: [
        { name: 'Kaori', meaning: 'Parfum', personality: 'Délicate et mémorable, Kaori marque.' },
        { name: 'Keiko', meaning: 'Enfant bénie', personality: 'Bénie et joyeuse, Keiko rayonne.' },
        { name: 'Kokoro', meaning: 'Cœur, esprit', personality: 'Profonde et sincère, Kokoro touche.' },
      ],
      M: [
        { name: 'Mai', meaning: 'Danse', personality: 'Gracieuse et élégante, Mai enchante.' },
        { name: 'Maki', meaning: 'Véritable espoir', personality: 'Optimiste et vraie, Maki inspire.' },
        { name: 'Midori', meaning: 'Vert', personality: 'Naturelle et fraîche, Midori apaise.' },
        { name: 'Mika', meaning: 'Belle odeur', personality: 'Agréable et douce, Mika charme.' },
        { name: 'Misaki', meaning: 'Belle floraison', personality: 'Épanouie et radieuse, Misaki brille.' },
      ],
      N: [
        { name: 'Nana', meaning: 'Sept', personality: 'Chanceuse et bénie, Nana prospère.' },
        { name: 'Naomi', meaning: 'Belle et honnête', personality: 'Sincère et belle, Naomi inspire.' },
      ],
      R: [
        { name: 'Rei', meaning: 'Esprit, zéro', personality: 'Pure et spirituelle, Rei transcende.' },
        { name: 'Rin', meaning: 'Dignité', personality: 'Digne et noble, Rin commande.' },
      ],
      S: [
        { name: 'Sakura', meaning: 'Fleur de cerisier', personality: 'Éphémère et belle, Sakura marque.' },
        { name: 'Sora', meaning: 'Ciel', personality: 'Libre et infinie, Sora rêve.' },
      ],
      Y: [
        { name: 'Yuki', meaning: 'Neige', personality: 'Pure et sereine, Yuki apaise.' },
        { name: 'Yumi', meaning: 'Arc, beauté', personality: 'Gracieuse et belle, Yumi enchante.' },
        { name: 'Yuna', meaning: 'Douceur', personality: 'Douce et tendre, Yuna réconforte.' },
      ],
    },
    boys: {
      A: [
        { name: 'Akira', meaning: 'Lumineux, intelligent', personality: 'Brillant et vif, Akira éclaire.' },
        { name: 'Aoi', meaning: 'Bleu', personality: 'Calme et profond, Aoi apaise.' },
      ],
      D: [
        { name: 'Daichi', meaning: 'Grande terre', personality: 'Stable et ancré, Daichi est solide.' },
        { name: 'Daiki', meaning: 'Grande gloire', personality: 'Glorieux et ambitieux, Daiki vise haut.' },
      ],
      H: [
        { name: 'Haruki', meaning: 'Brillance printanière', personality: 'Radieux et optimiste, Haruki inspire.' },
        { name: 'Hayato', meaning: 'Faucon', personality: 'Vif et perçant, Hayato observe.' },
        { name: 'Hiro', meaning: 'Généreux', personality: 'Généreux et noble, Hiro donne.' },
        { name: 'Hiroshi', meaning: 'Généreux, prospère', personality: 'Prospère et bienveillant, Hiroshi partage.' },
      ],
      K: [
        { name: 'Kaito', meaning: 'Mer et ciel', personality: 'Libre et infini, Kaito rêve.' },
        { name: 'Kenji', meaning: 'Intelligent et fort', personality: 'Brillant et robuste, Kenji excelle.' },
        { name: 'Kenta', meaning: 'Fort et sain', personality: 'Vigoureux et énergique, Kenta vit.' },
        { name: 'Kota', meaning: 'Bonheur et grandeur', personality: 'Joyeux et ambitieux, Kota sourit.' },
      ],
      M: [
        { name: 'Makoto', meaning: 'Sincérité', personality: 'Sincère et honnête, Makoto est vrai.' },
        { name: 'Masashi', meaning: 'Juste et ambitieux', personality: 'Équitable et déterminé, Masashi réussit.' },
      ],
      N: [
        { name: 'Naoki', meaning: 'Arbre honnête', personality: 'Droit et stable, Naoki est fiable.' },
      ],
      R: [
        { name: 'Ren', meaning: 'Lotus', personality: 'Pur et spirituel, Ren s\'élève.' },
        { name: 'Riku', meaning: 'Terre', personality: 'Ancré et stable, Riku est solide.' },
        { name: 'Ryo', meaning: 'Rafraîchissant', personality: 'Frais et revigorant, Ryo inspire.' },
      ],
      S: [
        { name: 'Satoshi', meaning: 'Sage, rapide', personality: 'Intelligent et vif, Satoshi comprend.' },
        { name: 'Shota', meaning: 'Grand vol', personality: 'Ambitieux et libre, Shota s\'envole.' },
        { name: 'Sora', meaning: 'Ciel', personality: 'Libre et infini, Sora rêve.' },
      ],
      T: [
        { name: 'Takeshi', meaning: 'Guerrier, féroce', personality: 'Combattant et fort, Takeshi protège.' },
        { name: 'Taro', meaning: 'Premier fils', personality: 'Responsable et aîné, Taro guide.' },
      ],
      Y: [
        { name: 'Yuki', meaning: 'Neige, bonheur', personality: 'Pur et joyeux, Yuki rayonne.' },
        { name: 'Yuto', meaning: 'Excellence et envol', personality: 'Excellent et ambitieux, Yuto s\'élève.' },
      ],
    },
  },

  // MAROC
  MA: {
    girls: {
      A: [
        { name: 'Amina', meaning: 'Digne de confiance', personality: 'Fiable et loyale, Amina rassure.' },
        { name: 'Asma', meaning: 'Suprême', personality: 'Noble et élevée, Asma inspire.' },
        { name: 'Asmae', meaning: 'Plus belle', personality: 'Belle et gracieuse, Asmae enchante.' },
      ],
      F: [
        { name: 'Fatima', meaning: 'Celle qui sèvre', personality: 'Maternelle et forte, Fatima protège.' },
        { name: 'Fatiha', meaning: 'Ouverture', personality: 'Accueillante et ouverte, Fatiha invite.' },
      ],
      H: [
        { name: 'Hajar', meaning: 'Pierre précieuse', personality: 'Précieuse et rare, Hajar est unique.' },
        { name: 'Hanae', meaning: 'Bonheur', personality: 'Joyeuse et positive, Hanae rayonne.' },
      ],
      I: [
        { name: 'Imane', meaning: 'Foi', personality: 'Croyante et spirituelle, Imane guide.' },
        { name: 'Ines', meaning: 'Chaste', personality: 'Pure et innocente, Ines touche.' },
      ],
      K: [
        { name: 'Khadija', meaning: 'Née avant terme', personality: 'Forte et résiliente, Khadija persévère.' },
        { name: 'Karima', meaning: 'Généreuse', personality: 'Généreuse et bienveillante, Karima donne.' },
      ],
      L: [
        { name: 'Laila', meaning: 'Nuit', personality: 'Mystérieuse et profonde, Laila fascine.' },
        { name: 'Latifa', meaning: 'Douce', personality: 'Douce et tendre, Latifa apaise.' },
      ],
      M: [
        { name: 'Maryam', meaning: 'Aimée', personality: 'Aimante et dévouée, Maryam chérit.' },
        { name: 'Meriem', meaning: 'Étoile de la mer', personality: 'Brillante et guide, Meriem éclaire.' },
      ],
      N: [
        { name: 'Nadia', meaning: 'Espoir', personality: 'Optimiste et positive, Nadia inspire.' },
        { name: 'Naima', meaning: 'Délice', personality: 'Agréable et douce, Naima charme.' },
        { name: 'Nour', meaning: 'Lumière', personality: 'Lumineuse et radieuse, Nour brille.' },
      ],
      S: [
        { name: 'Salma', meaning: 'Paisible', personality: 'Sereine et calme, Salma apaise.' },
        { name: 'Samira', meaning: 'Compagne de veillée', personality: 'Sociable et joyeuse, Samira anime.' },
        { name: 'Sara', meaning: 'Princesse', personality: 'Royale et noble, Sara règne.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sofia conseille.' },
      ],
      Y: [
        { name: 'Yasmine', meaning: 'Fleur de jasmin', personality: 'Parfumée et délicate, Yasmine enchante.' },
      ],
      Z: [
        { name: 'Zahra', meaning: 'Fleur', personality: 'Belle et épanouie, Zahra fleurit.' },
        { name: 'Zineb', meaning: 'Belle plante', personality: 'Naturelle et belle, Zineb rayonne.' },
      ],
    },
    boys: {
      A: [
        { name: 'Adam', meaning: 'Terre', personality: 'Ancré et premier, Adam fonde.' },
        { name: 'Ahmed', meaning: 'Digne de louange', personality: 'Louable et respecté, Ahmed inspire.' },
        { name: 'Ali', meaning: 'Élevé', personality: 'Noble et haut, Ali s\'élève.' },
        { name: 'Amine', meaning: 'Fidèle', personality: 'Loyal et fiable, Amine protège.' },
        { name: 'Ayoub', meaning: 'Patient', personality: 'Patient et endurant, Ayoub persévère.' },
      ],
      H: [
        { name: 'Hamza', meaning: 'Lion', personality: 'Fort et courageux, Hamza protège.' },
        { name: 'Hassan', meaning: 'Beau', personality: 'Beau et charmant, Hassan séduit.' },
      ],
      I: [
        { name: 'Ibrahim', meaning: 'Père des nations', personality: 'Patriarche et sage, Ibrahim guide.' },
        { name: 'Ilyas', meaning: 'Mon Dieu est Yahvé', personality: 'Spirituel et dévoué, Ilyas croit.' },
        { name: 'Ismail', meaning: 'Dieu entend', personality: 'Écouté et béni, Ismail est favorisé.' },
      ],
      K: [
        { name: 'Karim', meaning: 'Généreux', personality: 'Généreux et noble, Karim donne.' },
        { name: 'Khalid', meaning: 'Éternel', personality: 'Durable et fort, Khalid persiste.' },
      ],
      M: [
        { name: 'Mehdi', meaning: 'Guidé', personality: 'Guidé et sage, Mehdi suit le chemin.' },
        { name: 'Mohamed', meaning: 'Loué', personality: 'Louable et respecté, Mohamed inspire.' },
        { name: 'Mouad', meaning: 'Protégé', personality: 'Protégé et béni, Mouad est gardé.' },
        { name: 'Mustapha', meaning: 'Choisi', personality: 'Élu et spécial, Mustapha est unique.' },
      ],
      O: [
        { name: 'Omar', meaning: 'Vie longue', personality: 'Durable et sage, Omar vit longtemps.' },
        { name: 'Othmane', meaning: 'Serpent', personality: 'Sage et prudent, Othmane observe.' },
      ],
      R: [
        { name: 'Rachid', meaning: 'Bien guidé', personality: 'Sage et guidé, Rachid conseille.' },
      ],
      S: [
        { name: 'Said', meaning: 'Heureux', personality: 'Joyeux et positif, Said sourit.' },
        { name: 'Samir', meaning: 'Compagnon de veillée', personality: 'Sociable et agréable, Samir anime.' },
      ],
      Y: [
        { name: 'Yassine', meaning: 'Riche', personality: 'Prospère et béni, Yassine réussit.' },
        { name: 'Youssef', meaning: 'Dieu ajoutera', personality: 'Béni et favorisé, Youssef croît.' },
      ],
      Z: [
        { name: 'Zakaria', meaning: 'Dieu se souvient', personality: 'Mémorable et béni, Zakaria est aimé.' },
      ],
    },
  },
};

// Fonction pour obtenir tous les pays (plat)
export const getAllCountries = () => {
  return [...countries.europe, ...countries.america, ...(countries.asia || []), ...(countries.africa || [])];
};

// Fonction pour vérifier si un contenu est gratuit
export const isContentFree = (countryCode, letter) => {
  return freeCountries.includes(countryCode) && freeLetters.includes(letter);
};

// Alphabet complet
export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
