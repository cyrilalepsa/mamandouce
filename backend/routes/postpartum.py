from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from core.database import db
from core.security import get_current_user
from models.schemas import User

router = APIRouter()

# Liste par défaut du sac de maternité
DEFAULT_MATERNITY_BAG = [
    # Pour maman
    {"category": "Pour maman", "item": "Carte vitale et mutuelle", "checked": False},
    {"category": "Pour maman", "item": "Dossier de maternité", "checked": False},
    {"category": "Pour maman", "item": "Carte de groupe sanguin", "checked": False},
    {"category": "Pour maman", "item": "2-3 chemises de nuit ouvertes devant", "checked": False},
    {"category": "Pour maman", "item": "1 robe de chambre ou gilet chaud", "checked": False},
    {"category": "Pour maman", "item": "Chaussons confortables", "checked": False},
    {"category": "Pour maman", "item": "5-6 culottes jetables ou confortables", "checked": False},
    {"category": "Pour maman", "item": "2-3 soutiens-gorge d'allaitement", "checked": False},
    {"category": "Pour maman", "item": "Coussinets d'allaitement", "checked": False},
    {"category": "Pour maman", "item": "Serviettes hygiéniques maternité", "checked": False},
    {"category": "Pour maman", "item": "Trousse de toilette (brosse à dents, shampoing, gel douche...)", "checked": False},
    {"category": "Pour maman", "item": "Brumisateur d'eau", "checked": False},
    {"category": "Pour maman", "item": "Élastiques pour cheveux", "checked": False},
    {"category": "Pour maman", "item": "Chargeur de téléphone", "checked": False},
    {"category": "Pour maman", "item": "Tenue de sortie confortable", "checked": False},
    # Pour bébé
    {"category": "Pour bébé", "item": "6-8 bodies (taille naissance et 1 mois)", "checked": False},
    {"category": "Pour bébé", "item": "6-8 pyjamas", "checked": False},
    {"category": "Pour bébé", "item": "2-3 brassières ou gilets", "checked": False},
    {"category": "Pour bébé", "item": "2 bonnets", "checked": False},
    {"category": "Pour bébé", "item": "2-3 paires de chaussettes ou chaussons", "checked": False},
    {"category": "Pour bébé", "item": "1 gigoteuse ou turbulette", "checked": False},
    {"category": "Pour bébé", "item": "1 sortie de bain ou cape", "checked": False},
    {"category": "Pour bébé", "item": "Couches nouveau-né (1 paquet)", "checked": False},
    {"category": "Pour bébé", "item": "Lingettes ou cotons", "checked": False},
    {"category": "Pour bébé", "item": "Liniment ou crème pour le change", "checked": False},
    {"category": "Pour bébé", "item": "Sérum physiologique", "checked": False},
    {"category": "Pour bébé", "item": "Thermomètre", "checked": False},
    {"category": "Pour bébé", "item": "Doudou", "checked": False},
    {"category": "Pour bébé", "item": "Tétine (si souhaitée)", "checked": False},
    # Pour le retour
    {"category": "Pour le retour", "item": "Siège auto homologué", "checked": False},
    {"category": "Pour le retour", "item": "Tenue de sortie pour bébé", "checked": False},
    {"category": "Pour le retour", "item": "Couverture légère", "checked": False},
]

class MaternityBagItem(BaseModel):
    category: str
    item: str
    checked: bool = False

class ItemSuggestion(BaseModel):
    category: str
    item: str

# ==================== MATERNITY BAG ENDPOINTS ====================

