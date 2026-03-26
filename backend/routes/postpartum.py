from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
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


# ==================== MATERNITY BAG FAVORITES ====================

class MaternityBagFavorite(BaseModel):
    item_name: str

@router.get("/maternity-bag/favorites")
async def get_maternity_bag_favorites(current_user: User = Depends(get_current_user)):
    """Récupérer la liste des articles favoris du sac de maternité"""
    user_favorites = await db.maternity_bag_favorites.find_one({"user_id": current_user.id})
    
    if user_favorites:
        return {"favorites": user_favorites.get("items", [])}
    
    return {"favorites": []}

@router.post("/maternity-bag/favorites/toggle")
async def toggle_maternity_bag_favorite(data: MaternityBagFavorite, current_user: User = Depends(get_current_user)):
    """Ajouter ou retirer un article des favoris du sac de maternité"""
    user_favorites = await db.maternity_bag_favorites.find_one({"user_id": current_user.id})
    
    if not user_favorites:
        # Créer le document de favoris pour cet utilisateur
        await db.maternity_bag_favorites.insert_one({
            "user_id": current_user.id,
            "items": [data.item_name],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "is_favorite": True, "message": "Article ajouté aux favoris"}
    
    current_favorites = user_favorites.get("items", [])
    
    if data.item_name in current_favorites:
        # Retirer des favoris
        await db.maternity_bag_favorites.update_one(
            {"user_id": current_user.id},
            {"$pull": {"items": data.item_name}}
        )
        return {"success": True, "is_favorite": False, "message": "Article retiré des favoris"}
    else:
        # Ajouter aux favoris
        await db.maternity_bag_favorites.update_one(
            {"user_id": current_user.id},
            {"$push": {"items": data.item_name}}
        )
        return {"success": True, "is_favorite": True, "message": "Article ajouté aux favoris"}


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
            "description": "Période de tristesse passagère (3-10 jours après l'accouchement). C'est normal et temporaire, touchant 50 à 80% des mamans.",
            "symptoms": ["Pleurs inexpliqués", "Sautes d'humeur", "Fatigue intense", "Anxiété légère", "Sentiment de vide"],
            "advice": [
                "Reposez-vous autant que possible",
                "Acceptez l'aide de vos proches sans culpabiliser",
                "Parlez de vos émotions à votre partenaire ou une amie",
                "Sortez prendre l'air quotidiennement, même 10 minutes",
                "Ne restez pas seule, entourez-vous"
            ],
            "alert": "Si les symptômes persistent au-delà de 2 semaines, consultez votre médecin.",
            "video_url": "https://www.youtube.com/watch?v=LCZ7xNPCCos",
            "resources": ["Numéro vert Parentalité : 0 800 00 34 56 (gratuit)"]
        },
        {
            "title": "Dépression post-partum",
            "description": "Trouble plus profond qui touche 10 à 20% des mamans et nécessite une prise en charge médicale. Ce n'est pas un échec, c'est une maladie qui se soigne très bien.",
            "symptoms": ["Tristesse profonde persistante", "Difficultés à créer un lien avec bébé", "Pensées négatives récurrentes", "Troubles du sommeil importants", "Perte d'appétit", "Sentiment de ne pas être à la hauteur"],
            "advice": [
                "Consultez rapidement un professionnel de santé",
                "Ne culpabilisez pas, ce n'est pas de votre faute",
                "Parlez-en à votre entourage",
                "Un traitement adapté permet une guérison complète",
                "Des groupes de parole existent et aident beaucoup"
            ],
            "alert": "Contactez votre médecin ou appelez le 3114 (numéro national de prévention du suicide).",
            "video_url": "https://www.youtube.com/watch?v=SxS6U-lz8nE",
            "resources": ["3114 - Numéro national de prévention du suicide", "Association Maman Blues : www.maman-blues.fr"]
        },
        {
            "title": "Difficultés d'allaitement",
            "description": "Crevasses, engorgement, mastite sont fréquents mais se traitent bien avec un accompagnement adapté.",
            "symptoms": ["Douleurs lors des tétées", "Seins durs et douloureux", "Fièvre (mastite)", "Crevasses douloureuses", "Bébé qui ne prend pas bien le sein"],
            "advice": [
                "Consultez une conseillère en lactation IBCLC rapidement",
                "Vérifiez la position et la prise du sein",
                "Appliquez du lait maternel sur les crevasses",
                "En cas d'engorgement : tétées fréquentes + froid entre les tétées",
                "Utilisez des coquillages d'allaitement ou des coussinets en argent"
            ],
            "alert": "En cas de fièvre avec douleur au sein, consultez dans les 24h (risque de mastite).",
            "video_url": "https://www.youtube.com/watch?v=5_V7V4Xwlno",
            "resources": ["Trouver une consultante IBCLC : www.consultants-lactation.org"]
        },
        {
            "title": "Fatigue extrême",
            "description": "Les nuits hachées et les soins constants épuisent. C'est normal mais il faut prévenir l'épuisement maternel.",
            "symptoms": ["Épuisement permanent", "Difficultés de concentration", "Irritabilité", "Pleurs faciles", "Sentiment d'être débordée"],
            "advice": [
                "Dormez quand bébé dort, même en journée",
                "Acceptez TOUTE l'aide proposée sans culpabiliser",
                "Faites des siestes flash de 20 minutes",
                "Relais avec le co-parent pour les nuits",
                "Simplifiez : repas simples, ménage minimum"
            ],
            "alert": "Si la fatigue s'accompagne de signes dépressifs, parlez-en à votre médecin.",
            "video_url": "https://www.youtube.com/watch?v=h9h3r3p8Kzg"
        },
        {
            "title": "Coliques du nourrisson",
            "description": "Pleurs intenses et prolongés, souvent en fin de journée. Pic vers 6 semaines, disparaissent vers 3-4 mois.",
            "symptoms": ["Pleurs inconsolables en fin de journée", "Bébé qui se tortille", "Ventre tendu", "Poings serrés", "Visage rouge"],
            "advice": [
                "Portez bébé en position tigre (sur l'avant-bras)",
                "Massez le ventre dans le sens des aiguilles d'une montre",
                "Essayez le bruit blanc (aspirateur, sèche-cheveux)",
                "Balancez doucement bébé",
                "Gardez votre calme, bébé ressent votre stress"
            ],
            "alert": "Consultez si les pleurs sont accompagnés de fièvre, vomissements ou refus de manger.",
            "video_url": "https://www.youtube.com/watch?v=o9uHOZmqKSc"
        },
        {
            "title": "Problèmes de sommeil de bébé",
            "description": "Un nouveau-né ne fait pas ses nuits, c'est physiologique. Le sommeil se met en place progressivement.",
            "symptoms": ["Réveils très fréquents", "Difficultés d'endormissement", "Confusion jour/nuit", "Bébé qui ne dort que dans les bras"],
            "advice": [
                "Différenciez le jour et la nuit (lumière, bruit le jour / calme, obscurité la nuit)",
                "Instaurez un rituel du coucher dès les premières semaines",
                "Couchez bébé somnolent mais éveillé",
                "Ne le stimulez pas lors des réveils nocturnes",
                "Patience : les nuits complètes arrivent entre 3 et 6 mois en général"
            ],
            "alert": "Si bébé dort énormément et est difficile à réveiller, consultez.",
            "video_url": "https://www.youtube.com/watch?v=hPJZ6ZYXY3A"
        }
    ],
    "breastfeeding": {
        "title": "Guide de l'allaitement",
        "description": "L'allaitement maternel est recommandé par l'OMS jusqu'à 6 mois exclusif. C'est un apprentissage pour vous et bébé.",
        "benefits": [
            "Protection immunitaire optimale pour bébé (anticorps)",
            "Digestion facilitée (lait parfaitement adapté)",
            "Lien mère-enfant renforcé (ocytocine)",
            "Récupération post-partum accélérée pour maman",
            "Réduction du risque de cancer du sein",
            "Économique et écologique",
            "Toujours à bonne température et disponible"
        ],
        "positions": [
            {
                "name": "Position Madone (classique)",
                "description": "Bébé face à vous, sa tête dans le creux de votre coude, son corps contre le vôtre.",
                "video_url": "https://www.youtube.com/watch?v=y0lL3V4bDOk"
            },
            {
                "name": "Position Ballon de rugby",
                "description": "Bébé sous votre bras, ses pieds vers l'arrière. Idéale après césarienne.",
                "video_url": "https://www.youtube.com/watch?v=2D5c6IHvqQo"
            },
            {
                "name": "Position Allongée",
                "description": "Vous et bébé allongés face à face. Parfaite pour les tétées de nuit.",
                "video_url": "https://www.youtube.com/watch?v=u6Nc-smCQRo"
            },
            {
                "name": "Biological nurturing (BN)",
                "description": "Maman semi-allongée, bébé sur le ventre. Position instinctive qui facilite la prise du sein.",
                "video_url": "https://www.youtube.com/watch?v=vDJST3Xpvs8"
            }
        ],
        "tips": [
            "Mettez bébé au sein dès la première heure si possible (peau à peau)",
            "Allaitez à la demande, sans regarder l'heure (8 à 12 fois/24h au début)",
            "Vérifiez la bonne prise : bouche grande ouverte, lèvres retroussées, menton contre le sein",
            "On doit entendre bébé déglutir après 2-3 succions",
            "Alternez les seins à chaque tétée",
            "Hydratez-vous abondamment (2L d'eau/jour minimum)",
            "Alimentation variée et équilibrée",
            "En cas de douleur persistante, consultez rapidement"
        ],
        "problems_solutions": [
            {
                "problem": "Crevasses",
                "solutions": ["Vérifiez la prise du sein", "Appliquez du lait maternel et laissez sécher", "Utilisez des coquillages d'allaitement", "Lanoline purifiée entre les tétées"],
                "video_url": "https://www.youtube.com/watch?v=n3lRBn4Pz2M"
            },
            {
                "problem": "Engorgement",
                "solutions": ["Tétées très fréquentes", "Massez le sein pendant la tétée", "Appliquez du froid entre les tétées", "Extraire un peu de lait sous la douche chaude"],
                "video_url": "https://www.youtube.com/watch?v=jLTVf7nLkWA"
            },
            {
                "problem": "Mastite",
                "solutions": ["Continuez d'allaiter (important !)", "Repos au lit", "Consultez rapidement si fièvre", "Antibiotiques parfois nécessaires"],
                "video_url": "https://www.youtube.com/watch?v=GCHaX8L7ewo"
            },
            {
                "problem": "Manque de lait (impression)",
                "solutions": ["Allaitez plus souvent (stimule la production)", "Peau à peau fréquent", "Repos et hydratation", "La plupart du temps, c'est une fausse impression"],
                "video_url": "https://www.youtube.com/watch?v=xB-iahwbYsk"
            }
        ],
        "alert": "L'allaitement ne doit pas être douloureux au-delà des premières secondes. Une douleur persistante nécessite un avis professionnel.",
        "resources": [
            "La Leche League France : www.lllfrance.org",
            "Consultants IBCLC : www.consultants-lactation.org",
            "SOS Allaitement : 0 800 800 669 (gratuit)"
        ],
        "video_general": "https://www.youtube.com/watch?v=wjt-Ashodw8"
    },
    "formula": {
        "title": "Guide du biberon",
        "description": "Le lait infantile est une alternative parfaitement adaptée aux besoins de bébé. Que ce soit par choix ou par nécessité, donner le biberon est aussi un moment de tendresse.",
        "info": "Les laits infantiles sont très réglementés et couvrent tous les besoins nutritionnels de bébé.",
        "preparation": {
            "steps": [
                "Lavez-vous les mains",
                "Versez l'eau (température ambiante ou tiède) dans le biberon",
                "Ajoutez le nombre de mesurettes adapté (1 mesurette arasée pour 30ml)",
                "Fermez et secouez énergiquement",
                "Vérifiez la température sur l'intérieur de votre poignet",
                "Donnez le biberon dans les 30 minutes ou jetez"
            ],
            "video_url": "https://www.youtube.com/watch?v=eZnLgP1zMno"
        },
        "tips": [
            "Utilisez de l'eau faiblement minéralisée (< 500mg/L de résidu sec)",
            "1 mesurette arasée pour 30ml d'eau (ne pas tasser)",
            "Température idéale : 37°C (tiède, pas chaud)",
            "Ne réchauffez JAMAIS un biberon entamé",
            "Jetez le reste de lait après 1h maximum",
            "Stérilisez les biberons les 4 premiers mois",
            "Gardez bébé semi-assis pendant le biberon",
            "Faites des pauses et des rots pendant la tétée"
        ],
        "types": [
            {"name": "Lait 1er âge", "age": "0-6 mois", "description": "Adapté aux besoins spécifiques du nouveau-né", "icon": "🍼"},
            {"name": "Lait 2ème âge", "age": "6-12 mois", "description": "Accompagne la diversification alimentaire", "icon": "🍼"},
            {"name": "Lait de croissance", "age": "1-3 ans", "description": "Complète l'alimentation diversifiée, enrichi en fer", "icon": "🥛"},
            {"name": "Lait AR (anti-régurgitations)", "age": "Sur avis médical", "description": "Épaissi pour limiter les reflux", "icon": "💊"},
            {"name": "Lait HA (hypoallergénique)", "age": "Sur avis médical", "description": "Pour les bébés à risque allergique", "icon": "🛡️"}
        ],
        "quantities": [
            {"age": "0-1 mois", "quantity": "60-90ml", "frequency": "7-8 biberons/jour"},
            {"age": "1-2 mois", "quantity": "90-120ml", "frequency": "6-7 biberons/jour"},
            {"age": "2-3 mois", "quantity": "120-150ml", "frequency": "5-6 biberons/jour"},
            {"age": "3-4 mois", "quantity": "150-180ml", "frequency": "5 biberons/jour"},
            {"age": "4-6 mois", "quantity": "180-210ml", "frequency": "4-5 biberons/jour"}
        ],
        "equipment": [
            {"item": "Biberons (verre ou plastique sans BPA)", "quantity": "6-8"},
            {"item": "Tétines adaptées à l'âge", "quantity": "6-8"},
            {"item": "Goupillon de nettoyage", "quantity": "1"},
            {"item": "Stérilisateur (optionnel)", "quantity": "1"},
            {"item": "Chauffe-biberon (optionnel)", "quantity": "1"}
        ],
        "problems_solutions": [
            {
                "problem": "Bébé refuse le biberon",
                "solutions": ["Essayez une autre forme de tétine", "Changez la position", "Faites donner le biberon par quelqu'un d'autre", "Vérifiez la température du lait"],
                "video_url": "https://www.youtube.com/watch?v=bXpH_dyaJbs"
            },
            {
                "problem": "Régurgitations fréquentes",
                "solutions": ["Faites des pauses pendant le biberon", "Gardez bébé vertical 20 min après", "Ne le couchez pas juste après", "Consultez si très fréquentes"],
                "video_url": "https://www.youtube.com/watch?v=_v3qmDGXLfY"
            },
            {
                "problem": "Coliques",
                "solutions": ["Utilisez une tétine anti-colique", "Faites des rots réguliers", "Massez le ventre de bébé", "Consultez si ça persiste"],
                "video_url": "https://www.youtube.com/watch?v=o9uHOZmqKSc"
            }
        ],
        "alert": "Ne changez pas de lait sans avis médical. En cas de régurgitations importantes, coliques persistantes ou signes d'allergie (eczéma, diarrhée), consultez votre pédiatre.",
        "video_general": "https://www.youtube.com/watch?v=RNLnF0BJ8Es"
    },
    "diapers": {
        "title": "Guide des couches",
        "description": "Changer bébé régulièrement est essentiel pour son confort et éviter les irritations.",
        "frequency": "8 à 12 changes par jour les premières semaines, puis 6-8 par jour",
        "tips": [
            "Changez bébé dès que la couche est souillée",
            "Nettoyez toujours de l'avant vers l'arrière (surtout pour les filles)",
            "Séchez bien les plis avant de mettre une couche propre",
            "Utilisez du liniment oléo-calcaire ou une crème protectrice",
            "Laissez les fesses à l'air quelques minutes par jour",
            "La couche ne doit pas être trop serrée (2 doigts doivent passer)"
        ],
        "sizes": [
            {"size": "1", "weight": "2-5 kg", "age": "Naissance - 2 mois", "icon": "👶", "per_day": "10-12"},
            {"size": "2", "weight": "3-6 kg", "age": "1-3 mois", "icon": "👶", "per_day": "8-10"},
            {"size": "3", "weight": "4-9 kg", "age": "3-6 mois", "icon": "🧒", "per_day": "6-8"},
            {"size": "4", "weight": "7-18 kg", "age": "6-18 mois", "icon": "🧒", "per_day": "5-7"},
            {"size": "5", "weight": "11-25 kg", "age": "18 mois - 3 ans", "icon": "👧", "per_day": "4-6"},
            {"size": "6", "weight": "15+ kg", "age": "+ de 3 ans", "icon": "👧", "per_day": "4-5"}
        ],
        "brands": [
            {
                "name": "Pampers",
                "description": "Marque premium avec programme fidélité avantageux",
                "loyalty_url": "https://www.pampers.fr/rewards",
                "loyalty_info": "Scannez les codes sur les paquets pour cumuler des points et obtenir des cadeaux gratuits !"
            },
            {
                "name": "Lotus Baby",
                "description": "Bon rapport qualité-prix, sans parfum"
            },
            {
                "name": "Carryboo",
                "description": "Couches écologiques françaises"
            },
            {
                "name": "Marques distributeurs",
                "description": "Carrefour, Leclerc, Auchan - souvent très bien notées"
            }
        ],
        "money_saving_tips": [
            {
                "tip": "Carte fidélité Carrefour",
                "description": "Les couches sont régulièrement en promotion avec remboursement jusqu'à 50% en cagnotte ! Surveillez les catalogues.",
                "icon": "💰"
            },
            {
                "tip": "Programme Pampers Rewards",
                "description": "Inscrivez-vous sur pampers.fr et scannez les codes pour cumuler des points échangeables contre des cadeaux.",
                "icon": "🎁",
                "url": "https://www.pampers.fr/rewards"
            },
            {
                "tip": "Achats en gros",
                "description": "Les mega-packs sont plus économiques. Stockez la taille actuelle + la suivante.",
                "icon": "📦"
            },
            {
                "tip": "Comparateurs en ligne",
                "description": "Utilisez des sites comme couches.org pour comparer les prix au centime près.",
                "icon": "🔍"
            }
        ],
        "eco_alternatives": [
            {
                "name": "Couches lavables",
                "description": "Économiques sur le long terme (environ 500€ vs 1500€ en jetables), écologiques",
                "video_url": "https://www.youtube.com/watch?v=MK8bR4a_uZg"
            },
            {
                "name": "Couches écologiques jetables",
                "description": "Sans chlore ni parfum, plus respectueuses de la peau. Marques : Joone, Lillydoo, Carryboo"
            }
        ],
        "change_tutorial": {
            "steps": [
                "Rassemblez tout le matériel à portée de main",
                "Allongez bébé sur le dos sur une surface propre",
                "Ouvrez la couche sale et repliez-la sous les fesses",
                "Nettoyez de l'avant vers l'arrière avec du coton et liniment",
                "Soulevez les fesses en tenant les chevilles",
                "Retirez la couche sale et placez la propre",
                "Fermez les scratchs à hauteur du nombril",
                "Vérifiez que la couche n'est pas trop serrée"
            ],
            "video_url": "https://www.youtube.com/watch?v=aZCPM-Vq0zM"
        },
        "alert": "Rougeurs persistantes = consultez. Ça peut être une allergie aux composants de la couche, une mycose ou un érythème fessier nécessitant un traitement.",
        "video_general": "https://www.youtube.com/watch?v=aZCPM-Vq0zM"
    },
    "precautions": [
        {
            "title": "Couchage sécurisé",
            "description": "La prévention de la mort inattendue du nourrisson (MIN) passe par des règles de couchage strictes. Ces recommandations sont validées par toutes les autorités de santé.",
            "tips": ["Sur le dos, dans un lit adapté", "Pas d'oreiller ni couverture", "Température chambre 18-20°C", "Pas de co-dodo sur canapé ou fauteuil"],
            "details": [
                "Le couchage sur le dos réduit de 50% le risque de MIN (mort inattendue du nourrisson).",
                "Un matelas ferme et plat évite que bébé ne s'enfonce et ne s'étouffe.",
                "Les tours de lit, couvertures et peluches présentent un risque d'étouffement.",
                "La gigoteuse (turbulette) est le seul moyen sûr de garder bébé au chaud.",
                "Le partage de lit augmente le risque de MIN x5, surtout si fumeur ou après alcool."
            ],
            "video_url": "https://www.youtube.com/watch?v=DfaAcZvJKnY"
        },
        {
            "title": "Hygiène et protection",
            "description": "Le système immunitaire de bébé est immature les premiers mois. Quelques précautions simples le protègent des infections.",
            "tips": ["Lavez-vous les mains avant de toucher bébé", "Limitez les visites les premières semaines", "Évitez les lieux très fréquentés", "Pas de bisous sur le visage par les visiteurs"],
            "details": [
                "Le lavage des mains est le geste le plus efficace contre les infections.",
                "Les personnes enrhumées ou grippées ne doivent pas approcher bébé.",
                "Le virus de l'herpès (bouton de fièvre) peut être mortel pour un nouveau-né.",
                "Les premières semaines, limitez les visites à 2-3 personnes à la fois.",
                "Évitez les transports en commun et centres commerciaux avant 2 mois."
            ]
        },
        {
            "title": "Signes d'alerte bébé",
            "description": "Certains symptômes chez le nouveau-né nécessitent une consultation urgente. Apprenez à les reconnaître pour réagir rapidement.",
            "tips": ["Fièvre > 38°C avant 3 mois = URGENCES", "Refus de s'alimenter sur plusieurs heures", "Pleurs inconsolables inhabituels", "Teint gris, pâle ou bleuté", "Difficultés respiratoires visibles"],
            "details": [
                "Avant 3 mois, toute fièvre > 38°C est une urgence médicale (risque d'infection grave).",
                "Un bébé qui refuse de manger pendant plus de 8h doit être vu par un médecin.",
                "Des pleurs très différents de d'habitude peuvent signaler une douleur ou maladie.",
                "Un teint gris ou des lèvres bleues indiquent un problème d'oxygénation urgent.",
                "Une respiration rapide (> 60/min) ou sifflante nécessite une consultation rapide.",
                "En cas de doute, appelez le 15 (SAMU) ou le 114 (urgences SMS)."
            ],
            "video_url": "https://www.youtube.com/watch?v=9i0AvZK4WmE"
        },
        {
            "title": "Récupération maman",
            "description": "Votre corps a vécu un événement intense. La récupération prend du temps et nécessite d'écouter vos limites.",
            "tips": ["Pas de port de charges lourdes pendant 6 semaines", "Reprise progressive des activités", "Écouter son corps et se reposer", "Pas de bain (douche uniquement) tant que saignements"],
            "details": [
                "Les organes internes reprennent leur place progressivement (6-8 semaines).",
                "Le périnée est fragilisé : évitez les efforts de poussée (constipation, port de charges).",
                "Les saignements (lochies) durent 2 à 6 semaines et sont normaux.",
                "Le bain est déconseillé tant qu'il y a des saignements (risque d'infection).",
                "La rééducation périnéale est recommandée même sans symptômes.",
                "La reprise des rapports se fait quand VOUS vous sentez prête, sans pression."
            ]
        }
    ],
    "babywearing": {
        "title": "Portage bébé",
        "description": "Le portage permet de garder bébé près de vous tout en ayant les mains libres. C'est bénéfique pour le lien parent-enfant et le développement de bébé.",
        "benefits": [
            "Renforce le lien d'attachement",
            "Apaise bébé (retrouve les sensations in utero)",
            "Favorise la digestion et réduit les coliques",
            "Libère les mains des parents",
            "Stimule le développement moteur et sensoriel",
            "Facilite l'allaitement"
        ],
        "types": [
            {
                "name": "Écharpe tissée",
                "age": "Dès la naissance",
                "description": "Polyvalente, plusieurs nouages possibles. Courbe d'apprentissage plus longue.",
                "video_url": "https://www.youtube.com/watch?v=HYJfDBiCk8c"
            },
            {
                "name": "Écharpe extensible (jersey)",
                "age": "0-6 mois (jusqu'à 7-8 kg)",
                "description": "Facile à nouer, très douce. Idéale pour débuter.",
                "video_url": "https://www.youtube.com/watch?v=KY_UP2j-DPo"
            },
            {
                "name": "Porte-bébé préformé",
                "age": "Selon modèle (souvent dès 3-4 mois)",
                "description": "Pratique et rapide à installer. Vérifier qu'il soit physiologique.",
                "video_url": "https://www.youtube.com/watch?v=bGBNiC7JlYk"
            },
            {
                "name": "Mei-Tai",
                "age": "Dès la naissance (avec réducteur)",
                "description": "Hybride entre écharpe et préformé. Bon compromis.",
                "video_url": "https://www.youtube.com/watch?v=8TA3G-FGmAY"
            },
            {
                "name": "Sling (écharpe à anneaux)",
                "age": "Dès la naissance",
                "description": "Installation rapide, idéal pour allaiter. Portage asymétrique.",
                "video_url": "https://www.youtube.com/watch?v=g_W9lQxFNBU"
            }
        ],
        "safety_rules": [
            "Voies aériennes toujours dégagées (menton décollé de la poitrine)",
            "Visage visible en permanence",
            "Position physiologique : genoux plus hauts que les fesses",
            "Dos arrondi naturellement",
            "Bébé assez haut pour l'embrasser sur la tête",
            "Tissu bien serré, pas de jeu"
        ],
        "tips": [
            "Commencez à la maison, au calme",
            "Entraînez-vous avec une poupée ou un coussin d'abord",
            "Faites-vous accompagner par une monitrice de portage si besoin",
            "Portez des vêtements confortables",
            "En été, habillez bébé légèrement (le portage réchauffe)"
        ],
        "video_general": "https://www.youtube.com/watch?v=XINKGY0zBWM"
    },
    "diversification": {
        "title": "Diversification alimentaire",
        "description": "La diversification commence entre 4 et 6 mois. Elle doit être progressive et adaptée au développement de bébé.",
        "when_to_start": {
            "signs": [
                "Bébé tient sa tête droite",
                "Il s'intéresse à ce que vous mangez",
                "Il sait porter des objets à sa bouche",
                "Il a perdu le réflexe d'extrusion (repousse la cuillère)",
                "Il double son poids de naissance (environ)"
            ],
            "age": "Entre 4 et 6 mois, jamais avant 4 mois"
        },
        "stages": [
            {
                "age": "4-6 mois",
                "title": "Les débuts",
                "foods": ["Légumes en purée lisse", "Fruits en compote"],
                "texture": "Très lisse, presque liquide",
                "quantity": "Quelques cuillères",
                "tips": "Un nouvel aliment à la fois, attendez 2-3 jours avant d'en introduire un autre",
                "video_url": "https://www.youtube.com/watch?v=tKVwqUPLBRk"
            },
            {
                "age": "6-8 mois",
                "title": "Élargissement",
                "foods": ["Viandes/poissons mixés", "Féculents", "Légumineuses", "Fromages"],
                "texture": "Moulinée puis écrasée",
                "quantity": "120-150g de purée + 10g de viande/poisson",
                "tips": "Introduisez les protéines animales (10g/jour)",
                "video_url": "https://www.youtube.com/watch?v=f3yJrFK9qow"
            },
            {
                "age": "8-12 mois",
                "title": "Vers l'autonomie",
                "foods": ["Morceaux fondants", "Finger foods", "Œufs"],
                "texture": "Morceaux mous, petits dés",
                "quantity": "Repas structurés (entrée/plat/dessert)",
                "tips": "Laissez bébé toucher et manger seul",
                "video_url": "https://www.youtube.com/watch?v=4Ae94DvgJGk"
            }
        ],
        "forbidden_foods": [
            {"food": "Miel", "until": "1 an", "reason": "Risque de botulisme"},
            {"food": "Sel", "until": "1 an", "reason": "Reins immatures"},
            {"food": "Sucre ajouté", "until": "Le plus tard possible", "reason": "Mauvaises habitudes"},
            {"food": "Lait de vache", "until": "1 an (en boisson)", "reason": "Non adapté"},
            {"food": "Fruits à coque entiers", "until": "4-5 ans", "reason": "Risque d'étouffement"},
            {"food": "Charcuterie", "until": "3 ans", "reason": "Trop salée et grasse"},
            {"food": "Sodas/jus industriels", "until": "Le plus tard possible", "reason": "Sucre"}
        ],
        "first_vegetables": ["Carotte", "Courgette", "Haricots verts", "Patate douce", "Potiron", "Épinards", "Brocoli"],
        "first_fruits": ["Pomme", "Poire", "Banane", "Pêche", "Abricot", "Mangue", "Compote de pruneaux"],
        "video_general": "https://www.youtube.com/watch?v=PDVhx-ZpfV8"
    },
    "baby_recipes": {
        "title": "Recettes purées pour bébé",
        "description": "Plus de 30 recettes originales et nutritives pour accompagner la diversification de bébé.",
        "tips_cooking": [
            "Privilégiez la cuisson vapeur (préserve les nutriments)",
            "Ne salez pas, n'ajoutez pas de sucre",
            "Utilisez des légumes frais ou surgelés nature",
            "Conservez les purées 48h au frigo ou 2 mois au congélateur",
            "Réchauffez au bain-marie ou micro-ondes (bien mélanger)",
            "Introduisez un nouvel aliment à la fois, attendez 2-3 jours",
            "Ajoutez une cuillère d'huile (colza, olive) pour les lipides"
        ],
        "recipes": [
            {
                "name": "Purée de carottes",
                "age": "4-6 mois",
                "category": "Légumes",
                "ingredients": ["200g de carottes", "Un peu d'eau de cuisson ou lait infantile"],
                "steps": ["Épluchez et coupez les carottes en rondelles", "Faites cuire à la vapeur 15-20 min", "Mixez finement en ajoutant du liquide pour la texture"],
                "tips": "Première purée idéale, naturellement sucrée",
                "video_url": "https://www.youtube.com/watch?v=HVvPpqb6K7A"
            },
            {
                "name": "Purée de courgettes",
                "age": "4-6 mois",
                "category": "Légumes",
                "ingredients": ["200g de courgettes", "1 pomme de terre (optionnel pour épaissir)"],
                "steps": ["Lavez et coupez les courgettes (gardez la peau si bio)", "Cuisez à la vapeur 10-12 min", "Mixez avec un peu d'eau de cuisson"],
                "tips": "Légère et digeste, parfaite pour débuter",
                "video_url": "https://www.youtube.com/watch?v=nQAC9EYxmE4"
            },
            {
                "name": "Purée de potiron onctueux",
                "age": "4-6 mois",
                "category": "Légumes",
                "ingredients": ["200g de potiron", "1 c.à.c d'huile d'olive"],
                "steps": ["Épluchez et coupez le potiron en cubes", "Cuisez à la vapeur 15 min", "Mixez avec l'huile d'olive"],
                "tips": "Riche en bêta-carotène, goût naturellement doux"
            },
            {
                "name": "Purée de haricots verts",
                "age": "4-6 mois",
                "category": "Légumes",
                "ingredients": ["150g de haricots verts", "1 petite pomme de terre"],
                "steps": ["Équeutez les haricots", "Cuisez avec la pomme de terre à la vapeur 15 min", "Mixez finement"],
                "tips": "Source de fibres douces, bien toléré"
            },
            {
                "name": "Purée de petits pois printanière",
                "age": "5-6 mois",
                "category": "Légumes",
                "ingredients": ["150g de petits pois frais ou surgelés", "1 feuille de menthe fraîche (optionnel)", "1 c.à.c de crème fraîche"],
                "steps": ["Cuisez les petits pois à la vapeur 10 min", "Mixez avec la crème et la menthe", "Passez au tamis pour retirer les peaux"],
                "tips": "Riche en protéines végétales"
            },
            {
                "name": "Velouté de panais",
                "age": "5-6 mois",
                "category": "Légumes",
                "ingredients": ["150g de panais", "50g de pomme de terre", "1 noisette de beurre"],
                "steps": ["Épluchez et coupez les légumes", "Cuisez à la vapeur 15-20 min", "Mixez avec le beurre"],
                "tips": "Goût légèrement sucré et parfumé"
            },
            {
                "name": "Purée d'épinards à la ricotta",
                "age": "6 mois",
                "category": "Légumes",
                "ingredients": ["100g d'épinards frais", "1 pomme de terre", "1 c.à.s de ricotta"],
                "steps": ["Lavez bien les épinards", "Cuisez avec la pomme de terre à la vapeur", "Mixez avec la ricotta"],
                "tips": "Riche en fer, la ricotta adoucit le goût"
            },
            {
                "name": "Purée de butternut au curry doux",
                "age": "6-7 mois",
                "category": "Légumes",
                "ingredients": ["200g de butternut", "1 pincée de curry doux", "1 c.à.c d'huile de coco"],
                "steps": ["Cuisez le butternut à la vapeur 15 min", "Mixez avec le curry et l'huile de coco"],
                "tips": "Le curry doux éveille les papilles sans irriter"
            },
            {
                "name": "Purée de betterave rose",
                "age": "6 mois",
                "category": "Légumes",
                "ingredients": ["1 petite betterave cuite", "1 pomme de terre", "1 c.à.c de fromage frais"],
                "steps": ["Coupez la betterave et la pomme de terre", "Mixez avec le fromage frais"],
                "tips": "Couleur attractive, riche en antioxydants"
            },
            {
                "name": "Purée d'artichauts fondants",
                "age": "7-8 mois",
                "category": "Légumes",
                "ingredients": ["2 fonds d'artichauts", "1 pomme de terre", "1 c.à.c de crème"],
                "steps": ["Cuisez les artichauts et pomme de terre à la vapeur", "Mixez avec la crème"],
                "tips": "Bon pour la digestion"
            },
            {
                "name": "Compote pomme-poire",
                "age": "4-6 mois",
                "category": "Fruits",
                "ingredients": ["1 pomme", "1 poire"],
                "steps": ["Épluchez et coupez les fruits", "Cuisez à la vapeur ou à l'étouffée 10 min", "Mixez ou écrasez selon la texture souhaitée"],
                "tips": "Ne pas ajouter de sucre, les fruits sont naturellement sucrés",
                "video_url": "https://www.youtube.com/watch?v=xJR8W0GDLKM"
            },
            {
                "name": "Compote de pêche",
                "age": "5-6 mois",
                "category": "Fruits",
                "ingredients": ["2 pêches mûres"],
                "steps": ["Pelez les pêches (ébouillantez pour faciliter)", "Coupez et retirez le noyau", "Cuisez 5 min et mixez"],
                "tips": "Parfaite en été, très douce"
            },
            {
                "name": "Compote banane-mangue tropicale",
                "age": "6 mois",
                "category": "Fruits",
                "ingredients": ["1/2 banane bien mûre", "1/4 de mangue"],
                "steps": ["Épluchez les fruits", "Écrasez simplement à la fourchette (pas besoin de cuire)"],
                "tips": "Fruits exotiques riches en vitamines, texture onctueuse"
            },
            {
                "name": "Compote pomme-coing parfumée",
                "age": "6 mois",
                "category": "Fruits",
                "ingredients": ["1 pomme", "1/2 coing"],
                "steps": ["Épluchez et coupez les fruits", "Cuisez longtemps (30 min) car le coing est dur", "Mixez finement"],
                "tips": "Parfum délicat d'automne"
            },
            {
                "name": "Compote abricot-vanille",
                "age": "5-6 mois",
                "category": "Fruits",
                "ingredients": ["4 abricots mûrs", "1/2 gousse de vanille"],
                "steps": ["Coupez et dénoyautez les abricots", "Cuisez avec les graines de vanille 10 min", "Mixez"],
                "tips": "La vanille ajoute une note gourmande"
            },
            {
                "name": "Compote poire-châtaigne",
                "age": "7-8 mois",
                "category": "Fruits",
                "ingredients": ["1 poire", "30g de châtaignes cuites"],
                "steps": ["Cuisez la poire à la vapeur", "Mixez avec les châtaignes"],
                "tips": "Recette d'automne réconfortante"
            },
            {
                "name": "Compote fraise-rhubarbe",
                "age": "8 mois",
                "category": "Fruits",
                "ingredients": ["100g de fraises", "50g de rhubarbe"],
                "steps": ["Coupez la rhubarbe, équeutez les fraises", "Cuisez ensemble 15 min", "Mixez"],
                "tips": "Acidulée et originale"
            },
            {
                "name": "Compote de pruneaux énergétique",
                "age": "6 mois",
                "category": "Fruits",
                "ingredients": ["6 pruneaux dénoyautés", "1 pomme"],
                "steps": ["Faites tremper les pruneaux 1h", "Cuisez avec la pomme", "Mixez"],
                "tips": "Aide au transit intestinal"
            },
            {
                "name": "Purée patate douce-carotte",
                "age": "5-6 mois",
                "category": "Légumes",
                "ingredients": ["100g de patate douce", "100g de carottes"],
                "steps": ["Épluchez et coupez les légumes", "Cuisez à la vapeur 15-20 min", "Mixez avec un filet d'huile d'olive"],
                "tips": "Riche en vitamines A, couleur attractive pour bébé"
            },
            {
                "name": "Purée brocoli-pomme de terre",
                "age": "6 mois",
                "category": "Légumes",
                "ingredients": ["100g de brocoli", "1 petite pomme de terre", "1 noisette de beurre"],
                "steps": ["Lavez le brocoli, épluchez la pomme de terre", "Cuisez à la vapeur 15 min", "Mixez avec le beurre"],
                "tips": "Le brocoli est riche en fer et vitamines"
            },
            {
                "name": "Purée poulet-légumes",
                "age": "6-7 mois",
                "category": "Viandes",
                "ingredients": ["10g de blanc de poulet", "100g de légumes au choix", "1 c.à.c d'huile de colza"],
                "steps": ["Cuisez le poulet et les légumes à la vapeur", "Mixez finement le tout", "Ajoutez l'huile et mélangez"],
                "tips": "Première introduction de viande, commencez par 10g"
            },
            {
                "name": "Purée dinde-potiron",
                "age": "6-7 mois",
                "category": "Viandes",
                "ingredients": ["10g d'escalope de dinde", "150g de potiron", "1 c.à.c d'huile d'olive"],
                "steps": ["Cuisez la dinde et le potiron à la vapeur 15 min", "Mixez ensemble avec l'huile"],
                "tips": "La dinde est une viande très maigre et digeste"
            },
            {
                "name": "Purée bœuf-courgette",
                "age": "7-8 mois",
                "category": "Viandes",
                "ingredients": ["15g de bœuf haché", "150g de courgettes", "1 c.à.c d'huile de colza"],
                "steps": ["Cuisez le bœuf et les courgettes séparément", "Mixez ensemble avec l'huile"],
                "tips": "Le bœuf apporte du fer héminique bien absorbé"
            },
            {
                "name": "Purée agneau-flageolets",
                "age": "8-9 mois",
                "category": "Viandes",
                "ingredients": ["15g d'agneau", "80g de flageolets cuits", "1 c.à.s de crème fraîche"],
                "steps": ["Cuisez l'agneau à la vapeur", "Mixez avec les flageolets et la crème"],
                "tips": "Association classique française"
            },
            {
                "name": "Purée jambon-petits pois",
                "age": "7-8 mois",
                "category": "Viandes",
                "ingredients": ["15g de jambon blanc découenné", "100g de petits pois", "1 pomme de terre"],
                "steps": ["Cuisez les petits pois et pomme de terre", "Mixez avec le jambon"],
                "tips": "Le jambon blanc est doux et peu salé"
            },
            {
                "name": "Purée poisson blanc-fenouil",
                "age": "7-8 mois",
                "category": "Poissons",
                "ingredients": ["15g de cabillaud", "100g de fenouil", "1 pomme de terre"],
                "steps": ["Cuisez le poisson et les légumes à la vapeur", "Vérifiez l'absence d'arêtes", "Mixez le tout"],
                "tips": "Le fenouil aide à la digestion et donne un goût anisé doux"
            },
            {
                "name": "Purée saumon-brocoli",
                "age": "8-9 mois",
                "category": "Poissons",
                "ingredients": ["15g de saumon frais", "100g de brocoli", "1 c.à.c de crème fraîche"],
                "steps": ["Cuisez le saumon et brocoli à la vapeur", "Vérifiez l'absence d'arêtes", "Mixez avec la crème"],
                "tips": "Riche en oméga-3, excellent pour le cerveau"
            },
            {
                "name": "Purée sole-poireau",
                "age": "7-8 mois",
                "category": "Poissons",
                "ingredients": ["15g de filet de sole", "100g de blanc de poireau", "1 pomme de terre"],
                "steps": ["Cuisez tous les ingrédients à la vapeur", "Vérifiez l'absence d'arêtes", "Mixez finement"],
                "tips": "La sole est un poisson très fin et délicat"
            },
            {
                "name": "Purée colin-épinards",
                "age": "8 mois",
                "category": "Poissons",
                "ingredients": ["15g de colin", "80g d'épinards", "1 pomme de terre", "1 noisette de beurre"],
                "steps": ["Cuisez le colin et les légumes à la vapeur", "Mixez avec le beurre"],
                "tips": "Association classique riche en fer"
            },
            {
                "name": "Purée lentilles corail-carottes",
                "age": "8-9 mois",
                "category": "Légumineuses",
                "ingredients": ["30g de lentilles corail", "100g de carottes", "1 c.à.c d'huile d'olive"],
                "steps": ["Rincez les lentilles", "Cuisez avec les carottes 20 min", "Mixez avec l'huile"],
                "tips": "Les lentilles corail sont très digestes et riches en protéines"
            },
            {
                "name": "Purée pois cassés-jambon",
                "age": "9-10 mois",
                "category": "Légumineuses",
                "ingredients": ["40g de pois cassés", "10g de jambon blanc", "1 carotte"],
                "steps": ["Faites tremper les pois cassés 2h", "Cuisez 45 min avec la carotte", "Mixez avec le jambon"],
                "tips": "Très nourrissant et économique"
            },
            {
                "name": "Purée haricots blancs-tomate",
                "age": "9-10 mois",
                "category": "Légumineuses",
                "ingredients": ["50g de haricots blancs cuits", "1 tomate pelée", "1 c.à.c d'huile d'olive", "Basilic frais"],
                "steps": ["Cuisez la tomate 5 min", "Mixez avec les haricots, l'huile et le basilic"],
                "tips": "Saveurs méditerranéennes"
            },
            {
                "name": "Œuf brouillé crémeux",
                "age": "8-9 mois",
                "category": "Œufs",
                "ingredients": ["1/2 œuf", "1 c.à.s de lait infantile", "1 noisette de beurre"],
                "steps": ["Battez l'œuf avec le lait", "Cuisez doucement au beurre en remuant", "Servez bien cuit et onctueux"],
                "tips": "Commencez par le jaune seul, puis l'œuf entier"
            },
            {
                "name": "Flan de courgette à l'œuf",
                "age": "9-10 mois",
                "category": "Œufs",
                "ingredients": ["100g de courgette", "1 œuf", "2 c.à.s de lait", "1 pincée de gruyère râpé"],
                "steps": ["Mixez la courgette cuite avec l'œuf et le lait", "Versez dans un ramequin", "Cuisez au bain-marie 20 min"],
                "tips": "Texture fondante appréciée des bébés"
            },
            {
                "name": "Risotto crémeux aux légumes",
                "age": "9-10 mois",
                "category": "Féculents",
                "ingredients": ["30g de riz rond", "50g de courgette", "50g de carotte", "1 c.à.s de parmesan", "1 noisette de beurre"],
                "steps": ["Cuisez le riz dans 3 fois son volume d'eau", "Ajoutez les légumes coupés en dés", "En fin de cuisson, ajoutez parmesan et beurre", "Écrasez légèrement à la fourchette"],
                "tips": "Texture pour bébés qui commencent les morceaux"
            },
            {
                "name": "Polenta crémeuse au fromage",
                "age": "8-9 mois",
                "category": "Féculents",
                "ingredients": ["30g de polenta", "150ml de lait", "1 c.à.s de gruyère râpé"],
                "steps": ["Portez le lait à ébullition", "Versez la polenta en pluie en remuant", "Cuisez 5 min et ajoutez le fromage"],
                "tips": "Sans gluten, très digeste"
            },
            {
                "name": "Petites pâtes aux légumes",
                "age": "9-10 mois",
                "category": "Féculents",
                "ingredients": ["30g de petites pâtes", "50g de courgette", "50g de tomate", "1 c.à.c d'huile d'olive", "Basilic"],
                "steps": ["Cuisez les pâtes", "Faites revenir les légumes en dés", "Mélangez le tout avec l'huile et le basilic"],
                "tips": "Pour bébés qui commencent à mastiquer"
            },
            {
                "name": "Semoule au lait vanillée",
                "age": "7-8 mois",
                "category": "Desserts",
                "ingredients": ["20g de semoule fine", "100ml de lait infantile", "1/4 de gousse de vanille"],
                "steps": ["Portez le lait à ébullition avec la vanille", "Versez la semoule en pluie", "Remuez 2-3 min"],
                "tips": "Dessert réconfortant et nourrissant"
            },
            {
                "name": "Riz au lait onctueux",
                "age": "8-9 mois",
                "category": "Desserts",
                "ingredients": ["25g de riz rond", "150ml de lait", "1/2 c.à.c de cannelle (optionnel)"],
                "steps": ["Cuisez le riz dans le lait à feu doux 25-30 min", "Remuez régulièrement", "Saupoudrez de cannelle"],
                "tips": "Classique adoré des bébés"
            },
            {
                "name": "Crème de marrons maison",
                "age": "9-10 mois",
                "category": "Desserts",
                "ingredients": ["100g de châtaignes cuites", "50ml de lait", "1/2 c.à.c de vanille"],
                "steps": ["Mixez les châtaignes avec le lait chaud", "Ajoutez la vanille", "Servez tiède ou froid"],
                "tips": "Alternative saine aux crèmes industrielles"
            }
        ],
        "video_general": "https://www.youtube.com/watch?v=sMqG1Xfq3oY"
    }
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
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
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
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
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
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
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
        except Exception as e:
            print(f"Erreur notification utilisateur: {e}")
        
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
        except Exception as e:
            print(f"Erreur notification utilisateur: {e}")
        
        return {"success": True, "status": "rejected"}



