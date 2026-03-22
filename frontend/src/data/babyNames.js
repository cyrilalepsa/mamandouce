// Base de données des prénoms par pays, genre et lettre
// Structure: pays -> genre -> lettre -> [{ name, meaning, personality }]

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
  ]
};

// Prénoms gratuits (lettres A-E, 3 pays seulement)
export const freeCountries = ['FR', 'US', 'ES'];
export const freeLetters = ['A', 'B', 'C', 'D', 'E'];

// Base de données des prénoms
export const babyNamesData = {
  // FRANCE
  FR: {
    girls: {
      A: [
        { name: 'Adèle', meaning: 'Noble, de haute naissance', personality: 'Élégante et raffinée, Adèle possède une grande sensibilité artistique et un charme naturel.' },
        { name: 'Alice', meaning: 'De noble lignée', personality: 'Curieuse et imaginative, Alice est une rêveuse qui aime explorer de nouveaux mondes.' },
        { name: 'Amélie', meaning: 'Travailleuse, énergique', personality: 'Douce et attentionnée, Amélie est une personne généreuse qui aime aider les autres.' },
        { name: 'Anna', meaning: 'Grâce', personality: 'Simple et authentique, Anna est une personne fiable et loyale.' },
        { name: 'Anaïs', meaning: 'Grâce divine', personality: 'Créative et indépendante, Anaïs possède une forte personnalité.' },
        { name: 'Agathe', meaning: 'Bonne, vertueuse', personality: 'Sage et réfléchie, Agathe est une personne de confiance.' },
        { name: 'Aurore', meaning: 'Lumière du matin', personality: 'Optimiste et rayonnante, Aurore apporte de la joie partout où elle passe.' },
        { name: 'Apolline', meaning: 'Dédiée à Apollon', personality: 'Brillante et charismatique, Apolline attire naturellement l\'attention.' },
        { name: 'Albane', meaning: 'Blanche, pure', personality: 'Pure et sincère, Albane est une personne intègre et honnête.' },
        { name: 'Axelle', meaning: 'Père de la paix', personality: 'Dynamique et sportive, Axelle est une battante qui ne renonce jamais.' },
      ],
      B: [
        { name: 'Béatrice', meaning: 'Celle qui rend heureux', personality: 'Joyeuse et bienveillante, Béatrice répand le bonheur autour d\'elle.' },
        { name: 'Blanche', meaning: 'Pure, blanche', personality: 'Délicate et gracieuse, Blanche possède une élégance naturelle.' },
        { name: 'Brigitte', meaning: 'Force, puissance', personality: 'Forte et déterminée, Brigitte est une leader naturelle.' },
        { name: 'Bénédicte', meaning: 'Bénie', personality: 'Spirituelle et sage, Bénédicte apporte la paix autour d\'elle.' },
        { name: 'Barbara', meaning: 'Étrangère', personality: 'Mystérieuse et intrigante, Barbara fascine son entourage.' },
        { name: 'Bertille', meaning: 'Brillante au combat', personality: 'Combative et courageuse, Bertille ne recule devant rien.' },
      ],
      C: [
        { name: 'Camille', meaning: 'Jeune assistante de cérémonie', personality: 'Polyvalente et adaptable, Camille excelle dans tout ce qu\'elle entreprend.' },
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Indépendante et affirmée, Charlotte sait ce qu\'elle veut.' },
        { name: 'Chloé', meaning: 'Jeune pousse', personality: 'Fraîche et naturelle, Chloé respire la joie de vivre.' },
        { name: 'Clara', meaning: 'Claire, brillante', personality: 'Lumineuse et intelligente, Clara éclaire son entourage.' },
        { name: 'Clémence', meaning: 'Douce, clémente', personality: 'Patiente et compréhensive, Clémence est une amie précieuse.' },
        { name: 'Céline', meaning: 'Céleste, du ciel', personality: 'Rêveuse et romantique, Céline vit dans un monde poétique.' },
        { name: 'Constance', meaning: 'Constante, fidèle', personality: 'Loyale et stable, Constance est un roc sur lequel on peut compter.' },
        { name: 'Capucine', meaning: 'Capuchon de moine', personality: 'Originale et pétillante, Capucine ne passe pas inaperçue.' },
      ],
      D: [
        { name: 'Diane', meaning: 'Divine, lumineuse', personality: 'Majestueuse et indépendante, Diane impressionne par sa prestance.' },
        { name: 'Delphine', meaning: 'Dauphin, de Delphes', personality: 'Intelligente et intuitive, Delphine comprend les autres facilement.' },
        { name: 'Domitille', meaning: 'Apprivoisée', personality: 'Douce et paisible, Domitille apporte la sérénité.' },
        { name: 'Dorothée', meaning: 'Don de Dieu', personality: 'Généreuse et altruiste, Dorothée se dévoue pour les autres.' },
      ],
      E: [
        { name: 'Emma', meaning: 'Toute-puissante', personality: 'Forte et déterminée, Emma est une leader naturelle.' },
        { name: 'Élise', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Élise tient toujours ses promesses.' },
        { name: 'Élodie', meaning: 'Richesse étrangère', personality: 'Voyageuse et ouverte d\'esprit, Élodie aime découvrir de nouvelles cultures.' },
        { name: 'Émilie', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Émilie vise toujours l\'excellence.' },
        { name: 'Eva', meaning: 'Vie', personality: 'Vivante et énergique, Eva profite de chaque instant.' },
        { name: 'Eugénie', meaning: 'Bien née', personality: 'Distinguée et raffinée, Eugénie a une classe naturelle.' },
      ],
      F: [
        { name: 'Florence', meaning: 'Florissante', personality: 'Épanouie et radieuse, Florence s\'épanouit dans tous les domaines.' },
        { name: 'Fleur', meaning: 'Fleur', personality: 'Délicate et belle, Fleur embellit le monde autour d\'elle.' },
        { name: 'Fanny', meaning: 'Couronne, libre', personality: 'Libre et joyeuse, Fanny vit selon ses propres règles.' },
        { name: 'Françoise', meaning: 'Franche, libre', personality: 'Honnête et directe, Françoise dit toujours ce qu\'elle pense.' },
      ],
      G: [
        { name: 'Gabrielle', meaning: 'Force de Dieu', personality: 'Puissante et protectrice, Gabrielle veille sur ses proches.' },
        { name: 'Gaëlle', meaning: 'Généreuse, noble', personality: 'Altruiste et noble de cœur, Gaëlle pense aux autres avant elle-même.' },
        { name: 'Gisèle', meaning: 'Otage, noble', personality: 'Gracieuse et élégante, Gisèle se déplace avec légèreté.' },
      ],
      H: [
        { name: 'Hélène', meaning: 'Éclat du soleil', personality: 'Lumineuse et chaleureuse, Hélène réchauffe les cœurs.' },
        { name: 'Héloïse', meaning: 'Saine, robuste', personality: 'Forte et en bonne santé, Héloïse déborde d\'énergie.' },
        { name: 'Honorine', meaning: 'Honorée', personality: 'Digne et respectable, Honorine inspire le respect.' },
      ],
      I: [
        { name: 'Inès', meaning: 'Pure, chaste', personality: 'Pure et innocente, Inès garde son cœur d\'enfant.' },
        { name: 'Iris', meaning: 'Arc-en-ciel', personality: 'Colorée et joyeuse, Iris apporte de la couleur dans la vie.' },
        { name: 'Isabelle', meaning: 'Dieu est mon serment', personality: 'Fidèle et dévouée, Isabelle est une amie pour la vie.' },
      ],
      J: [
        { name: 'Jade', meaning: 'Pierre précieuse', personality: 'Précieuse et unique, Jade est un trésor rare.' },
        { name: 'Jeanne', meaning: 'Dieu fait grâce', personality: 'Courageuse et déterminée, Jeanne se bat pour ses convictions.' },
        { name: 'Julie', meaning: 'De la famille de Jules', personality: 'Douce et aimante, Julie prend soin de son entourage.' },
        { name: 'Juliette', meaning: 'Petite Julie', personality: 'Romantique et passionnée, Juliette vit intensément.' },
        { name: 'Justine', meaning: 'Juste', personality: 'Équitable et honnête, Justine défend la justice.' },
      ],
      K: [
        { name: 'Karen', meaning: 'Pure', personality: 'Simple et authentique, Karen est une personne de confiance.' },
        { name: 'Karine', meaning: 'Pure', personality: 'Claire et transparente, Karine ne cache rien.' },
      ],
      L: [
        { name: 'Léa', meaning: 'Lionne', personality: 'Forte et courageuse, Léa protège les siens.' },
        { name: 'Louise', meaning: 'Glorieuse combattante', personality: 'Combative et déterminée, Louise ne renonce jamais.' },
        { name: 'Lucie', meaning: 'Lumière', personality: 'Lumineuse et brillante, Lucie éclaire son chemin.' },
        { name: 'Lola', meaning: 'Douleurs', personality: 'Sensible et empathique, Lola comprend la souffrance des autres.' },
        { name: 'Léonie', meaning: 'Lionne', personality: 'Majestueuse et fière, Léonie en impose.' },
        { name: 'Lilou', meaning: 'Lys', personality: 'Pure et délicate, Lilou est une fleur précieuse.' },
      ],
      M: [
        { name: 'Manon', meaning: 'Celle qui élève', personality: 'Maternelle et protectrice, Manon prend soin des autres.' },
        { name: 'Marie', meaning: 'Aimée, goutte de mer', personality: 'Douce et aimante, Marie est un océan de tendresse.' },
        { name: 'Margaux', meaning: 'Perle', personality: 'Précieuse et raffinée, Margaux est un joyau rare.' },
        { name: 'Mathilde', meaning: 'Puissante au combat', personality: 'Forte et déterminée, Mathilde est une guerrière.' },
        { name: 'Mélanie', meaning: 'Noire, sombre', personality: 'Mystérieuse et profonde, Mélanie cache des trésors.' },
        { name: 'Morgane', meaning: 'Née de la mer', personality: 'Libre comme l\'océan, Morgane suit son propre courant.' },
      ],
      N: [
        { name: 'Nina', meaning: 'Grâce', personality: 'Gracieuse et élégante, Nina danse dans la vie.' },
        { name: 'Noémie', meaning: 'Agréable, douce', personality: 'Agréable et douce, Noémie est un plaisir à côtoyer.' },
        { name: 'Nathalie', meaning: 'Jour de naissance', personality: 'Festive et joyeuse, Nathalie célèbre chaque jour.' },
      ],
      O: [
        { name: 'Océane', meaning: 'Océan', personality: 'Vaste et profonde, Océane a des ressources infinies.' },
        { name: 'Ophélie', meaning: 'Aide, secours', personality: 'Serviable et généreuse, Ophélie aide toujours.' },
        { name: 'Olivia', meaning: 'Olivier, paix', personality: 'Paisible et sereine, Olivia apporte la paix.' },
      ],
      P: [
        { name: 'Pauline', meaning: 'Petite', personality: 'Humble et modeste, Pauline ne se vante jamais.' },
        { name: 'Philippine', meaning: 'Ami des chevaux', personality: 'Libre et sauvage, Philippine aime la nature.' },
        { name: 'Priscille', meaning: 'Ancienne', personality: 'Sage et expérimentée, Priscille a la sagesse des anciens.' },
      ],
      Q: [
        { name: 'Quitterie', meaning: 'Tranquille', personality: 'Calme et sereine, Quitterie apporte la paix.' },
      ],
      R: [
        { name: 'Rose', meaning: 'Rose, fleur', personality: 'Belle et parfumée, Rose embellit la vie.' },
        { name: 'Romane', meaning: 'Romaine', personality: 'Forte et endurante, Romane a la force des Romains.' },
        { name: 'Rachel', meaning: 'Brebis', personality: 'Douce et docile, Rachel suit son cœur.' },
      ],
      S: [
        { name: 'Sarah', meaning: 'Princesse', personality: 'Royale et majestueuse, Sarah règne avec grâce.' },
        { name: 'Sophie', meaning: 'Sagesse', personality: 'Sage et intelligente, Sophie prend les bonnes décisions.' },
        { name: 'Solène', meaning: 'Solennelle', personality: 'Sérieuse et digne, Solène inspire le respect.' },
        { name: 'Stéphanie', meaning: 'Couronnée', personality: 'Victorieuse et accomplie, Stéphanie réussit tout.' },
      ],
      T: [
        { name: 'Théa', meaning: 'Déesse', personality: 'Divine et inspirante, Théa est une muse.' },
        { name: 'Tiphaine', meaning: 'Apparition de Dieu', personality: 'Spirituelle et lumineuse, Tiphaine éclaire les âmes.' },
      ],
      U: [
        { name: 'Ursule', meaning: 'Petite ourse', personality: 'Protectrice et maternelle, Ursule veille sur les siens.' },
      ],
      V: [
        { name: 'Valentine', meaning: 'Vigoureuse, forte', personality: 'Forte et passionnée, Valentine aime intensément.' },
        { name: 'Victoire', meaning: 'Victoire', personality: 'Gagnante et déterminée, Victoire ne connaît pas la défaite.' },
        { name: 'Violette', meaning: 'Violet, fleur', personality: 'Discrète et modeste, Violette cache une beauté secrète.' },
      ],
      W: [
        { name: 'Wendy', meaning: 'Amie', personality: 'Amicale et loyale, Wendy est une amie précieuse.' },
      ],
      X: [
        { name: 'Xénia', meaning: 'Hospitalière', personality: 'Accueillante et généreuse, Xénia ouvre sa maison à tous.' },
      ],
      Y: [
        { name: 'Yasmine', meaning: 'Jasmin', personality: 'Parfumée et délicate, Yasmine embaume l\'air.' },
        { name: 'Yvonne', meaning: 'If', personality: 'Solide et durable, Yvonne traverse le temps.' },
      ],
      Z: [
        { name: 'Zoé', meaning: 'Vie', personality: 'Vivante et dynamique, Zoé célèbre chaque instant.' },
        { name: 'Zélie', meaning: 'Zèle', personality: 'Enthousiaste et passionnée, Zélie se donne à fond.' },
      ],
    },
    boys: {
      A: [
        { name: 'Adam', meaning: 'Fait de terre rouge', personality: 'Premier et originel, Adam est un pionnier qui ouvre la voie.' },
        { name: 'Alexandre', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et courageux, Alexandre défend les plus faibles.' },
        { name: 'Antoine', meaning: 'Inestimable', personality: 'Précieux et unique, Antoine est un ami irremplaçable.' },
        { name: 'Arthur', meaning: 'Ours noble', personality: 'Fort et noble, Arthur est un leader naturel.' },
        { name: 'Augustin', meaning: 'Vénérable', personality: 'Sage et respecté, Augustin inspire confiance.' },
        { name: 'Axel', meaning: 'Père de la paix', personality: 'Pacifique et diplomate, Axel résout les conflits.' },
        { name: 'Adrien', meaning: 'De la mer Adriatique', personality: 'Aventurier et curieux, Adrien explore le monde.' },
        { name: 'Arnaud', meaning: 'Aigle puissant', personality: 'Majestueux et visionnaire, Arnaud voit loin.' },
      ],
      B: [
        { name: 'Baptiste', meaning: 'Celui qui baptise', personality: 'Spirituel et bienveillant, Baptiste guide les autres.' },
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Chanceux et talentueux, Benjamin réussit facilement.' },
        { name: 'Benoît', meaning: 'Béni', personality: 'Béni et heureux, Benoît rayonne de joie.' },
        { name: 'Bruno', meaning: 'Brun, armure', personality: 'Protecteur et solide, Bruno est un bouclier.' },
      ],
      C: [
        { name: 'Clément', meaning: 'Doux, clément', personality: 'Patient et compréhensif, Clément pardonne facilement.' },
        { name: 'Charles', meaning: 'Homme libre', personality: 'Libre et indépendant, Charles suit son propre chemin.' },
        { name: 'Christophe', meaning: 'Porteur du Christ', personality: 'Dévoué et fidèle, Christophe porte les autres.' },
        { name: 'Cyril', meaning: 'Seigneur', personality: 'Noble et digne, Cyril commande le respect.' },
        { name: 'Colin', meaning: 'Jeune chiot', personality: 'Joueur et énergique, Colin apporte la joie.' },
      ],
      D: [
        { name: 'Damien', meaning: 'Dompter', personality: 'Maître de lui-même, Damien contrôle ses émotions.' },
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé de tous, David attire naturellement l\'affection.' },
        { name: 'Denis', meaning: 'Consacré à Dionysos', personality: 'Festif et joyeux, Denis aime célébrer.' },
        { name: 'Dylan', meaning: 'Fils de la mer', personality: 'Libre comme la mer, Dylan suit le courant.' },
      ],
      E: [
        { name: 'Émile', meaning: 'Rival', personality: 'Compétitif et ambitieux, Émile vise la première place.' },
        { name: 'Étienne', meaning: 'Couronné', personality: 'Victorieux et accompli, Étienne atteint ses objectifs.' },
        { name: 'Emmanuel', meaning: 'Dieu est avec nous', personality: 'Protégé et guidé, Emmanuel a foi en la vie.' },
        { name: 'Éric', meaning: 'Roi pour toujours', personality: 'Royal et éternel, Éric laisse sa marque.' },
        { name: 'Édouard', meaning: 'Gardien des richesses', personality: 'Prudent et responsable, Édouard gère avec sagesse.' },
      ],
      F: [
        { name: 'Fabien', meaning: 'Fève', personality: 'Simple et terre-à-terre, Fabien garde les pieds sur terre.' },
        { name: 'Florian', meaning: 'Fleuri', personality: 'Épanoui et radieux, Florian s\'épanouit partout.' },
        { name: 'François', meaning: 'Franc, libre', personality: 'Honnête et direct, François dit la vérité.' },
        { name: 'Frédéric', meaning: 'Paix du souverain', personality: 'Paisible et noble, Frédéric règne avec sagesse.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et protecteur, Gabriel veille sur les autres.' },
        { name: 'Gauthier', meaning: 'Chef d\'armée', personality: 'Leader et stratège, Gauthier mène ses troupes.' },
        { name: 'Guillaume', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Guillaume ne lâche rien.' },
        { name: 'Grégoire', meaning: 'Vigilant', personality: 'Attentif et prudent, Grégoire ne rate rien.' },
      ],
      H: [
        { name: 'Henri', meaning: 'Maître de maison', personality: 'Responsable et fiable, Henri gère sa maison.' },
        { name: 'Hugo', meaning: 'Esprit, intelligence', personality: 'Brillant et créatif, Hugo a des idées géniales.' },
        { name: 'Hervé', meaning: 'Combat digne', personality: 'Honorable et courageux, Hervé se bat avec honneur.' },
      ],
      I: [
        { name: 'Isaac', meaning: 'Il rira', personality: 'Joyeux et optimiste, Isaac voit toujours le bon côté.' },
        { name: 'Ivan', meaning: 'Dieu fait grâce', personality: 'Béni et reconnaissant, Ivan apprécie chaque moment.' },
      ],
      J: [
        { name: 'Jules', meaning: 'De la famille de Jules', personality: 'Noble et distingué, Jules a de la classe.' },
        { name: 'Julien', meaning: 'De la famille de Jules', personality: 'Raffiné et élégant, Julien a du style.' },
        { name: 'Jean', meaning: 'Dieu fait grâce', personality: 'Traditionnel et fiable, Jean est un pilier.' },
        { name: 'Jacques', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jacques planifie tout.' },
        { name: 'Jérôme', meaning: 'Nom sacré', personality: 'Spirituel et sage, Jérôme cherche le sens.' },
      ],
      K: [
        { name: 'Kevin', meaning: 'Beau de naissance', personality: 'Charmant et séduisant, Kevin attire les regards.' },
        { name: 'Killian', meaning: 'Église, conflit', personality: 'Combatif et fidèle, Killian défend ses convictions.' },
      ],
      L: [
        { name: 'Louis', meaning: 'Glorieux combattant', personality: 'Victorieux et noble, Louis triomphe toujours.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire son chemin.' },
        { name: 'Léo', meaning: 'Lion', personality: 'Courageux et fier, Léo rugit face à l\'adversité.' },
        { name: 'Laurent', meaning: 'Laurier', personality: 'Victorieux et couronné, Laurent gagne ses combats.' },
        { name: 'Luc', meaning: 'Lumière', personality: 'Clair et transparent, Luc illumine les esprits.' },
      ],
      M: [
        { name: 'Mathieu', meaning: 'Don de Dieu', personality: 'Béni et généreux, Mathieu partage ses dons.' },
        { name: 'Maxime', meaning: 'Le plus grand', personality: 'Ambitieux et déterminé, Maxime vise haut.' },
        { name: 'Martin', meaning: 'Guerrier de Mars', personality: 'Combatif et courageux, Martin ne recule jamais.' },
        { name: 'Marc', meaning: 'Consacré à Mars', personality: 'Fort et martial, Marc est un guerrier.' },
        { name: 'Michel', meaning: 'Qui est comme Dieu', personality: 'Humble et spirituel, Michel cherche la divinité.' },
      ],
      N: [
        { name: 'Nathan', meaning: 'Donné par Dieu', personality: 'Béni et précieux, Nathan est un cadeau.' },
        { name: 'Nicolas', meaning: 'Victoire du peuple', personality: 'Populaire et victorieux, Nicolas rassemble.' },
        { name: 'Noé', meaning: 'Repos, consolation', personality: 'Apaisant et réconfortant, Noé calme les tempêtes.' },
      ],
      O: [
        { name: 'Olivier', meaning: 'Olivier, paix', personality: 'Pacifique et sage, Olivier apporte la paix.' },
        { name: 'Oscar', meaning: 'Lance divine', personality: 'Divin et puissant, Oscar impressionne.' },
      ],
      P: [
        { name: 'Paul', meaning: 'Petit', personality: 'Humble et modeste, Paul ne se vante jamais.' },
        { name: 'Pierre', meaning: 'Roc, pierre', personality: 'Solide et fiable, Pierre est un roc.' },
        { name: 'Philippe', meaning: 'Ami des chevaux', personality: 'Libre et noble, Philippe aime la liberté.' },
        { name: 'Patrick', meaning: 'Noble', personality: 'Distingué et digne, Patrick a de la prestance.' },
      ],
      Q: [
        { name: 'Quentin', meaning: 'Cinquième', personality: 'Équilibré et harmonieux, Quentin trouve sa place.' },
      ],
      R: [
        { name: 'Raphaël', meaning: 'Dieu guérit', personality: 'Guérisseur et bienveillant, Raphaël soigne les âmes.' },
        { name: 'Romain', meaning: 'Romain', personality: 'Fort et endurant, Romain a la force des Romains.' },
        { name: 'Rémi', meaning: 'Rameur', personality: 'Travailleur et persévérant, Rémi avance toujours.' },
        { name: 'Robin', meaning: 'Gloire brillante', personality: 'Brillant et glorieux, Robin illumine.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et compris, Samuel comprend les autres.' },
        { name: 'Simon', meaning: 'Qui écoute', personality: 'Attentif et sage, Simon écoute avant de parler.' },
        { name: 'Sébastien', meaning: 'Vénérable', personality: 'Respectable et digne, Sébastien inspire le respect.' },
        { name: 'Stéphane', meaning: 'Couronné', personality: 'Victorieux et accompli, Stéphane réussit.' },
      ],
      T: [
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Connecté et empathique, Thomas ressent les autres.' },
        { name: 'Théo', meaning: 'Dieu', personality: 'Divin et inspiré, Théo a la foi.' },
        { name: 'Thibault', meaning: 'Peuple audacieux', personality: 'Courageux et populaire, Thibault ose.' },
        { name: 'Timothée', meaning: 'Qui honore Dieu', personality: 'Spirituel et dévoué, Timothée honore ses engagements.' },
      ],
      U: [
        { name: 'Ulysse', meaning: 'Celui qui déteste', personality: 'Voyageur et courageux, Ulysse explore le monde.' },
      ],
      V: [
        { name: 'Victor', meaning: 'Vainqueur', personality: 'Gagnant et déterminé, Victor triomphe toujours.' },
        { name: 'Vincent', meaning: 'Qui conquiert', personality: 'Conquérant et ambitieux, Vincent atteint ses objectifs.' },
        { name: 'Valentin', meaning: 'Vigoureux, fort', personality: 'Fort et passionné, Valentin aime intensément.' },
      ],
      W: [
        { name: 'William', meaning: 'Volonté et protection', personality: 'Protecteur et déterminé, William défend les siens.' },
      ],
      X: [
        { name: 'Xavier', meaning: 'Maison neuve', personality: 'Bâtisseur et créateur, Xavier construit son avenir.' },
      ],
      Y: [
        { name: 'Yann', meaning: 'Dieu fait grâce', personality: 'Béni et reconnaissant, Yann apprécie la vie.' },
        { name: 'Yves', meaning: 'If', personality: 'Solide et durable, Yves traverse le temps.' },
      ],
      Z: [
        { name: 'Zacharie', meaning: 'Dieu se souvient', personality: 'Mémorable et inoubliable, Zacharie laisse sa marque.' },
      ],
    },
  },

  // ÉTATS-UNIS
  US: {
    girls: {
      A: [
        { name: 'Abigail', meaning: 'Joie du père', personality: 'Joyeuse et aimante, Abigail apporte le bonheur.' },
        { name: 'Addison', meaning: 'Fils d\'Adam', personality: 'Moderne et dynamique, Addison innove.' },
        { name: 'Alexandra', meaning: 'Protectrice de l\'humanité', personality: 'Forte et protectrice, Alexandra défend les autres.' },
        { name: 'Allison', meaning: 'Noble', personality: 'Distinguée et élégante, Allison a de la classe.' },
        { name: 'Amelia', meaning: 'Travailleuse', personality: 'Déterminée et ambitieuse, Amelia atteint ses objectifs.' },
        { name: 'Aria', meaning: 'Air, mélodie', personality: 'Musicale et légère, Aria chante la vie.' },
        { name: 'Audrey', meaning: 'Noble force', personality: 'Élégante et forte, Audrey impressionne.' },
        { name: 'Aurora', meaning: 'Aurore', personality: 'Lumineuse et nouvelle, Aurora annonce de beaux jours.' },
        { name: 'Ava', meaning: 'Vie', personality: 'Vivante et énergique, Ava célèbre l\'existence.' },
        { name: 'Avery', meaning: 'Conseiller des elfes', personality: 'Sage et mystérieuse, Avery guide les autres.' },
      ],
      B: [
        { name: 'Bailey', meaning: 'Bailli', personality: 'Responsable et fiable, Bailey gère avec compétence.' },
        { name: 'Bella', meaning: 'Belle', personality: 'Belle et gracieuse, Bella charme tout le monde.' },
        { name: 'Brooklyn', meaning: 'Ruisseau', personality: 'Fluide et adaptable, Brooklyn suit son cours.' },
        { name: 'Brooke', meaning: 'Ruisseau', personality: 'Claire et rafraîchissante, Brooke purifie.' },
      ],
      C: [
        { name: 'Camila', meaning: 'Assistante de cérémonie', personality: 'Gracieuse et serviable, Camila aide avec élégance.' },
        { name: 'Caroline', meaning: 'Femme libre', personality: 'Indépendante et forte, Caroline vit selon ses règles.' },
        { name: 'Charlotte', meaning: 'Femme libre', personality: 'Classique et élégante, Charlotte a du style.' },
        { name: 'Chloe', meaning: 'Jeune pousse verte', personality: 'Fraîche et naturelle, Chloe respire la vie.' },
        { name: 'Claire', meaning: 'Claire, brillante', personality: 'Lumineuse et intelligente, Claire éclaire.' },
      ],
      D: [
        { name: 'Daisy', meaning: 'Marguerite', personality: 'Joyeuse et simple, Daisy embellit le quotidien.' },
        { name: 'Destiny', meaning: 'Destin', personality: 'Destinée et unique, Destiny a un but.' },
      ],
      E: [
        { name: 'Eleanor', meaning: 'Lumière brillante', personality: 'Brillante et inspirante, Eleanor guide.' },
        { name: 'Elizabeth', meaning: 'Dieu est serment', personality: 'Noble et fidèle, Elizabeth tient parole.' },
        { name: 'Ella', meaning: 'Belle fée', personality: 'Magique et charmante, Ella enchante.' },
        { name: 'Emily', meaning: 'Rivale', personality: 'Compétitive et ambitieuse, Emily vise l\'excellence.' },
        { name: 'Emma', meaning: 'Universelle', personality: 'Aimée de tous, Emma est universelle.' },
        { name: 'Evelyn', meaning: 'Vie souhaitée', personality: 'Désirée et précieuse, Evelyn est un trésor.' },
      ],
      F: [
        { name: 'Faith', meaning: 'Foi', personality: 'Croyante et confiante, Faith a foi en la vie.' },
        { name: 'Fiona', meaning: 'Blanche, belle', personality: 'Pure et belle, Fiona rayonne.' },
      ],
      G: [
        { name: 'Gabriella', meaning: 'Force de Dieu', personality: 'Puissante et gracieuse, Gabriella impressionne.' },
        { name: 'Grace', meaning: 'Grâce', personality: 'Gracieuse et élégante, Grace danse dans la vie.' },
      ],
      H: [
        { name: 'Hailey', meaning: 'Prairie de foin', personality: 'Naturelle et simple, Hailey aime la nature.' },
        { name: 'Hannah', meaning: 'Grâce', personality: 'Gracieuse et douce, Hannah apaise.' },
        { name: 'Harper', meaning: 'Joueur de harpe', personality: 'Musicale et artistique, Harper crée de la beauté.' },
        { name: 'Hazel', meaning: 'Noisetier', personality: 'Naturelle et sage, Hazel est connectée à la terre.' },
      ],
      I: [
        { name: 'Isabella', meaning: 'Dévouée à Dieu', personality: 'Fidèle et dévouée, Isabella tient ses promesses.' },
        { name: 'Ivy', meaning: 'Lierre', personality: 'Persistante et fidèle, Ivy s\'accroche.' },
      ],
      J: [
        { name: 'Jasmine', meaning: 'Jasmin', personality: 'Parfumée et exotique, Jasmine enchante les sens.' },
        { name: 'Jessica', meaning: 'Dieu regarde', personality: 'Observée et protégée, Jessica est guidée.' },
        { name: 'Julia', meaning: 'Jeune', personality: 'Éternellement jeune, Julia garde sa fraîcheur.' },
      ],
      K: [
        { name: 'Katherine', meaning: 'Pure', personality: 'Pure et noble, Katherine a de la classe.' },
        { name: 'Kaylee', meaning: 'Couronne de laurier', personality: 'Victorieuse et joyeuse, Kaylee célèbre.' },
        { name: 'Kennedy', meaning: 'Chef casqué', personality: 'Leader et protectrice, Kennedy guide.' },
        { name: 'Kylie', meaning: 'Boomerang', personality: 'Qui revient toujours, Kylie est fidèle.' },
      ],
      L: [
        { name: 'Layla', meaning: 'Nuit', personality: 'Mystérieuse et belle, Layla fascine.' },
        { name: 'Leah', meaning: 'Fatiguée, lionne', personality: 'Forte malgré tout, Leah persévère.' },
        { name: 'Lily', meaning: 'Lys', personality: 'Pure et belle, Lily est une fleur précieuse.' },
        { name: 'Luna', meaning: 'Lune', personality: 'Mystérieuse et lumineuse, Luna éclaire la nuit.' },
      ],
      M: [
        { name: 'Mackenzie', meaning: 'Enfant du chef sage', personality: 'Sage et leader, Mackenzie guide.' },
        { name: 'Madison', meaning: 'Fils de Maud', personality: 'Forte et déterminée, Madison avance.' },
        { name: 'Maya', meaning: 'Illusion', personality: 'Mystérieuse et profonde, Maya intrigue.' },
        { name: 'Mia', meaning: 'Mienne', personality: 'Précieuse et unique, Mia est irremplaçable.' },
      ],
      N: [
        { name: 'Natalie', meaning: 'Jour de naissance', personality: 'Festive et joyeuse, Natalie célèbre la vie.' },
        { name: 'Nevaeh', meaning: 'Ciel (à l\'envers)', personality: 'Céleste et unique, Nevaeh est divine.' },
        { name: 'Nora', meaning: 'Honneur', personality: 'Honorable et digne, Nora inspire le respect.' },
      ],
      O: [
        { name: 'Olivia', meaning: 'Olivier', personality: 'Paisible et sage, Olivia apporte la paix.' },
      ],
      P: [
        { name: 'Penelope', meaning: 'Tisseuse', personality: 'Patiente et créative, Penelope tisse sa vie.' },
        { name: 'Peyton', meaning: 'Domaine du combattant', personality: 'Forte et territoriale, Peyton défend les siens.' },
      ],
      Q: [
        { name: 'Quinn', meaning: 'Sage, intelligent', personality: 'Sage et réfléchi, Quinn pense avant d\'agir.' },
      ],
      R: [
        { name: 'Reagan', meaning: 'Petit roi', personality: 'Royale et leader, Reagan commande.' },
        { name: 'Riley', meaning: 'Courageux', personality: 'Brave et audacieuse, Riley ose.' },
        { name: 'Ruby', meaning: 'Rubis', personality: 'Précieuse et passionnée, Ruby brûle d\'intensité.' },
      ],
      S: [
        { name: 'Samantha', meaning: 'Écoutée par Dieu', personality: 'Entendue et comprise, Samantha est écoutée.' },
        { name: 'Sarah', meaning: 'Princesse', personality: 'Royale et gracieuse, Sarah règne avec élégance.' },
        { name: 'Savannah', meaning: 'Plaine ouverte', personality: 'Libre et ouverte, Savannah explore.' },
        { name: 'Scarlett', meaning: 'Rouge écarlate', personality: 'Passionnée et intense, Scarlett vit pleinement.' },
        { name: 'Sofia', meaning: 'Sagesse', personality: 'Sage et intelligente, Sofia prend de bonnes décisions.' },
        { name: 'Sophia', meaning: 'Sagesse', personality: 'Sage et réfléchie, Sophia est une conseillère.' },
        { name: 'Stella', meaning: 'Étoile', personality: 'Brillante et lumineuse, Stella guide dans la nuit.' },
      ],
      T: [
        { name: 'Taylor', meaning: 'Tailleur', personality: 'Créative et précise, Taylor façonne sa vie.' },
      ],
      U: [
        { name: 'Uma', meaning: 'Tranquillité', personality: 'Calme et sereine, Uma apporte la paix.' },
      ],
      V: [
        { name: 'Victoria', meaning: 'Victoire', personality: 'Victorieuse et déterminée, Victoria triomphe.' },
        { name: 'Violet', meaning: 'Violette', personality: 'Discrète et belle, Violet cache une beauté secrète.' },
      ],
      W: [
        { name: 'Willow', meaning: 'Saule', personality: 'Flexible et gracieuse, Willow s\'adapte.' },
      ],
      X: [
        { name: 'Ximena', meaning: 'Celle qui écoute', personality: 'Attentive et sage, Ximena entend tout.' },
      ],
      Y: [
        { name: 'Yasmin', meaning: 'Jasmin', personality: 'Parfumée et exotique, Yasmin enchante.' },
      ],
      Z: [
        { name: 'Zoe', meaning: 'Vie', personality: 'Vivante et joyeuse, Zoe célèbre l\'existence.' },
        { name: 'Zoey', meaning: 'Vie', personality: 'Énergique et enthousiaste, Zoey vit intensément.' },
      ],
    },
    boys: {
      A: [
        { name: 'Aaron', meaning: 'Montagne de force', personality: 'Fort et stable, Aaron est un pilier.' },
        { name: 'Adam', meaning: 'Terre rouge', personality: 'Originel et authentique, Adam est un fondateur.' },
        { name: 'Aiden', meaning: 'Petit feu', personality: 'Passionné et ardent, Aiden brûle de vie.' },
        { name: 'Alexander', meaning: 'Défenseur de l\'humanité', personality: 'Protecteur et noble, Alexander défend.' },
        { name: 'Andrew', meaning: 'Viril, courageux', personality: 'Brave et fort, Andrew fait face.' },
        { name: 'Anthony', meaning: 'Inestimable', personality: 'Précieux et unique, Anthony est irremplaçable.' },
        { name: 'Austin', meaning: 'Majestueux', personality: 'Impressionnant et noble, Austin en impose.' },
      ],
      B: [
        { name: 'Benjamin', meaning: 'Fils de la main droite', personality: 'Favorisé et talentueux, Benjamin excelle.' },
        { name: 'Blake', meaning: 'Sombre, brillant', personality: 'Mystérieux et lumineux, Blake intrigue.' },
        { name: 'Brandon', meaning: 'Colline couverte de genêts', personality: 'Naturel et solide, Brandon est ancré.' },
        { name: 'Brayden', meaning: 'Descendant de Bradan', personality: 'Héritier et fier, Brayden honore ses ancêtres.' },
      ],
      C: [
        { name: 'Caleb', meaning: 'Fidèle, dévoué', personality: 'Loyal et dévoué, Caleb ne trahit jamais.' },
        { name: 'Cameron', meaning: 'Nez crochu', personality: 'Observateur et fin, Cameron ne rate rien.' },
        { name: 'Carter', meaning: 'Conducteur de chariot', personality: 'Travailleur et fiable, Carter transporte.' },
        { name: 'Charles', meaning: 'Homme libre', personality: 'Libre et noble, Charles vit selon ses principes.' },
        { name: 'Christian', meaning: 'Disciple du Christ', personality: 'Fidèle et dévoué, Christian suit son chemin.' },
        { name: 'Christopher', meaning: 'Porteur du Christ', personality: 'Protecteur et guide, Christopher porte les autres.' },
        { name: 'Connor', meaning: 'Amoureux des loups', personality: 'Sauvage et loyal, Connor protège sa meute.' },
      ],
      D: [
        { name: 'Daniel', meaning: 'Dieu est mon juge', personality: 'Juste et intègre, Daniel juge avec sagesse.' },
        { name: 'David', meaning: 'Bien-aimé', personality: 'Aimé et charismatique, David attire l\'affection.' },
        { name: 'Dylan', meaning: 'Fils de la mer', personality: 'Libre et profond, Dylan explore les profondeurs.' },
      ],
      E: [
        { name: 'Elijah', meaning: 'Mon Dieu est Yahweh', personality: 'Spirituel et puissant, Elijah inspire.' },
        { name: 'Ethan', meaning: 'Fort, ferme', personality: 'Solide et fiable, Ethan ne vacille pas.' },
        { name: 'Evan', meaning: 'Dieu est gracieux', personality: 'Béni et gracieux, Evan rayonne.' },
      ],
      F: [
        { name: 'Finn', meaning: 'Blanc, juste', personality: 'Pur et juste, Finn agit avec droiture.' },
      ],
      G: [
        { name: 'Gabriel', meaning: 'Force de Dieu', personality: 'Puissant et messager, Gabriel annonce.' },
        { name: 'Gavin', meaning: 'Faucon blanc', personality: 'Vif et noble, Gavin vole haut.' },
        { name: 'Grayson', meaning: 'Fils du bailli', personality: 'Responsable et juste, Grayson gère.' },
      ],
      H: [
        { name: 'Henry', meaning: 'Maître de maison', personality: 'Chef et responsable, Henry dirige.' },
        { name: 'Hunter', meaning: 'Chasseur', personality: 'Traqueur et déterminé, Hunter atteint sa cible.' },
      ],
      I: [
        { name: 'Isaac', meaning: 'Il rira', personality: 'Joyeux et optimiste, Isaac voit le bon côté.' },
        { name: 'Isaiah', meaning: 'Dieu est salut', personality: 'Sauveur et guide, Isaiah montre la voie.' },
      ],
      J: [
        { name: 'Jack', meaning: 'Dieu est gracieux', personality: 'Classique et fiable, Jack est un pilier.' },
        { name: 'Jackson', meaning: 'Fils de Jack', personality: 'Héritier et fort, Jackson continue la lignée.' },
        { name: 'Jacob', meaning: 'Supplanteur', personality: 'Stratège et intelligent, Jacob planifie.' },
        { name: 'James', meaning: 'Supplanteur', personality: 'Noble et classique, James a de la prestance.' },
        { name: 'Jason', meaning: 'Guérisseur', personality: 'Soignant et bienveillant, Jason aide.' },
        { name: 'Jayden', meaning: 'Dieu a entendu', personality: 'Écouté et compris, Jayden communique.' },
        { name: 'John', meaning: 'Dieu est gracieux', personality: 'Traditionnel et solide, John est un roc.' },
        { name: 'Jonathan', meaning: 'Don de Dieu', personality: 'Béni et généreux, Jonathan partage.' },
        { name: 'Joseph', meaning: 'Il ajoutera', personality: 'Croissant et prospère, Joseph multiplie.' },
        { name: 'Joshua', meaning: 'Dieu est salut', personality: 'Sauveur et leader, Joshua guide.' },
        { name: 'Julian', meaning: 'Jeune', personality: 'Éternel jeune, Julian garde sa fraîcheur.' },
        { name: 'Justin', meaning: 'Juste', personality: 'Équitable et honnête, Justin agit avec justice.' },
      ],
      K: [
        { name: 'Kevin', meaning: 'Beau de naissance', personality: 'Charmant et aimable, Kevin séduit.' },
        { name: 'Kyle', meaning: 'Étroit', personality: 'Concentré et précis, Kyle va à l\'essentiel.' },
      ],
      L: [
        { name: 'Landon', meaning: 'Longue colline', personality: 'Patient et persévérant, Landon grimpe.' },
        { name: 'Leo', meaning: 'Lion', personality: 'Courageux et royal, Leo règne.' },
        { name: 'Liam', meaning: 'Volonté et protection', personality: 'Déterminé et protecteur, Liam défend.' },
        { name: 'Logan', meaning: 'Petite cavité', personality: 'Mystérieux et profond, Logan cache des trésors.' },
        { name: 'Lucas', meaning: 'Lumière', personality: 'Lumineux et brillant, Lucas éclaire.' },
        { name: 'Luke', meaning: 'Lumière', personality: 'Clair et guidant, Luke montre la voie.' },
      ],
      M: [
        { name: 'Mason', meaning: 'Tailleur de pierre', personality: 'Constructeur et solide, Mason bâtit.' },
        { name: 'Matthew', meaning: 'Don de Dieu', personality: 'Béni et généreux, Matthew donne.' },
        { name: 'Michael', meaning: 'Qui est comme Dieu', personality: 'Divin et protecteur, Michael veille.' },
      ],
      N: [
        { name: 'Nathan', meaning: 'Il a donné', personality: 'Généreux et donneur, Nathan partage.' },
        { name: 'Nicholas', meaning: 'Victoire du peuple', personality: 'Victorieux et populaire, Nicholas rassemble.' },
        { name: 'Noah', meaning: 'Repos, confort', personality: 'Apaisant et sage, Noah calme.' },
      ],
      O: [
        { name: 'Oliver', meaning: 'Olivier', personality: 'Paisible et sage, Oliver apporte la paix.' },
        { name: 'Owen', meaning: 'Jeune guerrier', personality: 'Combatif et jeune, Owen se bat.' },
      ],
      P: [
        { name: 'Patrick', meaning: 'Noble', personality: 'Distingué et fier, Patrick a de la classe.' },
      ],
      Q: [
        { name: 'Quentin', meaning: 'Cinquième', personality: 'Équilibré et harmonieux, Quentin trouve sa place.' },
      ],
      R: [
        { name: 'Ryan', meaning: 'Petit roi', personality: 'Royal et leader, Ryan commande.' },
      ],
      S: [
        { name: 'Samuel', meaning: 'Dieu a entendu', personality: 'Écouté et sage, Samuel conseille.' },
        { name: 'Sean', meaning: 'Dieu est gracieux', personality: 'Béni et charmant, Sean plaît.' },
        { name: 'Sebastian', meaning: 'Vénérable', personality: 'Respectable et digne, Sebastian inspire.' },
      ],
      T: [
        { name: 'Thomas', meaning: 'Jumeau', personality: 'Empathique et connecté, Thomas comprend.' },
        { name: 'Tyler', meaning: 'Fabricant de tuiles', personality: 'Constructeur et pratique, Tyler réalise.' },
      ],
      U: [
        { name: 'Ulysses', meaning: 'Blessé à la cuisse', personality: 'Voyageur et aventurier, Ulysses explore.' },
      ],
      V: [
        { name: 'Victor', meaning: 'Vainqueur', personality: 'Victorieux et déterminé, Victor gagne.' },
        { name: 'Vincent', meaning: 'Conquérant', personality: 'Ambitieux et victorieux, Vincent conquiert.' },
      ],
      W: [
        { name: 'William', meaning: 'Protecteur résolu', personality: 'Protecteur et déterminé, William défend.' },
        { name: 'Wyatt', meaning: 'Brave à la guerre', personality: 'Courageux et fort, Wyatt combat.' },
      ],
      X: [
        { name: 'Xavier', meaning: 'Nouvelle maison', personality: 'Bâtisseur et nouveau, Xavier innove.' },
      ],
      Y: [
        { name: 'Yusuf', meaning: 'Dieu ajoutera', personality: 'Croissant et béni, Yusuf prospère.' },
      ],
      Z: [
        { name: 'Zachary', meaning: 'Dieu se souvient', personality: 'Mémorable et fidèle, Zachary ne s\'oublie pas.' },
      ],
    },
  },

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
};

// Fonction pour obtenir tous les pays (plat)
export const getAllCountries = () => {
  return [...countries.europe, ...countries.america];
};

// Fonction pour vérifier si un contenu est gratuit
export const isContentFree = (countryCode, letter) => {
  return freeCountries.includes(countryCode) && freeLetters.includes(letter);
};

// Alphabet complet
export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
