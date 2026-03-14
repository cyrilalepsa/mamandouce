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
    """Approuver ou rejeter une demande de remboursement (admin)"""
    from routes.push_notifications import send_push_notification
    
    if current_user.role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Trouver la demande
    request = await db.refund_requests.find_one({"user_id": user_id, "status": "pending"})
    if not request:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    status = "approved" if approved else "rejected"
    
    # Mettre à jour le statut
    await db.refund_requests.update_one(
        {"user_id": user_id, "status": "pending"},
        {"$set": {
            "status": status,
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "processed_by": current_user.email
        }}
    )
    
    # Si approuvé, désactiver l'abonnement
    if approved:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "subscription_status": "refunded",
                "refund_date": datetime.now(timezone.utc).isoformat(),
                "refund_amount": request["refund_amount"]
            }}
        )
    
    # Notifier l'utilisateur
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1})
    if user:
        if approved:
            title = "Remboursement approuvé"
            body = f"Votre demande de remboursement a été approuvée. Montant: {request['refund_amount']}€"
        else:
            title = "Demande de remboursement"
            body = "Votre demande n'a pas pu être acceptée. Contactez-nous pour plus d'informations."
        
        try:
            await send_push_notification(
                user_email=user["email"],
                title=title,
                body=body,
                url="/settings"
            )
        except:
            pass
    
    return {"success": True, "status": status}