# ==================== ACCOUNT EXPIRATION & DATA EXPORT ====================

POSTPARTUM_DURATION_DAYS = 180  # 6 mois

@router.get("/postpartum/account-status")
async def get_account_status(current_user: User = Depends(get_current_user)):
    """Vérifier le statut du compte et la date d'expiration post-partum"""
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    actual_birth_date = user.get("actual_birth_date")
    postpartum_unlocked = user.get("postpartum_purchased", False) or user.get("postpartum_free_via_referral", False)
    account_archived = user.get("account_archived", False)
    
    if not actual_birth_date or not postpartum_unlocked:
        return {
            "has_postpartum": postpartum_unlocked,
            "postpartum_active": False,
            "expiration_date": None,
            "days_remaining": None,
            "account_archived": account_archived
        }
    
    birth = datetime.fromisoformat(actual_birth_date)
    expiration_date = birth + timedelta(days=POSTPARTUM_DURATION_DAYS)
    today = datetime.now(timezone.utc).replace(tzinfo=None)
    days_remaining = (expiration_date - today).days
    
    # Vérifier si le compte devrait être archivé
    postpartum_active = days_remaining > 0 and not account_archived
    
    return {
        "has_postpartum": True,
        "postpartum_active": postpartum_active,
        "expiration_date": expiration_date.isoformat(),
        "days_remaining": max(0, days_remaining),
        "account_archived": account_archived,
        "birth_date": actual_birth_date,
        "baby_name": user.get("baby_name")
    }

