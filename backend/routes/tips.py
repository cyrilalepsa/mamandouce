"""
Weekly tips and embryo development routes for MamanDouce
"""
from fastapi import APIRouter, HTTPException, Depends
from core.security import get_current_user
from models.schemas import User

router = APIRouter(tags=["tips"])

# Weekly tips database with soft pastel images
WEEKLY_TIPS = {
    1: {
        "week": 1,
        "title": "Le début de l'aventure",
        "description": "Félicitations ! Votre grossesse commence. L'ovule fécondé voyage vers l'utérus pour s'implanter.",
        "embryo_size": "0.1 mm",
        "embryo_weight": "< 1 g",
        "development": "L'œuf fécondé se divise en plusieurs cellules tout en descendant vers l'utérus.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/7c8531d062efaab9166d1a615ef941ae7f11c20d966135178bb7c3ab5caa1a8e.png",
        "administrative_tasks": []
    },
    4: {
        "week": 4,
        "title": "L'implantation",
        "description": "L'embryon s'implante dans la paroi utérine. C'est le moment où vous pourriez avoir un test positif !",
        "embryo_size": "1-2 mm",
        "embryo_weight": "< 1 g",
        "development": "Le cœur commence à se former. Les premières cellules nerveuses apparaissent.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/7c8531d062efaab9166d1a615ef941ae7f11c20d966135178bb7c3ab5caa1a8e.png",
        "administrative_tasks": [
            "Prendre rendez-vous chez votre médecin ou sage-femme",
            "Commencer à prendre de l'acide folique si ce n'est pas déjà fait"
        ]
    },
    8: {
        "week": 8,
        "title": "Tous les organes se forment",
        "description": "Votre bébé est maintenant officiellement un fœtus ! Tous les organes majeurs sont en place.",
        "embryo_size": "1.6 cm",
        "embryo_weight": "1 g",
        "development": "Les bras et jambes s'allongent. Les doigts et orteils commencent à se former. Le visage prend forme.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/b3060b830d509e3b607e30f55e3529a548f6bd10acec5d287aff1506046aac43.png",
        "administrative_tasks": [
            "Première échographie à programmer (entre 11-13 SA)",
            "Déclarer votre grossesse à la CAF et à l'Assurance Maladie avant la fin du 3ème mois"
        ]
    },
    12: {
        "week": 12,
        "title": "Fin du premier trimestre",
        "description": "Le risque de fausse couche diminue considérablement. C'est souvent le moment d'annoncer la bonne nouvelle !",
        "embryo_size": "5-6 cm",
        "embryo_weight": "14 g",
        "development": "Le fœtus peut bouger ses membres. Les organes génitaux commencent à se différencier.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/1c45dfa56ed589a003c2a248e085fa2b038528aaea83061727e0d7a3864aec68.png",
        "administrative_tasks": [
            "Déclaration de grossesse obligatoire (avant 15 SA)",
            "Choisir votre maternité",
            "Informer votre employeur"
        ]
    },
    16: {
        "week": 16,
        "title": "Les premiers mouvements",
        "description": "Vous pourriez commencer à sentir les premiers mouvements de bébé, comme des bulles ou papillons.",
        "embryo_size": "11 cm",
        "embryo_weight": "100 g",
        "development": "Le fœtus peut sucer son pouce. Les cheveux et sourcils apparaissent. Il peut entendre les sons.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/1c45dfa56ed589a003c2a248e085fa2b038528aaea83061727e0d7a3864aec68.png",
        "administrative_tasks": [
            "Deuxième échographie à programmer (entre 20-24 SA)",
            "S'inscrire aux cours de préparation à l'accouchement"
        ]
    },
    20: {
        "week": 20,
        "title": "La mi-parcours",
        "description": "Vous êtes à mi-chemin ! L'échographie morphologique permet de vérifier le bon développement de bébé.",
        "embryo_size": "16 cm",
        "embryo_weight": "300 g",
        "development": "Le fœtus est recouvert de vernix (substance protectrice). Il alterne phases de sommeil et d'éveil.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/dc89edd3f226bc5ef28dd942ea477c000b0bf05781b961fa3f8e279f0f2d34ce.png",
        "administrative_tasks": [
            "Échographie morphologique (20-22 SA)",
            "Commencer à réfléchir à la liste de naissance"
        ]
    },
    24: {
        "week": 24,
        "title": "Bébé grandit vite",
        "description": "Le fœtus prend du poids et développe ses sens. Il peut réagir aux sons et à la lumière.",
        "embryo_size": "30 cm",
        "embryo_weight": "600 g",
        "development": "Les poumons se développent. Le cerveau se complexifie. Bébé a des cycles de sommeil réguliers.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/dc89edd3f226bc5ef28dd942ea477c000b0bf05781b961fa3f8e279f0f2d34ce.png",
        "administrative_tasks": [
            "Visite du 6ème mois chez le médecin/sage-femme",
            "Penser à l'inscription en crèche si nécessaire"
        ]
    },
    28: {
        "week": 28,
        "title": "Le troisième trimestre",
        "description": "Début du dernier trimestre ! Bébé continue de grossir et ses mouvements sont bien perceptibles.",
        "embryo_size": "37 cm",
        "embryo_weight": "1 kg",
        "development": "Les yeux s'ouvrent. Le système nerveux se perfectionne. Bébé reconnaît votre voix.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/fd62a7331e376936bf2a6140a0e740674055b7e87859f24c840e22a77cc43565.png",
        "administrative_tasks": [
            "Troisième échographie à programmer (30-32 SA)",
            "Commencer les cours de préparation à l'accouchement",
            "Préparer votre congé maternité"
        ]
    },
    32: {
        "week": 32,
        "title": "Bébé se positionne",
        "description": "Le bébé commence généralement à se positionner la tête en bas pour l'accouchement.",
        "embryo_size": "42 cm",
        "embryo_weight": "1.7 kg",
        "development": "Les poumons arrivent à maturité. Bébé stocke du fer et du calcium. Il prend environ 200g par semaine.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/fd62a7331e376936bf2a6140a0e740674055b7e87859f24c840e22a77cc43565.png",
        "administrative_tasks": [
            "Troisième échographie (30-32 SA)",
            "Préparer la valise de maternité",
            "Visite de la maternité"
        ]
    },
    36: {
        "week": 36,
        "title": "Bientôt prêt",
        "description": "Bébé est presque prêt à naître. Il prend ses derniers grammes et peaufine ses poumons.",
        "embryo_size": "47 cm",
        "embryo_weight": "2.6 kg",
        "development": "La plupart des organes sont matures. Bébé descend dans le bassin. Il a moins de place pour bouger.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/27a8502b66c02123aa389f9d2cf4ef32806821f25d208c809fb767ed89dd8fd0.png",
        "administrative_tasks": [
            "Consultation anesthésiste si péridurale souhaitée",
            "Vérifier que la valise est prête",
            "Connaître le trajet vers la maternité"
        ]
    },
    40: {
        "week": 40,
        "title": "Le grand jour approche",
        "description": "C'est la date prévue d'accouchement ! Bébé peut arriver à tout moment maintenant.",
        "embryo_size": "50 cm",
        "embryo_weight": "3.3 kg",
        "development": "Bébé est prêt à naître. Il pèse en moyenne 3.3 kg. Ses réflexes sont au point.",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/822fce1e816190cca6463c4aa932afb6510849b5c6569ce7bde0a4b8cbf40399.png",
        "administrative_tasks": [
            "Surveiller les signes de travail",
            "Rester sereine, bébé arrive quand il est prêt !",
            "Prévoir qui prévenir à la naissance"
        ]
    }
}

