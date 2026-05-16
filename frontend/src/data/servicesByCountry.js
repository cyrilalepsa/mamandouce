// Services et ressources par pays/langue
// Chaque pays a ses équivalents pour les aides familiales, santé, services locaux

export const servicesByCountry = {
  fr: {
    country: "France",
    flag: "🇫🇷",
    services: [
      {
        id: "allocations",
        name: "CAF",
        description: "Allocations familiales",
        url: "https://www.caf.fr",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "Ameli",
        description: "Sécurité sociale",
        url: "https://www.ameli.fr",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Mairie",
        description: "Services locaux",
        url: "https://www.google.com/maps/search/mairie/",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Urgences",
        description: "SAMU: 15",
        url: "tel:15",
        icon: "phone",
        color: "red",
        phone: "15"
      },
      {
        id: "official",
        name: "1000 jours",
        description: "Site officiel grossesse",
        url: "https://www.1000-premiers-jours.fr",
        icon: "baby",
        color: "pink"
      }
    ]
  },
  
  en: {
    country: "United Kingdom",
    flag: "🇬🇧",
    services: [
      {
        id: "allocations",
        name: "Gov.uk",
        description: "Maternity benefits",
        url: "https://www.gov.uk/browse/childcare-parenting/pregnancy-birth",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "NHS",
        description: "National Health Service",
        url: "https://www.nhs.uk/pregnancy/",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Council",
        description: "Local services",
        url: "https://www.gov.uk/find-local-council",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Emergency",
        description: "NHS: 111 / Emergency: 999",
        url: "tel:111",
        icon: "phone",
        color: "red",
        phone: "111"
      },
      {
        id: "official",
        name: "Start4Life",
        description: "Official pregnancy guide",
        url: "https://www.nhs.uk/start4life/pregnancy/",
        icon: "baby",
        color: "pink"
      }
    ]
  },
  
  es: {
    country: "España",
    flag: "🇪🇸",
    services: [
      {
        id: "allocations",
        name: "Seg. Social",
        description: "Prestaciones maternidad",
        url: "https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "Sanidad",
        description: "Sistema Nacional de Salud",
        url: "https://www.sanidad.gob.es/",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Ayuntamiento",
        description: "Servicios locales",
        url: "https://www.google.com/maps/search/ayuntamiento/",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Urgencias",
        description: "Emergencias: 112",
        url: "tel:112",
        icon: "phone",
        color: "red",
        phone: "112"
      },
      {
        id: "official",
        name: "Salud Mujer",
        description: "Guía oficial embarazo",
        url: "https://www.sanidad.gob.es/ciudadanos/saludMujer/embarazo/home.htm",
        icon: "baby",
        color: "pink"
      }
    ]
  },
  
  pt: {
    country: "Portugal",
    flag: "🇵🇹",
    services: [
      {
        id: "allocations",
        name: "Seg. Social",
        description: "Abono de família",
        url: "https://www.seg-social.pt/",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "SNS",
        description: "Serviço Nacional de Saúde",
        url: "https://www.sns.gov.pt/",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Câmara",
        description: "Serviços locais",
        url: "https://www.google.com/maps/search/câmara+municipal/",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Urgências",
        description: "INEM: 112",
        url: "tel:112",
        icon: "phone",
        color: "red",
        phone: "112"
      },
      {
        id: "official",
        name: "SNS Grávida",
        description: "Guia oficial gravidez",
        url: "https://www.sns24.gov.pt/tema/saude-da-mulher/gravidez/",
        icon: "baby",
        color: "pink"
      }
    ]
  },
  
  it: {
    country: "Italia",
    flag: "🇮🇹",
    services: [
      {
        id: "allocations",
        name: "INPS",
        description: "Assegno di maternità",
        url: "https://www.inps.it/prestazioni-servizi/assegno-di-maternita",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "SSN",
        description: "Servizio Sanitario Nazionale",
        url: "https://www.salute.gov.it/",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Comune",
        description: "Servizi locali",
        url: "https://www.google.com/maps/search/comune/",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Emergenza",
        description: "Pronto Soccorso: 118",
        url: "tel:118",
        icon: "phone",
        color: "red",
        phone: "118"
      },
      {
        id: "official",
        name: "Salute Donna",
        description: "Guida ufficiale gravidanza",
        url: "https://www.salute.gov.it/portale/donna/homeDonna.jsp",
        icon: "baby",
        color: "pink"
      }
    ]
  },
  
  de: {
    country: "Deutschland",
    flag: "🇩🇪",
    services: [
      {
        id: "allocations",
        name: "Familienkasse",
        description: "Kindergeld & Elterngeld",
        url: "https://www.arbeitsagentur.de/familie-und-kinder",
        icon: "building",
        color: "blue"
      },
      {
        id: "health",
        name: "Krankenkasse",
        description: "Gesetzliche Krankenversicherung",
        url: "https://www.bundesgesundheitsministerium.de/",
        icon: "heart",
        color: "sky"
      },
      {
        id: "local",
        name: "Standesamt",
        description: "Lokale Dienste",
        url: "https://www.google.com/maps/search/standesamt/",
        icon: "mapPin",
        color: "green"
      },
      {
        id: "emergency",
        name: "Notfall",
        description: "Notruf: 112",
        url: "tel:112",
        icon: "phone",
        color: "red",
        phone: "112"
      },
      {
        id: "official",
        name: "Familienportal",
        description: "Offizieller Schwangerschaftsratgeber",
        url: "https://familienportal.de/familienportal/familienleistungen/schwangerschaft-mutterschutz",
        icon: "baby",
        color: "pink"
      }
    ]
  }
};

// Fonction pour obtenir les services selon la langue
export const getServicesForLanguage = (langCode) => {
  return servicesByCountry[langCode] || servicesByCountry.fr;
};

// Couleurs pour les icônes
export const serviceColors = {
  blue: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-400",
    text: "text-blue-600"
  },
  sky: {
    bg: "bg-gradient-to-br from-sky-500 to-sky-400",
    text: "text-sky-600"
  },
  green: {
    bg: "bg-gradient-to-br from-green-500 to-green-400",
    text: "text-green-600"
  },
  red: {
    bg: "bg-gradient-to-br from-red-500 to-red-400",
    text: "text-red-600"
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-500 to-pink-400",
    text: "text-pink-600"
  }
};
