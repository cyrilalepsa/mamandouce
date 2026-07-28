"""
Weekly tips and embryo development routes for MamanDouce
"""
from fastapi import APIRouter, HTTPException, Depends
from core.security import get_current_user
from models.schemas import User

router = APIRouter(tags=["tips"])

# Weekly tips database with 3D images and fruit comparisons
WEEKLY_TIPS = {
    1: {
        "week": 1,
        "title": "Le début de l'aventure",
        "description": "Félicitations ! Votre grossesse commence. L'ovule fécondé voyage vers l'utérus pour s'implanter.",
        "embryo_size": "0.1 mm",
        "embryo_weight": "< 1 g",
        "fruit_comparison": "un grain de sable",
        "development": "L'œuf fécondé se divise en plusieurs cellules tout en descendant vers l'utérus.",
        "image_url": "",
        "administrative_tasks": []
    },
    2: {
        "week": 2,
        "title": "La division cellulaire",
        "description": "L'œuf fécondé continue de se diviser en descendant vers l'utérus. Il forme maintenant un blastocyste.",
        "embryo_size": "0.2 mm",
        "embryo_weight": "< 1 g",
        "fruit_comparison": "une graine de pavot",
        "development": "Les cellules se multiplient rapidement. Le blastocyste se prépare à l'implantation.",
        "image_url": "",
        "administrative_tasks": []
    },
    3: {
        "week": 3,
        "title": "L'implantation commence",
        "description": "Le blastocyste s'implante dans la paroi utérine. C'est le début de la nidation !",
        "embryo_size": "0.3 mm",
        "embryo_weight": "< 1 g",
        "fruit_comparison": "une graine de sésame",
        "development": "L'embryon s'enfouit dans la muqueuse utérine. Les premières connexions avec votre corps s'établissent.",
        "image_url": "",
        "administrative_tasks": []
    },
    4: {
        "week": 4,
        "title": "L'implantation",
        "description": "L'embryon s'implante dans la paroi utérine. C'est le moment où vous pourriez avoir un test positif !",
        "embryo_size": "1-2 mm",
        "embryo_weight": "< 1 g",
        "fruit_comparison": "une graine de pavot",
        "development": "Le cœur commence à se former. Les premières cellules nerveuses apparaissent.",
        "image_url": "",
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
        "fruit_comparison": "une framboise",
        "development": "Les bras et jambes s'allongent. Les doigts et orteils commencent à se former. Le visage prend forme.",
        "image_url": "",
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
        "fruit_comparison": "un citron vert",
        "development": "Le fœtus peut bouger ses membres. Les organes génitaux commencent à se différencier.",
        "image_url": "",
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
        "fruit_comparison": "un avocat",
        "development": "Le fœtus peut sucer son pouce. Les cheveux et sourcils apparaissent. Il peut entendre les sons.",
        "image_url": "",
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
        "fruit_comparison": "une banane",
        "development": "Le fœtus est recouvert de vernix (substance protectrice). Il alterne phases de sommeil et d'éveil.",
        "image_url": "",
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
        "fruit_comparison": "un épi de maïs",
        "development": "Les poumons se développent. Le cerveau se complexifie. Bébé a des cycles de sommeil réguliers.",
        "image_url": "",
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
        "fruit_comparison": "une aubergine",
        "development": "Les yeux s'ouvrent. Le système nerveux se perfectionne. Bébé reconnaît votre voix.",
        "image_url": "",
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
        "fruit_comparison": "un ananas",
        "development": "Les poumons arrivent à maturité. Bébé stocke du fer et du calcium. Il prend environ 200g par semaine.",
        "image_url": "",
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
        "fruit_comparison": "un melon",
        "development": "La plupart des organes sont matures. Bébé descend dans le bassin. Il a moins de place pour bouger.",
        "image_url": "",
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
        "fruit_comparison": "une pastèque",
        "development": "Bébé est prêt à naître. Il pèse en moyenne 3.3 kg. Ses réflexes sont au point.",
        "image_url": "",
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
    
    base_tip = WEEKLY_TIPS.get(lower_week, WEEKLY_TIPS[1])
    
    # Calculate embryo size and weight based on week
    if week <= 4:
        size = f"{week * 0.5:.1f} mm"
        weight = "< 1 g"
        fruit = "une graine de pavot"
    elif week <= 8:
        size = f"{(week * 0.2):.1f} cm"
        weight = f"{max(1, week - 7)} g"
        fruit = "une framboise"
    elif week <= 12:
        size = f"{(week * 0.5):.1f} cm"
        weight = f"{(week - 8) * 3 + 1} g"
        fruit = "un citron vert"
    elif week <= 16:
        size = f"{week - 4} cm"
        weight = f"{(week - 12) * 20 + 14} g"
        fruit = "un avocat"
    elif week <= 20:
        size = f"{week - 4} cm"
        weight = f"{(week - 16) * 50 + 100} g"
        fruit = "une banane"
    elif week <= 24:
        size = f"{16 + (week - 20) * 3.5:.0f} cm"
        weight = f"{(week - 20) * 75 + 300:.0f} g"
        fruit = "un épi de maïs"
    elif week <= 28:
        size = f"{30 + (week - 24) * 1.75:.0f} cm"
        weight = f"{((week - 24) * 100 + 600):.0f} g"
        fruit = "une aubergine"
    elif week <= 32:
        size = f"{37 + (week - 28) * 1.25:.0f} cm"
        weight = f"{1 + (week - 28) * 0.175:.1f} kg"
        fruit = "un ananas"
    elif week <= 36:
        size = f"{42 + (week - 32) * 1.25:.0f} cm"
        weight = f"{1.7 + (week - 32) * 0.225:.1f} kg"
        fruit = "un melon"
    else:
        size = f"{47 + (week - 36) * 0.75:.0f} cm"
        weight = f"{2.6 + (week - 36) * 0.175:.1f} kg"
        fruit = "une pastèque"
    
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
        "fruit_comparison": fruit,
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
        "fruit_comparison": tip.get("fruit_comparison", ""),
        "development": tip.get("development", ""),
        "image_url": tip.get("image_url")
    }
