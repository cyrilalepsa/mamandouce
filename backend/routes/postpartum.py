from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from core.database import db
from core.security import get_current_user, User

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
    
    # Notifier l'admin
    try:
        await send_admin_notification(
            title="Nouvelle suggestion - Sac maternité",
            body=f"{current_user.email} suggère: {suggestion.item}",
            url="/admin"
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
        {"week": 1, "title": "Visite de sortie maternité", "description": "Examen de maman et bébé avant le retour à la maison", "type": "obligatoire"},
        {"week": 1, "title": "Visite sage-femme à domicile", "description": "Suivi des suites de couches, aide à l'allaitement", "type": "recommandé"},
        {"week": 2, "title": "Consultation pédiatre", "description": "Premier examen complet du bébé, poids, reflexes", "type": "obligatoire"},
        {"week": 3, "title": "Visite sage-femme", "description": "Vérification cicatrisation, soutien allaitement", "type": "recommandé"},
        {"week": 6, "title": "Visite post-natale", "description": "Examen gynécologique, contraception, bien-être psychologique", "type": "obligatoire"},
        {"week": 8, "title": "Vaccins bébé (2 mois)", "description": "Première série de vaccinations obligatoires", "type": "obligatoire"},
        {"week": 10, "title": "Rééducation périnéale", "description": "Début des séances avec une sage-femme ou kiné", "type": "recommandé"},
        {"week": 16, "title": "Vaccins bébé (4 mois)", "description": "Deuxième série de vaccinations", "type": "obligatoire"},
        {"week": 24, "title": "Bilan 6 mois", "description": "Visite pédiatrique, diversification alimentaire", "type": "recommandé"},
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