@router.get("/postpartum/export-data")
async def export_user_data(current_user: User = Depends(get_current_user)):
    """Exporter toutes les données de l'utilisateur avant archivage"""
    
    # Récupérer les données utilisateur
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password": 0})
    
    # Récupérer le profil de grossesse
    pregnancy_profile = await db.pregnancy_profiles.find_one(
        {"user_id": current_user.id}, {"_id": 0}
    )
    
    # Récupérer l'historique médical
    medical_notes = []
    async for note in db.medical_notes.find({"user_id": current_user.id}, {"_id": 0}):
        medical_notes.append(note)
    
    # Récupérer les notifications/rappels
    notifications = []
    async for notif in db.notifications.find({"user_id": current_user.id}, {"_id": 0}):
        notifications.append(notif)
    
    # Récupérer le sac de maternité
    maternity_bag = await db.maternity_bags.find_one(
        {"user_id": current_user.id}, {"_id": 0}
    )
    
    # Récupérer les favoris
    favorites = []
    async for fav in db.favorites.find({"user_id": current_user.id}, {"_id": 0}):
        favorites.append(fav)
    
    # Récupérer l'historique de recherche
    search_history = []
    async for search in db.search_history.find({"user_id": current_user.id}, {"_id": 0}):
        search_history.append(search)
    
    # Récupérer l'historique du chat
    chat_history = await db.chat_history.find_one(
        {"user_id": current_user.id}, {"_id": 0}
    )
    
    export_data = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user_info": {
            "name": user.get("name"),
            "email": user.get("email"),
            "created_at": user.get("created_at"),
            "baby_name": user.get("baby_name"),
            "actual_birth_date": user.get("actual_birth_date")
        },
        "pregnancy_profile": pregnancy_profile,
        "medical_notes": medical_notes,
        "notifications": notifications,
        "maternity_bag": maternity_bag,
        "favorites": favorites,
        "search_history": search_history,
        "chat_history": chat_history.get("messages", []) if chat_history else []
    }
    
    return export_data

