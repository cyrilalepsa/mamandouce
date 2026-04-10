// Contenu du sac de maternité adapté par pays
// Inclut documents requis, durée de séjour, produits spécifiques

export const maternityBagByCountry = {
  fr: {
    country: "France",
    flag: "🇫🇷",
    hospitalStay: {
      duration: "3-4 jours",
      durationNatural: "3 jours",
      durationCesarean: "5-6 jours"
    },
    documents: [
      { name: "Carte Vitale", required: true, description: "Carte d'assurance maladie" },
      { name: "Carte de mutuelle", required: true, description: "Attestation de complémentaire santé" },
      { name: "Carte d'identité", required: true, description: "Pièce d'identité" },
      { name: "Livret de famille", required: false, description: "Si vous en avez un (pour la déclaration)" },
      { name: "Carnet de maternité", required: true, description: "Avec tous les examens" },
      { name: "Reconnaissance anticipée", required: false, description: "Si parents non mariés" },
      { name: "Projet de naissance", required: false, description: "Si vous en avez préparé un" }
    ],
    specificItems: [
      { name: "Brumisateur", description: "Pour se rafraîchir pendant le travail" },
      { name: "Bouteille d'eau avec paille", description: "Facilite l'hydratation" }
    ],
    brands: {
      diapers: ["Pampers", "Lotus Baby", "Joone", "Love & Green"],
      care: ["Mustela", "Biolane", "Mixa Bébé", "Cattier Bébé"]
    },
    tips: [
      "La maternité fournit souvent les premiers bodys et couches",
      "Pensez à apporter des vêtements confortables pour l'allaitement",
      "Un coussin d'allaitement peut être utile"
    ]
  },

  en: {
    country: "United Kingdom",
    flag: "🇬🇧",
    hospitalStay: {
      duration: "6-24 hours",
      durationNatural: "6-24 hours",
      durationCesarean: "2-3 days"
    },
    documents: [
      { name: "NHS Number", required: true, description: "Your NHS identification number" },
      { name: "Birth plan", required: false, description: "If you have prepared one" },
      { name: "Maternity notes", required: true, description: "Your pregnancy record book" },
      { name: "Photo ID", required: true, description: "Passport or driving licence" },
      { name: "Partner's ID", required: false, description: "If partner is staying" }
    ],
    specificItems: [
      { name: "TENS machine", description: "For pain relief during labour" },
      { name: "Lip balm", description: "Lips get very dry during labour" },
      { name: "Pillow from home", description: "Hospital pillows are often thin" }
    ],
    brands: {
      diapers: ["Pampers", "Huggies", "Aldi Mamia", "Lidl Lupilu"],
      care: ["Johnson's Baby", "Childs Farm", "Aveeno Baby", "Weleda"]
    },
    tips: [
      "NHS provides basic supplies, but bring your own preferred brands",
      "Pack light - most stays are short",
      "Bring snacks for your birth partner",
      "Car seat is required to leave hospital with baby"
    ]
  },

  es: {
    country: "España",
    flag: "🇪🇸",
    hospitalStay: {
      duration: "2-3 días",
      durationNatural: "2 días",
      durationCesarean: "4-5 días"
    },
    documents: [
      { name: "Tarjeta sanitaria", required: true, description: "Tarjeta de la Seguridad Social" },
      { name: "DNI/NIE", required: true, description: "Documento de identidad" },
      { name: "Cartilla del embarazo", required: true, description: "Con todas las pruebas" },
      { name: "Libro de familia", required: false, description: "Si ya lo tienes" },
      { name: "Plan de parto", required: false, description: "Si lo has preparado" }
    ],
    specificItems: [
      { name: "Abanico", description: "Las habitaciones pueden ser calurosas" },
      { name: "Chanclas", description: "Para la ducha del hospital" }
    ],
    brands: {
      diapers: ["Dodot", "Huggies", "Chelino", "Moltex"],
      care: ["Suavinex", "Mustela", "Nenuco", "Johnson's"]
    },
    tips: [
      "Los hospitales públicos suelen proporcionar pañales básicos",
      "Lleva ropa cómoda para ti y el bebé",
      "La sillita de coche es obligatoria para salir"
    ]
  },

  pt: {
    country: "Portugal",
    flag: "🇵🇹",
    hospitalStay: {
      duration: "2-3 dias",
      durationNatural: "2 dias",
      durationCesarean: "4 dias"
    },
    documents: [
      { name: "Cartão de Cidadão", required: true, description: "Documento de identificação" },
      { name: "Cartão de Utente SNS", required: true, description: "Número de utente do SNS" },
      { name: "Boletim de Saúde da Grávida", required: true, description: "Com todos os exames" },
      { name: "Cartão do subsistema", required: false, description: "ADSE, SAD, etc. se aplicável" }
    ],
    specificItems: [
      { name: "Chinelos", description: "Para o banho do hospital" },
      { name: "Roupão leve", description: "Para circular no hospital" }
    ],
    brands: {
      diapers: ["Dodot", "Huggies", "Pingo", "Moltex"],
      care: ["Mustela", "Nenuco", "Johnson's", "Aveeno Baby"]
    },
    tips: [
      "Os hospitais públicos fornecem fraldas básicas",
      "Leve roupa confortável para a amamentação",
      "A cadeirinha de carro é obrigatória"
    ]
  },

  it: {
    country: "Italia",
    flag: "🇮🇹",
    hospitalStay: {
      duration: "2-3 giorni",
      durationNatural: "2 giorni",
      durationCesarean: "4-5 giorni"
    },
    documents: [
      { name: "Tessera Sanitaria", required: true, description: "Carta regionale dei servizi" },
      { name: "Codice Fiscale", required: true, description: "Tuo e del partner" },
      { name: "Carta d'identità", required: true, description: "Documento valido" },
      { name: "Cartella clinica", required: true, description: "Con tutti gli esami" },
      { name: "Piano del parto", required: false, description: "Se lo hai preparato" }
    ],
    specificItems: [
      { name: "Ciabatte", description: "Per la doccia dell'ospedale" },
      { name: "Vestaglia leggera", description: "Per muoversi in reparto" }
    ],
    brands: {
      diapers: ["Pampers", "Huggies", "Chicco", "Pillo"],
      care: ["Chicco", "Mustela", "Fissan", "Johnson's"]
    },
    tips: [
      "Gli ospedali forniscono pannolini di base",
      "Porta vestiti comodi per l'allattamento",
      "Il seggiolino auto è obbligatorio per uscire"
    ]
  },

  de: {
    country: "Deutschland",
    flag: "🇩🇪",
    hospitalStay: {
      duration: "2-3 Tage",
      durationNatural: "2 Tage",
      durationCesarean: "4-5 Tage"
    },
    documents: [
      { name: "Krankenversicherungskarte", required: true, description: "Krankenkassenkarte" },
      { name: "Personalausweis", required: true, description: "Oder Reisepass" },
      { name: "Mutterpass", required: true, description: "Mit allen Untersuchungen" },
      { name: "Heiratsurkunde", required: false, description: "Falls verheiratet" },
      { name: "Vaterschaftsanerkennung", required: false, description: "Falls nicht verheiratet" },
      { name: "Geburtsplan", required: false, description: "Falls vorbereitet" }
    ],
    specificItems: [
      { name: "Badelatschen", description: "Für die Krankenhausdusche" },
      { name: "Bademantel", description: "Für den Aufenthalt auf der Station" }
    ],
    brands: {
      diapers: ["Pampers", "Huggies", "dm babylove", "Rossmann Babydream"],
      care: ["Penaten", "Weleda", "Hipp Babysanft", "Bübchen"]
    },
    tips: [
      "Krankenhäuser stellen Grundausstattung bereit",
      "Bringen Sie bequeme Stillkleidung mit",
      "Kindersitz ist Pflicht zum Verlassen des Krankenhauses",
      "Hebamme vorher organisieren für die Nachsorge"
    ]
  }
};

// Checklist commune à tous les pays (à traduire via i18n)
export const commonMaternityItems = {
  forMom: [
    "nightgowns",
    "nursingBras",
    "underwear",
    "slippers",
    "toiletries",
    "phoneCharger",
    "snacks",
    "goingHomeOutfit"
  ],
  forBaby: [
    "bodysuits",
    "sleepsuits",
    "hats",
    "socks",
    "blanket",
    "diapers",
    "carSeat"
  ],
  forLabor: [
    "birthPlan",
    "music",
    "pillow",
    "waterSpray",
    "lipBalm"
  ]
};

export const getMaternityBagForLanguage = (langCode) => {
  return maternityBagByCountry[langCode] || maternityBagByCountry.fr;
};
