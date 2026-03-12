# Rendez-vous médicaux standards pendant la grossesse en France

MEDICAL_APPOINTMENTS = [
    {
        "id": "rdv-1",
        "week_start": 6,
        "week_end": 8,
        "type": "consultation",
        "title": "1ère consultation prénatale",
        "description": "Consultation obligatoire avec votre médecin ou sage-femme pour confirmer la grossesse et établir le suivi.",
        "icon": "stethoscope",
        "priority": "high",
        "documents": ["Carte vitale", "Carte d'identité", "Carnet de santé"]
    },
    {
        "id": "rdv-2",
        "week_start": 11,
        "week_end": 13,
        "type": "echographie",
        "title": "1ère échographie (datation)",
        "description": "Échographie de datation pour confirmer l'âge de la grossesse et détecter d'éventuelles anomalies.",
        "icon": "scan",
        "priority": "high",
        "documents": ["Ordonnance du médecin", "Carte vitale"]
    },
    {
        "id": "rdv-3",
        "week_start": 11,
        "week_end": 13,
        "type": "prise_sang",
        "title": "Dépistage trisomie 21",
        "description": "Prise de sang pour le dépistage combiné du premier trimestre (trisomie 21).",
        "icon": "test-tube",
        "priority": "high",
        "documents": ["Ordonnance", "Carte vitale"]
    },
    {
        "id": "rdv-4",
        "week_start": 14,
        "week_end": 16,
        "type": "consultation",
        "title": "2ème consultation prénatale",
        "description": "Suivi mensuel : prise de poids, tension artérielle, hauteur utérine.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-5",
        "week_start": 18,
        "week_end": 20,
        "type": "consultation",
        "title": "3ème consultation prénatale",
        "description": "Suivi mensuel et préparation de l'échographie morphologique.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-6",
        "week_start": 20,
        "week_end": 22,
        "type": "echographie",
        "title": "2ème échographie (morphologique)",
        "description": "Échographie morphologique détaillée : vérification de tous les organes du bébé. Possibilité de connaître le sexe.",
        "icon": "scan",
        "priority": "high",
        "documents": ["Ordonnance du médecin", "Carte vitale"]
    },
    {
        "id": "rdv-7",
        "week_start": 22,
        "week_end": 24,
        "type": "consultation",
        "title": "4ème consultation prénatale",
        "description": "Suivi mensuel et discussion des résultats de l'échographie morphologique.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-8",
        "week_start": 24,
        "week_end": 28,
        "type": "prise_sang",
        "title": "Test diabète gestationnel",
        "description": "Dépistage du diabète gestationnel par test HGPO (Hyperglycémie Provoquée par voie Orale).",
        "icon": "test-tube",
        "priority": "high",
        "documents": ["Ordonnance", "Carte vitale", "Être à jeun"]
    },
    {
        "id": "rdv-9",
        "week_start": 26,
        "week_end": 28,
        "type": "consultation",
        "title": "5ème consultation prénatale",
        "description": "Suivi mensuel, résultats du test de diabète gestationnel.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-10",
        "week_start": 28,
        "week_end": 32,
        "type": "consultation",
        "title": "Consultation anesthésiste",
        "description": "Consultation obligatoire avec l'anesthésiste pour préparer l'accouchement (péridurale).",
        "icon": "user-md",
        "priority": "high",
        "documents": ["Carte vitale", "Résultats analyses", "Carnet de maternité"]
    },
    {
        "id": "rdv-11",
        "week_start": 30,
        "week_end": 32,
        "type": "consultation",
        "title": "6ème consultation prénatale",
        "description": "Suivi mensuel et préparation de la 3ème échographie.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-12",
        "week_start": 31,
        "week_end": 33,
        "type": "echographie",
        "title": "3ème échographie (croissance)",
        "description": "Échographie de croissance : vérification de la position du bébé et estimation du poids.",
        "icon": "scan",
        "priority": "high",
        "documents": ["Ordonnance du médecin", "Carte vitale"]
    },
    {
        "id": "rdv-13",
        "week_start": 34,
        "week_end": 36,
        "type": "consultation",
        "title": "7ème consultation prénatale",
        "description": "Suivi mensuel, discussion du plan de naissance, vérification de la position du bébé.",
        "icon": "stethoscope",
        "priority": "medium",
        "documents": ["Carnet de maternité", "Projet de naissance"]
    },
    {
        "id": "rdv-14",
        "week_start": 35,
        "week_end": 37,
        "type": "prise_sang",
        "title": "Prélèvement vaginal",
        "description": "Dépistage du streptocoque B pour éviter une infection du bébé à la naissance.",
        "icon": "test-tube",
        "priority": "high",
        "documents": ["Ordonnance", "Carte vitale"]
    },
    {
        "id": "rdv-15",
        "week_start": 37,
        "week_end": 38,
        "type": "consultation",
        "title": "8ème consultation prénatale",
        "description": "Dernière consultation mensuelle avant l'accouchement. Vérification du col et monitoring.",
        "icon": "stethoscope",
        "priority": "high",
        "documents": ["Carnet de maternité", "Valise maternité prête"]
    },
    {
        "id": "rdv-16",
        "week_start": 39,
        "week_end": 40,
        "type": "monitoring",
        "title": "Monitoring de surveillance",
        "description": "Surveillance du rythme cardiaque fœtal et des contractions si dépassement du terme.",
        "icon": "activity",
        "priority": "high",
        "documents": ["Carnet de maternité"]
    },
    {
        "id": "rdv-17",
        "week_start": 41,
        "week_end": 42,
        "type": "monitoring",
        "title": "Surveillance terme dépassé",
        "description": "Monitoring quotidien ou tous les 2 jours. Discussion possible d'un déclenchement.",
        "icon": "activity",
        "priority": "high",
        "documents": ["Carnet de maternité", "Être prête pour l'accouchement"]
    }
]

# Cours de préparation à l'accouchement
PREPARATION_COURSES = [
    {
        "id": "prep-1",
        "week_start": 26,
        "week_end": 28,
        "type": "preparation",
        "title": "1ère séance préparation",
        "description": "Introduction à la préparation à l'accouchement. 8 séances sont remboursées par la Sécurité sociale.",
        "icon": "baby",
        "priority": "medium"
    },
    {
        "id": "prep-2",
        "week_start": 28,
        "week_end": 30,
        "type": "preparation",
        "title": "Séances de préparation",
        "description": "Continuer les séances de préparation : respiration, positions d'accouchement, gestion de la douleur.",
        "icon": "baby",
        "priority": "medium"
    },
    {
        "id": "prep-3",
        "week_start": 32,
        "week_end": 36,
        "type": "preparation",
        "title": "Finaliser la préparation",
        "description": "Dernières séances de préparation : allaitement, soins du nouveau-né, retour à la maison.",
        "icon": "baby",
        "priority": "medium"
    }
]