@router.get("/maternity-bag")
async def get_maternity_bag(current_user: User = Depends(get_current_user)):
    """Récupérer la check-list du sac de maternité pour l'utilisateur"""
    
    # Récupérer la liste personnalisée de l'utilisateur
    user_list = await db.maternity_bags.find_one({"user_id": current_user.id})
    
    if user_list:
        return {"items": user_list.get("items", []), "custom_items": user_list.get("custom_items", [])}
    
    # Si pas de liste, créer avec les items par défaut
    default_items = [dict(item) for item in DEFAULT_MATERNITY_BAG]
    await db.maternity_bags.insert_one({
        "user_id": current_user.id,
        "items": default_items,
        "custom_items": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"items": default_items, "custom_items": []}


@router.post("/maternity-bag/check")
async def toggle_item(item_index: int, checked: bool, is_custom: bool = False, current_user: User = Depends(get_current_user)):
    """Cocher/décocher un item de la liste"""
    
    field = "custom_items" if is_custom else "items"
    
    result = await db.maternity_bags.update_one(
        {"user_id": current_user.id},
        {"$set": {f"{field}.{item_index}.checked": checked}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item non trouvé")
    
    return {"success": True}


@router.post("/maternity-bag/suggest")
async def suggest_item(suggestion: ItemSuggestion, current_user: User = Depends(get_current_user)):
    """Suggérer un nouvel item (nécessite validation admin)"""
    from routes.push_notifications import send_admin_notification
    
    # Enregistrer la suggestion
    suggestion_doc = {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "category": suggestion.category,
        "item": suggestion.item,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.maternity_bag_suggestions.insert_one(suggestion_doc)
    
    # Notifier l'admin avec catégorie
    try:
        await send_admin_notification(
            title="Nouvelle suggestion",
            body=f"{current_user.email} suggère: {suggestion.item}",
            url="/admin",
            category="Sac maternité"
        )
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
    return {"success": True, "message": "Suggestion envoyée pour validation"}


@router.get("/maternity-bag/suggestions")
async def get_suggestions(current_user: User = Depends(get_current_user)):
    """Récupérer les suggestions en attente (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    suggestions = await db.maternity_bag_suggestions.find(
        {"status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    return {"suggestions": suggestions}


@router.post("/maternity-bag/approve")
async def approve_suggestion(suggestion_id: str, approved: bool, current_user: User = Depends(get_current_user)):
    """Approuver ou rejeter une suggestion (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    from bson import ObjectId
    
    suggestion = await db.maternity_bag_suggestions.find_one({"_id": ObjectId(suggestion_id)})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion non trouvée")
    
    if approved:
        # Ajouter l'item à la liste par défaut (pour tous les futurs utilisateurs)
        # Et à la liste de l'utilisateur qui a suggéré
        new_item = {
            "category": suggestion["category"],
            "item": suggestion["item"],
            "checked": False,
            "added_by": suggestion["user_email"]
        }
        
        # Mettre à jour le statut
        await db.maternity_bag_suggestions.update_one(
            {"_id": ObjectId(suggestion_id)},
            {"$set": {"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Ajouter à la liste de l'utilisateur
        await db.maternity_bags.update_one(
            {"user_id": suggestion["user_id"]},
            {"$push": {"custom_items": new_item}}
        )
        
        return {"success": True, "message": "Suggestion approuvée et ajoutée"}
    else:
        await db.maternity_bag_suggestions.update_one(
            {"_id": ObjectId(suggestion_id)},
            {"$set": {"status": "rejected", "rejected_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True, "message": "Suggestion rejetée"}


# ==================== POSTPARTUM CONTENT ====================

POSTPARTUM_CONTENT = {
    "appointments": [
        {
            "week": 1, 
            "title": "Visite de sortie maternité", 
            "description": "Examen complet de la maman et du bébé avant le retour à la maison",
            "type": "obligatoire",
            "duration": "1-2 heures",
            "who": "Pédiatre + Sage-femme/Gynécologue",
            "for_mom": [
                "Vérification de l'utérus (involution utérine)",
                "Contrôle des saignements (lochies)",
                "Examen de la cicatrice (césarienne ou épisiotomie)",
                "Vérification de la tension artérielle",
                "Discussion sur la contraception",
                "Évaluation de l'état psychologique"
            ],
            "for_baby": [
                "Poids et mesures (perte de poids normale < 10%)",
                "Examen clinique complet",
                "Test de Guthrie (dépistage maladies)",
                "Contrôle de la jaunisse (bilirubine)",
                "Vérification de l'alimentation (sein ou biberon)"
            ],
            "documents": ["Carnet de santé bébé", "Compte-rendu d'accouchement"],
            "tips": "Préparez vos questions à l'avance. N'hésitez pas à demander des démonstrations pour les soins du bébé."
        },
        {
            "week": 1, 
            "title": "Visite sage-femme à domicile", 
            "description": "Suivi personnalisé des suites de couches et aide à l'allaitement",
            "type": "recommandé",
            "duration": "45 min - 1 heure",
            "who": "Sage-femme libérale",
            "for_mom": [
                "Surveillance des saignements",
                "Vérification de la cicatrisation",
                "Soutien à l'allaitement (position, prise du sein)",
                "Conseils pour les soins du périnée",
                "Écoute et soutien psychologique",
                "Conseils sur le repos et la récupération"
            ],
            "for_baby": [
                "Pesée (suivi de la reprise de poids)",
                "Vérification du cordon ombilical",
                "Observation d'une tétée ou biberon",
                "Conseils sur le sommeil et les pleurs"
            ],
            "documents": ["Carnet de santé bébé"],
            "tips": "Cette visite est prise en charge à 100% par l'Assurance Maladie. Vous avez droit à 2 visites à domicile.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 2, 
            "title": "Consultation pédiatre - J8 à J15", 
            "description": "Premier examen médical complet du nouveau-né",
            "type": "obligatoire",
            "duration": "30-45 minutes",
            "who": "Pédiatre ou Médecin généraliste",
            "for_baby": [
                "Pesée complète (doit avoir repris son poids de naissance)",
                "Mesure taille et périmètre crânien",
                "Examen neurologique (tonus, réflexes archaïques)",
                "Auscultation cardiaque et pulmonaire",
                "Palpation abdominale",
                "Examen des hanches (dépistage luxation)",
                "Vérification des yeux et audition",
                "Examen de la peau (jaunisse, éruptions)",
                "Vérification du cordon ombilical"
            ],
            "questions_to_ask": [
                "Fréquence des tétées/biberons normale ?",
                "Combien de couches mouillées par jour ?",
                "Quand consulter en urgence ?",
                "Quand commencer les vitamines D et K ?"
            ],
            "documents": ["Carnet de santé", "Résultats du test de Guthrie"],
            "tips": "Notez le nombre de tétées, selles et urines des derniers jours. Le médecin vous posera ces questions.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 3, 
            "title": "Visite sage-femme de suivi", 
            "description": "Vérification de la cicatrisation et soutien continu",
            "type": "recommandé",
            "duration": "30-45 minutes",
            "who": "Sage-femme",
            "for_mom": [
                "Examen du périnée et de la cicatrice",
                "Vérification de la fin des saignements",
                "Discussion sur la reprise des rapports",
                "Point sur la contraception",
                "Évaluation de la fatigue et du moral",
                "Conseils rééducation périnéale"
            ],
            "for_baby": [
                "Pesée de contrôle",
                "Point sur l'alimentation",
                "Vérification cicatrisation ombilic"
            ],
            "tips": "C'est le moment de parler de vos inquiétudes concernant la reprise d'une vie intime.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 6, 
            "title": "Visite post-natale obligatoire", 
            "description": "Examen gynécologique complet et bilan de santé global",
            "type": "obligatoire",
            "duration": "30-45 minutes",
            "who": "Gynécologue ou Sage-femme",
            "for_mom": [
                "Examen gynécologique complet",
                "Frottis cervical si nécessaire",
                "Examen des seins",
                "Vérification complète de la cicatrisation",
                "Prescription de la contraception définitive",
                "Ordonnance pour la rééducation périnéale",
                "Évaluation psychologique (dépistage dépression post-partum)",
                "Discussion sur la reprise du travail"
            ],
            "important": "Cette visite doit avoir lieu entre 6 et 8 semaines après l'accouchement",
            "documents": ["Carte Vitale", "Compte-rendu d'accouchement"],
            "questions_to_ask": [
                "Quelle contraception me conseillez-vous ?",
                "Quand puis-je reprendre le sport ?",
                "La rééducation périnéale est-elle obligatoire ?",
                "Quand prévoir la prochaine grossesse ?"
            ],
            "tips": "N'hésitez pas à parler de vos difficultés émotionnelles. C'est le moment idéal pour un dépistage de la dépression post-partum.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 8, 
            "title": "Vaccins bébé - 2 mois", 
            "description": "Première série de vaccinations obligatoires du nourrisson",
            "type": "obligatoire",
            "duration": "20-30 minutes",
            "who": "Pédiatre ou Médecin généraliste",
            "vaccines": [
                {"name": "Hexavalent (6-en-1)", "protects": "Diphtérie, Tétanos, Coqueluche, Polio, Haemophilus, Hépatite B"},
                {"name": "Pneumocoque", "protects": "Infections à pneumocoque (méningites, otites)"},
                {"name": "Méningocoque B", "protects": "Méningite B (recommandé)"}
            ],
            "side_effects": [
                "Fièvre légère (< 38.5°C) pendant 24-48h",
                "Rougeur et gonflement au point d'injection",
                "Irritabilité et pleurs",
                "Perte d'appétit temporaire"
            ],
            "what_to_do": [
                "Donner du paracétamol si fièvre > 38°C",
                "Câliner et rassurer bébé",
                "Appliquer une compresse fraîche sur le point d'injection",
                "Ne pas hésiter à rappeler le médecin si fièvre > 39°C"
            ],
            "documents": ["Carnet de santé (pages vaccinations)"],
            "tips": "Prévoyez une journée calme après les vaccins. Bébé aura besoin de repos et de câlins.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 10, 
            "title": "Début rééducation périnéale", 
            "description": "Séances pour renforcer le périnée après l'accouchement",
            "type": "recommandé",
            "duration": "30 minutes par séance (10-20 séances)",
            "who": "Sage-femme ou Kinésithérapeute spécialisé",
            "why": [
                "Prévenir l'incontinence urinaire",
                "Éviter les descentes d'organes (prolapsus)",
                "Retrouver une vie intime épanouie",
                "Préparer une future grossesse",
                "Renforcer les muscles profonds"
            ],
            "methods": [
                {"name": "Rééducation manuelle", "description": "Exercices guidés par le praticien"},
                {"name": "Électrostimulation", "description": "Sonde avec stimulation électrique douce"},
                {"name": "Biofeedback", "description": "Visualisation des contractions sur écran"},
                {"name": "Exercices à domicile", "description": "Programme personnalisé à faire chez soi"}
            ],
            "when_mandatory": [
                "Accouchement par voie basse",
                "Épisiotomie ou déchirure",
                "Bébé de plus de 4kg",
                "Incontinence urinaire ou fécale",
                "Sensation de pesanteur pelvienne"
            ],
            "tips": "Même après une césarienne, la rééducation est recommandée car la grossesse a sollicité le périnée.",
            "reimbursement": "100% Sécurité Sociale (10 séances remboursées)"
        },
        {
            "week": 16, 
            "title": "Vaccins bébé - 4 mois", 
            "description": "Deuxième série de vaccinations (rappels)",
            "type": "obligatoire",
            "duration": "20-30 minutes",
            "who": "Pédiatre ou Médecin généraliste",
            "vaccines": [
                {"name": "Hexavalent (rappel)", "protects": "Diphtérie, Tétanos, Coqueluche, Polio, Haemophilus, Hépatite B"},
                {"name": "Pneumocoque (rappel)", "protects": "Infections à pneumocoque"},
                {"name": "Méningocoque B (rappel)", "protects": "Méningite B"}
            ],
            "also_checked": [
                "Poids et taille (courbe de croissance)",
                "Développement psychomoteur",
                "Audition et vision",
                "Alimentation (préparation diversification)"
            ],
            "documents": ["Carnet de santé"],
            "tips": "C'est le moment de poser vos questions sur la diversification alimentaire qui commencera vers 4-6 mois.",
            "reimbursement": "100% Sécurité Sociale"
        },
        {
            "week": 24, 
            "title": "Bilan des 6 mois", 
            "description": "Visite pédiatrique complète et début de la diversification alimentaire",
            "type": "obligatoire",
            "duration": "30-45 minutes",
            "who": "Pédiatre ou Médecin généraliste",
            "for_baby": [
                "Examen clinique complet",
                "Mesures (poids, taille, périmètre crânien)",
                "Évaluation du développement psychomoteur",
                "Test de la vision et de l'audition",
                "Bilan de la diversification alimentaire",
                "Discussion sur le sommeil"
            ],
            "milestones_6_months": [
                "Tient assis avec appui",
                "Attrape les objets volontairement",
                "Rit aux éclats",
                "Reconnaît les visages familiers",
                "Gazouille et babille",
                "Commence à se retourner"
            ],
            "diversification": [
                "Introduction des légumes (1 par 1)",
                "Introduction des fruits",
                "Textures lisses puis moulinées",
                "Éviter sel, sucre, miel avant 1 an",
                "Maintenir le lait comme base (500-700ml/jour)"
            ],
            "documents": ["Carnet de santé"],
            "tips": "Prenez des photos du développement de bébé pour les montrer au médecin. Notez les nouvelles acquisitions.",
            "reimbursement": "100% Sécurité Sociale"
        }
    ],
    "difficulties": [
        {
            "title": "Baby blues",
            "description": "Période de tristesse passagère (3-10 jours après l'accouchement). C'est normal et temporaire.",
            "symptoms": ["Pleurs inexpliqués", "Sautes d'humeur", "Fatigue intense", "Anxiété légère"],
            "advice": "Reposez-vous, acceptez l'aide de vos proches, parlez de vos émotions.",
            "alert": "Si les symptômes persistent au-delà de 2 semaines, consultez votre médecin."
        },
        {
            "title": "Dépression post-partum",
            "description": "Trouble plus profond qui nécessite une prise en charge médicale.",
            "symptoms": ["Tristesse profonde persistante", "Difficultés à créer un lien avec bébé", "Pensées négatives", "Troubles du sommeil importants"],
            "advice": "N'hésitez pas à consulter rapidement. Ce n'est pas un échec, c'est une maladie qui se soigne.",
            "alert": "Contactez votre médecin ou appelez le 3114 (numéro national de prévention du suicide)."
        },
        {
            "title": "Difficultés d'allaitement",
            "description": "Crevasses, engorgement, mastite sont fréquents mais se traitent bien.",
            "symptoms": ["Douleurs lors des tétées", "Seins durs et douloureux", "Fièvre (mastite)"],
            "advice": "Consultez une conseillère en lactation ou votre sage-femme rapidement.",
            "alert": "En cas de fièvre avec douleur au sein, consultez dans les 24h."
        },
        {
            "title": "Fatigue extrême",
            "description": "Les nuits hachées et les soins constants épuisent.",
            "symptoms": ["Épuisement permanent", "Difficultés de concentration", "Irritabilité"],
            "advice": "Dormez quand bébé dort, acceptez toute l'aide proposée, ne culpabilisez pas.",
            "alert": "Si la fatigue s'accompagne de signes dépressifs, parlez-en à votre médecin."
        }
    ],
    "breastfeeding": {
        "benefits": [
            "Protection immunitaire optimale pour bébé",
            "Digestion facilitée",
            "Lien mère-enfant renforcé",
            "Récupération post-partum accélérée pour maman",
            "Économique et écologique"
        ],
        "tips": [
            "Mettez bébé au sein dès la première heure si possible",
            "Allaitez à la demande, sans regarder l'heure",
            "Vérifiez la bonne prise du sein (bouche grande ouverte)",
            "Alternez les positions d'allaitement",
            "Hydratez-vous abondamment",
            "En cas de douleur, consultez rapidement"
        ],
        "positions": ["Madone", "Ballon de rugby", "Allongée", "Biological nurturing"],
        "alert": "L'allaitement ne doit pas être douloureux. Une douleur persistante nécessite un avis professionnel."
    },
    "formula": {
        "info": "Le lait infantile est une alternative parfaitement adaptée aux besoins de bébé.",
        "tips": [
            "Suivez les dosages indiqués sur la boîte",
            "Utilisez de l'eau faiblement minéralisée",
            "Préparez le biberon juste avant le repas",
            "Température idéale : 37°C (tiède)",
            "Ne réchauffez jamais un biberon entamé",
            "Stérilisez les biberons les premiers mois"
        ],
        "types": [
            {"name": "Lait 1er âge", "age": "0-6 mois", "description": "Adapté aux besoins du nouveau-né"},
            {"name": "Lait 2ème âge", "age": "6-12 mois", "description": "Accompagne la diversification"},
            {"name": "Lait de croissance", "age": "1-3 ans", "description": "Complète l'alimentation diversifiée"}
        ],
        "alert": "Ne changez pas de lait sans avis médical. En cas de régurgitations importantes, coliques ou allergies, consultez."
    },
    "diapers": {
        "frequency": "8 à 12 changes par jour les premières semaines, puis 6-8 par jour",
        "tips": [
            "Changez bébé dès que la couche est souillée",
            "Nettoyez toujours de l'avant vers l'arrière",
            "Séchez bien les plis avant de mettre une couche propre",
            "Utilisez du liniment ou une crème protectrice",
            "Laissez les fesses à l'air quelques minutes par jour"
        ],
        "sizes": [
            {"size": "1", "weight": "2-5 kg", "age": "Naissance"},
            {"size": "2", "weight": "3-6 kg", "age": "1-3 mois"},
            {"size": "3", "weight": "4-9 kg", "age": "3-6 mois"},
            {"size": "4", "weight": "7-18 kg", "age": "6-18 mois"}
        ],
        "alert": "Rougeurs persistantes = consulter. Ça peut être une allergie ou une mycose."
    },
    "precautions": [
        {
            "title": "Couchage sécurisé",
            "tips": ["Sur le dos, dans un lit adapté", "Pas d'oreiller ni couverture", "Température chambre 18-20°C", "Pas de co-dodo sur canapé ou fauteuil"]
        },
        {
            "title": "Hygiène",
            "tips": ["Lavez-vous les mains avant de toucher bébé", "Limitez les visites les premières semaines", "Évitez les lieux très fréquentés"]
        },
        {
            "title": "Signes d'alerte bébé",
            "tips": ["Fièvre > 38°C avant 3 mois = urgence", "Refus de s'alimenter", "Pleurs inconsolables inhabituels", "Teint gris ou bleuté", "Difficultés respiratoires"]
        },
        {
            "title": "Récupération maman",
            "tips": ["Pas de port de charges lourdes 6 semaines", "Reprise progressive des activités", "Écouter son corps", "Pas de bain (douche uniquement) tant que saignements"]
        }
    ]
}

@router.get("/postpartum/content")
async def get_postpartum_content(current_user: User = Depends(get_current_user)):
    """Récupérer tout le contenu post-partum"""
    return POSTPARTUM_CONTENT

@router.get("/postpartum/appointments")
async def get_postpartum_appointments(current_user: User = Depends(get_current_user)):
    """Récupérer les rendez-vous post-partum sur 6 mois"""
    return {"appointments": POSTPARTUM_CONTENT["appointments"]}


# ==================== BIRTH DATE & POSTPARTUM START ====================

class BirthDateInput(BaseModel):
    birth_date: str  # ISO format date
    baby_name: Optional[str] = None

class RefundRequest(BaseModel):
    reason: str  # "miscarriage" or other
    details: Optional[str] = None

@router.post("/postpartum/set-birth-date")
async def set_birth_date(data: BirthDateInput, current_user: User = Depends(get_current_user)):
    """Définir la date d'accouchement réelle (à saisir au 7ème mois)"""
    from routes.push_notifications import send_admin_notification
    
    birth_date = datetime.fromisoformat(data.birth_date)
    
    # Mettre à jour le profil utilisateur
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "actual_birth_date": data.birth_date,
            "baby_name": data.baby_name,
            "birth_date_set_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Calculer la date de début du post-partum
    postpartum_start = birth_date
    
    # Planifier les rappels de RDV post-partum
    await schedule_postpartum_reminders(current_user.id, current_user.email, birth_date)
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Date d'accouchement enregistrée",
            body=f"{current_user.email} a renseigné sa date d'accouchement: {data.birth_date}",
            url="/admin",
            category="Post-partum"
        )
    except:
        pass
    
    return {
        "success": True,
        "message": "Date d'accouchement enregistrée",
        "postpartum_start": postpartum_start.isoformat(),
        "reminders_scheduled": True
    }

@router.get("/postpartum/status")
async def get_postpartum_status(current_user: User = Depends(get_current_user)):
    """Vérifier le statut du suivi post-partum"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    postpartum_unlocked = user.get("postpartum_purchased", False) or user.get("postpartum_free_via_referral", False)
    actual_birth_date = user.get("actual_birth_date")
    
    # Vérifier si l'utilisatrice est au 7ème mois ou plus
    profile = await db.pregnancy_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    can_set_birth_date = False
    weeks_pregnant = 0
    
    if profile and profile.get("current_week"):
        weeks_pregnant = profile.get("current_week", 0)
        can_set_birth_date = weeks_pregnant >= 28  # 7ème mois = semaine 28+
    
    # Vérifier si le post-partum a démarré
    postpartum_started = False
    days_since_birth = 0
    current_postpartum_week = 0
    
    if actual_birth_date:
        birth = datetime.fromisoformat(actual_birth_date)
        today = datetime.now(timezone.utc).replace(tzinfo=None)
        days_since_birth = (today - birth).days
        postpartum_started = days_since_birth >= 0
        current_postpartum_week = max(0, days_since_birth // 7)
    
    return {
        "postpartum_unlocked": postpartum_unlocked,
        "actual_birth_date": actual_birth_date,
        "baby_name": user.get("baby_name"),
        "can_set_birth_date": can_set_birth_date,
        "weeks_pregnant": weeks_pregnant,
        "postpartum_started": postpartum_started,
        "days_since_birth": days_since_birth,
        "current_postpartum_week": current_postpartum_week
    }

async def schedule_postpartum_reminders(user_id: str, user_email: str, birth_date: datetime):
    """Planifier les rappels pour les RDV post-partum (7j et 3j avant)"""
    
    appointments = POSTPARTUM_CONTENT["appointments"]
    
    for apt in appointments:
        apt_week = apt["week"]
        apt_date = birth_date + timedelta(weeks=apt_week)
        
        # Créer les rappels 7 jours et 3 jours avant
        reminder_7d = apt_date - timedelta(days=7)
        reminder_3d = apt_date - timedelta(days=3)
        
        # Stocker les rappels dans la BDD
        for reminder_date, days_before in [(reminder_7d, 7), (reminder_3d, 3)]:
            await db.postpartum_reminders.update_one(
                {
                    "user_id": user_id,
                    "appointment_title": apt["title"],
                    "days_before": days_before
                },
                {"$set": {
                    "user_id": user_id,
                    "user_email": user_email,
                    "appointment_title": apt["title"],
                    "appointment_type": apt["type"],
                    "appointment_week": apt_week,
                    "appointment_date": apt_date.isoformat(),
                    "reminder_date": reminder_date.isoformat(),
                    "days_before": days_before,
                    "sent": False,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )

@router.get("/postpartum/pending-reminders")
async def get_pending_reminders(current_user: User = Depends(get_current_user)):
    """Récupérer les rappels en attente pour l'utilisateur"""
    today = datetime.now(timezone.utc).replace(tzinfo=None).isoformat()[:10]
    
    reminders = await db.postpartum_reminders.find(
        {
            "user_id": current_user.id,
            "sent": False,
            "reminder_date": {"$lte": today + "T23:59:59"}
        },
        {"_id": 0}
    ).to_list(50)
    
    return {"reminders": reminders}

@router.post("/postpartum/send-due-reminders")
async def send_due_reminders(current_user: User = Depends(get_current_user)):
    """Envoyer les rappels dus (à appeler périodiquement ou au login)"""
    from routes.push_notifications import send_push_notification
    
    today = datetime.now(timezone.utc).replace(tzinfo=None)
    today_str = today.isoformat()[:10]
    
    # Trouver les rappels à envoyer
    reminders = await db.postpartum_reminders.find(
        {
            "user_id": current_user.id,
            "sent": False,
            "reminder_date": {"$lte": today_str + "T23:59:59"}
        }
    ).to_list(50)
    
    sent_count = 0
    for reminder in reminders:
        try:
            days_before = reminder["days_before"]
            title = f"Rappel RDV dans {days_before} jours"
            body = f"{reminder['appointment_title']} - {reminder['appointment_type']}"
            
            await send_push_notification(
                user_email=reminder["user_email"],
                title=title,
                body=body,
                url="/postpartum"
            )
            
            # Marquer comme envoyé
            await db.postpartum_reminders.update_one(
                {"_id": reminder["_id"]},
                {"$set": {"sent": True, "sent_at": datetime.now(timezone.utc).isoformat()}}
            )
            sent_count += 1
        except Exception as e:
            print(f"Erreur envoi rappel: {e}")
    
    return {"sent_count": sent_count}


# ==================== REFUND SYSTEM (Fausse couche) ====================

@router.post("/postpartum/upload-attestation")
async def upload_attestation(current_user: User = Depends(get_current_user)):
    """Upload an attestation document for refund request"""
    from fastapi import UploadFile, File, Form
    # This will be handled by a separate endpoint with file upload
    pass

from fastapi import UploadFile, File, Form

@router.post("/postpartum/request-refund-with-doc")
async def request_refund_with_document(
    reason: str = Form(...),
    details: str = Form(None),
    document: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Demander un remboursement avec document justificatif"""
    from routes.push_notifications import send_admin_notification
    import os
    import uuid
    
    # Récupérer les infos d'abonnement
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    subscription_start = user.get("subscription_start_date")
    
    if not subscription_start:
        return {"success": False, "message": "Aucun abonnement actif trouvé"}
    
    # Vérifier le type de fichier
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if document.content_type not in allowed_types:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Format de fichier non supporté. Utilisez PDF, JPG ou PNG.")
    
    # Limiter la taille à 5MB
    contents = await document.read()
    if len(contents) > 5 * 1024 * 1024:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")
    
    # Créer le dossier uploads si nécessaire
    upload_dir = "/app/backend/uploads/attestations"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Générer un nom de fichier unique
    file_extension = document.filename.split('.')[-1] if '.' in document.filename else 'pdf'
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Sauvegarder le fichier
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Calculer le montant au prorata
    start_date = datetime.fromisoformat(subscription_start.replace('Z', '+00:00'))
    today = datetime.now(timezone.utc)
    days_used = (today - start_date).days
    total_days = 270  # 9 mois
    days_remaining = max(0, total_days - days_used)
    
    # Calcul du remboursement (27€ pour 9 mois)
    daily_rate = 27.0 / total_days
    refund_amount = round(days_remaining * daily_rate, 2)
    
    # Créer la demande de remboursement avec le document
    refund_request = {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_name": current_user.name,
        "reason": reason,
        "details": details,
        "document_path": file_path,
        "document_filename": document.filename,
        "subscription_start": subscription_start,
        "days_used": days_used,
        "days_remaining": days_remaining,
        "refund_amount": refund_amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.refund_requests.insert_one(refund_request)
    
    # Notifier l'admin
    try:
        reason_text = "Fausse couche" if reason == "miscarriage" else reason
        await send_admin_notification(
            title="Demande de remboursement + Document",
            body=f"{current_user.email} demande un remboursement ({reason_text}) - {refund_amount}€ - Document joint",
            url="/admin",
            category="Remboursement"
        )
    except:
        pass
    
    return {
        "success": True,
        "message": "Votre demande et votre document ont été envoyés. Vous recevrez une notification une fois traitée.",
        "refund_amount_estimated": refund_amount,
        "days_remaining": days_remaining
    }

@router.get("/admin/refund-document/{user_id}")
async def get_refund_document(user_id: str, current_user: User = Depends(get_current_user)):
    """Télécharger le document d'attestation (admin uniquement)"""
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Trouver la demande de remboursement
    request = await db.refund_requests.find_one({"user_id": user_id})
    if not request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    document_path = request.get("document_path")
    if not document_path:
        raise HTTPException(status_code=404, detail="Aucun document joint")
    
    import os
    if not os.path.exists(document_path):
        raise HTTPException(status_code=404, detail="Document non trouvé sur le serveur")
    
    return FileResponse(
        document_path, 
        filename=request.get("document_filename", "attestation"),
        media_type="application/octet-stream"
    )

@router.post("/postpartum/request-refund")
async def request_refund(data: RefundRequest, current_user: User = Depends(get_current_user)):
    """Demander un remboursement (fausse couche ou autre raison médicale)"""
    from routes.push_notifications import send_admin_notification
    
    # Récupérer les infos d'abonnement
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    subscription_start = user.get("subscription_start_date")
    
    if not subscription_start:
        return {"success": False, "message": "Aucun abonnement actif trouvé"}
    
    # Calculer le montant au prorata
    start_date = datetime.fromisoformat(subscription_start.replace('Z', '+00:00'))
    today = datetime.now(timezone.utc)
    days_used = (today - start_date).days
    total_days = 270  # 9 mois
    days_remaining = max(0, total_days - days_used)
    
    # Calcul du remboursement (27€ pour 9 mois)
    daily_rate = 27.0 / total_days
    refund_amount = round(days_remaining * daily_rate, 2)
    
    # Créer la demande de remboursement
    refund_request = {
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_name": current_user.name,
        "reason": data.reason,
        "details": data.details,
        "subscription_start": subscription_start,
        "days_used": days_used,
        "days_remaining": days_remaining,
        "refund_amount": refund_amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.refund_requests.insert_one(refund_request)
    
    # Notifier l'admin
    try:
        reason_text = "Fausse couche" if data.reason == "miscarriage" else data.reason
        await send_admin_notification(
            title="Demande de remboursement",
            body=f"{current_user.email} demande un remboursement ({reason_text}) - {refund_amount}€",
            url="/admin",
            category="Remboursement"
        )
    except:
        pass
    
    return {
        "success": True,
        "message": "Votre demande a été envoyée. Vous recevrez une notification une fois traitée.",
        "refund_amount_estimated": refund_amount,
        "days_remaining": days_remaining
    }

@router.get("/admin/refund-requests")
async def get_refund_requests(current_user: User = Depends(get_current_user)):
    """Récupérer les demandes de remboursement (admin)"""
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    requests = await db.refund_requests.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"requests": requests}

@router.post("/admin/refund-requests/{user_id}/approve")
async def approve_refund(user_id: str, approved: bool, current_user: User = Depends(get_current_user)):
    """Approuver ou rejeter une demande de remboursement (admin)
    Si approuvé, le remboursement Stripe est effectué automatiquement.
    """
    from routes.push_notifications import send_push_notification
    import stripe
    import os
    
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Trouver la demande
    request = await db.refund_requests.find_one({"user_id": user_id, "status": "pending"})
    if not request:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # Récupérer l'utilisateur
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if approved:
        # Effectuer le remboursement Stripe
        payment_intent_id = user.get("stripe_payment_intent_id")
        
        if payment_intent_id:
            try:
                stripe.api_key = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
                refund_amount_cents = int(request["refund_amount"] * 100)
                
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id,
                    amount=refund_amount_cents,
                    reason="requested_by_customer"
                )
                
                if refund.status != "succeeded":
                    from fastapi import HTTPException
                    raise HTTPException(status_code=500, detail=f"Échec du remboursement Stripe: {refund.status}")
                
                # Mettre à jour avec l'ID du remboursement Stripe
                await db.refund_requests.update_one(
                    {"user_id": user_id, "status": "pending"},
                    {"$set": {
                        "status": "approved",
                        "stripe_refund_id": refund.id,
                        "processed_at": datetime.now(timezone.utc).isoformat(),
                        "processed_by": current_user.email
                    }}
                )
                
            except stripe.error.StripeError as e:
                from fastapi import HTTPException
                raise HTTPException(status_code=500, detail=f"Erreur Stripe: {str(e)}")
        else:
            # Pas de payment_intent_id - approuver sans remboursement automatique
            await db.refund_requests.update_one(
                {"user_id": user_id, "status": "pending"},
                {"$set": {
                    "status": "approved",
                    "manual_refund_required": True,
                    "processed_at": datetime.now(timezone.utc).isoformat(),
                    "processed_by": current_user.email
                }}
            )
        
        # Désactiver l'abonnement
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "subscription_status": "refunded",
                "refund_date": datetime.now(timezone.utc).isoformat(),
                "refund_amount": request["refund_amount"]
            }}
        )
        
        # Notifier l'utilisateur
        refund_method = "sur votre carte bancaire" if payment_intent_id else "(remboursement manuel à venir)"
        try:
            await send_push_notification(
                user_email=user["email"],
                title="Remboursement effectué",
                body=f"Votre remboursement de {request['refund_amount']}€ a été effectué {refund_method}.",
                url="/settings"
            )
        except:
            pass
        
        return {"success": True, "status": "approved", "refund_amount": request["refund_amount"]}
    
    else:
        # Rejet de la demande
        await db.refund_requests.update_one(
            {"user_id": user_id, "status": "pending"},
            {"$set": {
                "status": "rejected",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "processed_by": current_user.email
            }}
        )
        
        # Notifier l'utilisateur
        try:
            await send_push_notification(
                user_email=user["email"],
                title="Demande de remboursement",
                body="Votre demande n'a pas pu être acceptée. Contactez-nous pour plus d'informations.",
                url="/settings"
            )
        except:
            pass
        
        return {"success": True, "status": "rejected"}