# Generate tips for all 41 weeks by interpolation
def get_tip_for_week(week: int) -> dict:
    """Get tip for any week, interpolating if needed"""
    if week in WEEKLY_TIPS:
        return WEEKLY_TIPS[week]
    
    # Find closest defined weeks
    defined_weeks = sorted(WEEKLY_TIPS.keys())
    lower_week = max([w for w in defined_weeks if w <= week], default=1)
    upper_week = min([w for w in defined_weeks if w >= week], default=40)
    
    base_tip = WEEKLY_TIPS.get(lower_week, WEEKLY_TIPS[1])
    
    # Calculate embryo size and weight based on week
    if week <= 4:
        size = f"{week * 0.5:.1f} mm"
        weight = "< 1 g"
    elif week <= 12:
        size = f"{(week * 0.5):.1f} cm"
        weight = f"{max(1, week - 7)} g"
    elif week <= 20:
        size = f"{week - 4} cm"
        weight = f"{(week - 12) * 30 + 14} g"
    elif week <= 28:
        size = f"{16 + (week - 20) * 1.75:.0f} cm"
        weight = f"{((week - 20) * 75 + 300):.0f} g"
    else:
        size = f"{30 + (week - 28) * 1.7:.0f} cm"
        weight_kg = 1 + (week - 28) * 0.19
        weight = f"{weight_kg:.1f} kg"
    
    trimester = 1 if week <= 13 else (2 if week <= 26 else 3)
    
    return {
        "week": week,
        "title": f"Semaine {week} de grossesse",
        "description": f"Vous êtes à la semaine {week} de votre grossesse. " + 
                      (f"Premier trimestre - période cruciale de développement." if trimester == 1 else
                       f"Deuxième trimestre - bébé grandit vite !" if trimester == 2 else
                       f"Troisième trimestre - la ligne d'arrivée approche !"),
        "embryo_size": size,
        "embryo_weight": weight,
        "development": base_tip.get("development", "Votre bébé continue de se développer."),
        "image_url": base_tip.get("image_url"),
        "administrative_tasks": base_tip.get("administrative_tasks", [])
    }


@router.get("/tips/weekly/{week}")
async def get_weekly_tip(week: int, current_user: User = Depends(get_current_user)):
    """Get weekly tip for a specific week of pregnancy"""
    if week < 1 or week > 41:
        raise HTTPException(status_code=400, detail="Semaine invalide (1-41)")
    
    tip = get_tip_for_week(week)
    return tip


@router.get("/embryo/week/{week}")
async def get_embryo_info(week: int, current_user: User = Depends(get_current_user)):
    """Get embryo development info for a specific week"""
    if week < 1 or week > 41:
        raise HTTPException(status_code=400, detail="Semaine invalide (1-41)")
    
    tip = get_tip_for_week(week)
    
    return {
        "week": week,
        "size": tip.get("embryo_size", "N/A"),
        "weight": tip.get("embryo_weight", "N/A"),
        "development": tip.get("development", ""),
        "image_url": tip.get("image_url")
    }