@router.post("/postpartum/archive-account")
async def archive_account(current_user: User = Depends(get_current_user)):
    """Archiver le compte après les 6 mois de post-partum"""
    from routes.push_notifications import send_admin_notification
    
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if user.get("account_archived"):
        raise HTTPException(status_code=400, detail="Le compte est déjà archivé")
    
    # Vérifier que le post-partum est terminé
    actual_birth_date = user.get("actual_birth_date")
    if actual_birth_date:
        birth = datetime.fromisoformat(actual_birth_date)
        expiration_date = birth + timedelta(days=POSTPARTUM_DURATION_DAYS)
        today = datetime.now(timezone.utc).replace(tzinfo=None)
        
        if today < expiration_date:
            days_remaining = (expiration_date - today).days
            raise HTTPException(
                status_code=400, 
                detail=f"Vous pouvez archiver votre compte dans {days_remaining} jours"
            )
    
    # Archiver le compte
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "account_archived": True,
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "subscription_status": "archived"
        }}
    )
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Compte archivé",
            body=f"{current_user.email} a archivé son compte après les 6 mois de post-partum",
            url="/admin",
            category="Compte"
        )
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
    return {"success": True, "message": "Votre compte a été archivé. Merci d'avoir utilisé MamanDouce !"}

@router.post("/postpartum/request-early-archive")
async def request_early_archive(current_user: User = Depends(get_current_user)):
    """Demander un archivage anticipé du compte"""
    from routes.push_notifications import send_admin_notification
    
    user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if user.get("account_archived"):
        raise HTTPException(status_code=400, detail="Le compte est déjà archivé")
    
    # Archiver immédiatement
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "account_archived": True,
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "subscription_status": "archived",
            "early_archive": True
        }}
    )
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Archivage anticipé demandé",
            body=f"{current_user.email} a demandé l'archivage anticipé de son compte",
            url="/admin",
            category="Compte"
        )
    except Exception as e:
        print(f"Erreur notification admin: {e}")
    
    return {"success": True, "message": "Votre compte a été archivé. Merci d'avoir utilisé MamanDouce !"}



# ==================== RECIPE FAVORITES ====================

class RecipeFavorite(BaseModel):
    recipe_name: str

@router.get("/postpartum/favorites")
async def get_recipe_favorites(current_user: User = Depends(get_current_user)):
    """Récupérer la liste des recettes favorites de l'utilisateur"""
    user_favorites = await db.recipe_favorites.find_one({"user_id": current_user.id})
    
    if user_favorites:
        return {"favorites": user_favorites.get("recipes", [])}
    
    return {"favorites": []}

@router.post("/postpartum/favorites/toggle")
async def toggle_recipe_favorite(data: RecipeFavorite, current_user: User = Depends(get_current_user)):
    """Ajouter ou retirer une recette des favoris"""
    user_favorites = await db.recipe_favorites.find_one({"user_id": current_user.id})
    
    if not user_favorites:
        # Créer le document favoris pour l'utilisateur
        await db.recipe_favorites.insert_one({
            "user_id": current_user.id,
            "recipes": [data.recipe_name],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "is_favorite": True, "message": "Recette ajoutée aux favoris"}
    
    current_favorites = user_favorites.get("recipes", [])
    
    if data.recipe_name in current_favorites:
        # Retirer des favoris
        current_favorites.remove(data.recipe_name)
        await db.recipe_favorites.update_one(
            {"user_id": current_user.id},
            {"$set": {"recipes": current_favorites, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True, "is_favorite": False, "message": "Recette retirée des favoris"}
    else:
        # Ajouter aux favoris
        current_favorites.append(data.recipe_name)
        await db.recipe_favorites.update_one(
            {"user_id": current_user.id},
            {"$set": {"recipes": current_favorites, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"success": True, "is_favorite": True, "message": "Recette ajoutée aux favoris"}


# ==================== RECIPE SHARING ====================

import secrets
import hashlib

class ShareRecipesRequest(BaseModel):
    recipe_names: List[str]

@router.post("/postpartum/share-recipes")
async def create_share_link(data: ShareRecipesRequest, current_user: User = Depends(get_current_user)):
    """Créer un lien de partage pour des recettes"""
    if not data.recipe_names or len(data.recipe_names) == 0:
        raise HTTPException(status_code=400, detail="Aucune recette à partager")
    
    # Générer un code unique pour le partage
    share_code = secrets.token_urlsafe(8)
    
    # Récupérer le nom de l'utilisateur pour personnaliser
    user_name = current_user.name or current_user.email.split('@')[0]
    
    # Sauvegarder le partage
    share_data = {
        "code": share_code,
        "user_id": current_user.id,
        "user_name": user_name,
        "recipes": data.recipe_names,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "views": 0
    }
    
    await db.recipe_shares.insert_one(share_data)
    
    return {
        "success": True,
        "share_code": share_code,
        "recipes_count": len(data.recipe_names),
        "message": f"Lien de partage créé pour {len(data.recipe_names)} recette(s)"
    }

@router.get("/postpartum/shared/{share_code}")
async def get_shared_recipes(share_code: str):
    """Récupérer les recettes partagées (endpoint public)"""
    share = await db.recipe_shares.find_one({"code": share_code})
    
    if not share:
        raise HTTPException(status_code=404, detail="Lien de partage invalide ou expiré")
    
    # Incrémenter le compteur de vues
    result = await db.recipe_shares.find_one_and_update(
        {"code": share_code},
        {"$inc": {"views": 1}},
        return_document=True
    )
    
    # Récupérer les détails des recettes depuis le contenu
    all_recipes = POSTPARTUM_CONTENT.get("baby_recipes", {}).get("recipes", [])
    shared_recipes = [r for r in all_recipes if r.get("name") in share.get("recipes", [])]
    
    return {
        "shared_by": share.get("user_name", "Une maman"),
        "recipes": shared_recipes,
        "recipes_count": len(shared_recipes),
        "views": result.get("views", 1) if result else 1,
        "shared_at": share.get("created_at")
    }

@router.get("/postpartum/my-shares")
async def get_my_shares(current_user: User = Depends(get_current_user)):
    """Récupérer mes partages de recettes"""
    shares = await db.recipe_shares.find({"user_id": current_user.id}).to_list(100)
    
    result = []
    for share in shares:
        result.append({
            "code": share.get("code"),
            "recipes": share.get("recipes", []),
            "recipes_count": len(share.get("recipes", [])),
            "views": share.get("views", 0),
            "created_at": share.get("created_at")
        })
    
    return {"shares": result}

# ==================== CUSTOM RECIPES ====================

class CustomRecipeRequest(BaseModel):
    name: str
    category: str
    age: str
    ingredients: List[str]
    steps: List[str]
    tips: str = None
    video_url: str = None

@router.post("/postpartum/recipes/create")
async def create_custom_recipe(recipe: CustomRecipeRequest, current_user: User = Depends(get_current_user)):
    """Créer une recette personnalisée"""
    import uuid
    
    # Vérifier que le nom n'existe pas déjà
    existing = await db.custom_recipes.find_one({
        "user_id": current_user.id,
        "name": recipe.name
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà une recette avec ce nom")
    
    recipe_data = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "user_name": current_user.name or current_user.email.split('@')[0],
        "name": recipe.name,
        "category": recipe.category,
        "age": recipe.age,
        "ingredients": recipe.ingredients,
        "steps": recipe.steps,
        "tips": recipe.tips,
        "video_url": recipe.video_url,
        "is_custom": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "shares_count": 0
    }
    
    await db.custom_recipes.insert_one(recipe_data)
    
    return {
        "success": True,
        "recipe_id": recipe_data["id"],
        "message": f"Recette '{recipe.name}' créée avec succès !"
    }

@router.get("/postpartum/recipes/my-recipes")
async def get_my_custom_recipes(current_user: User = Depends(get_current_user)):
    """Récupérer mes recettes personnalisées"""
    recipes = await db.custom_recipes.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"recipes": recipes}

@router.delete("/postpartum/recipes/{recipe_id}")
async def delete_custom_recipe(recipe_id: str, current_user: User = Depends(get_current_user)):
    """Supprimer une recette personnalisée"""
    result = await db.custom_recipes.delete_one({
        "id": recipe_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recette non trouvée")
    
    return {"success": True, "message": "Recette supprimée"}

@router.post("/postpartum/recipes/{recipe_id}/share")
async def share_single_recipe(recipe_id: str, current_user: User = Depends(get_current_user)):
    """Partager une recette individuelle (personnalisée ou standard)"""
    
    # Chercher d'abord dans les recettes personnalisées
    custom_recipe = await db.custom_recipes.find_one({"id": recipe_id}, {"_id": 0})
    
    recipe_data = None
    is_custom = False
    
    if custom_recipe:
        recipe_data = custom_recipe
        is_custom = True
    else:
        # Chercher dans les recettes standard par nom
        all_recipes = POSTPARTUM_CONTENT.get("baby_recipes", {}).get("recipes", [])
        for r in all_recipes:
            if r.get("name") == recipe_id:
                recipe_data = r
                break
    
    if not recipe_data:
        raise HTTPException(status_code=404, detail="Recette non trouvée")
    
    # Générer un code de partage unique
    share_code = secrets.token_urlsafe(8)
    
    share_data = {
        "code": share_code,
        "user_id": current_user.id,
        "user_name": current_user.name or current_user.email.split('@')[0],
        "recipe": recipe_data,
        "is_custom": is_custom,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "views": 0
    }
    
    await db.single_recipe_shares.insert_one(share_data)
    
    # Incrémenter le compteur de partages si c'est une recette custom
    if is_custom:
        await db.custom_recipes.update_one(
            {"id": recipe_id},
            {"$inc": {"shares_count": 1}}
        )
    
    return {
        "success": True,
        "share_code": share_code,
        "recipe_name": recipe_data.get("name"),
        "message": f"Recette '{recipe_data.get('name')}' prête à partager !"
    }

@router.get("/postpartum/recipe/shared/{share_code}")
async def get_single_shared_recipe(share_code: str):
    """Récupérer une recette partagée individuellement (endpoint public)"""
    share = await db.single_recipe_shares.find_one({"code": share_code})
    
    if not share:
        raise HTTPException(status_code=404, detail="Lien de partage invalide ou expiré")
    
    # Incrémenter les vues
    await db.single_recipe_shares.update_one(
        {"code": share_code},
        {"$inc": {"views": 1}}
    )
    
    return {
        "shared_by": share.get("user_name", "Une maman"),
        "recipe": share.get("recipe"),
        "is_custom": share.get("is_custom", False),
        "views": share.get("views", 0) + 1,
        "shared_at": share.get("created_at")
    }

