# Base de données complète des aliments pour femmes enceintes
# Organisée par ordre alphabétique
# Basé sur les recommandations ANSES, HAS, et autorités sanitaires françaises

FOOD_SAFETY_DATABASE = {
    # ===== A =====
    "abricot": {"name": "Abricot", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine A et fibres. Bien laver avant consommation."},
    "agneau-cuit": {"name": "Agneau bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Cuisson à cœur obligatoire (70°C minimum)."},
    "ail": {"name": "Ail", "safe_for_pregnancy": "safe", "category": "Condiments", "reason": "Bénéfique en quantité modérée."},
    "alcool": {"name": "Alcool", "safe_for_pregnancy": "unsafe", "category": "Boissons", "reason": "INTERDIT. Risque de syndrome d'alcoolisation fœtale."},
    "amandes": {"name": "Amandes", "safe_for_pregnancy": "safe", "category": "Fruits à coque", "reason": "Source de calcium, magnésium et vitamine E."},
    "ananas": {"name": "Ananas", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine C. Consommer avec modération."},
    "anchois": {"name": "Anchois marinés", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Très salé, limiter la consommation."},
    "artichaut": {"name": "Artichaut", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en fibres et acide folique."},
    "asperges": {"name": "Asperges cuites", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Excellente source d'acide folique."},
    "aubergine": {"name": "Aubergine cuite", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien cuire avant consommation."},
    "avocat": {"name": "Avocat", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en acide folique et bonnes graisses."},
    "avoine": {"name": "Avoine (flocons)", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Source de fibres et fer."},
    
    # ===== B =====
    "banane": {"name": "Banane", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en potassium et vitamine B6."},
    "bar-cuit": {"name": "Bar (loup) cuit", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson maigre, bien cuire."},
    "basilic": {"name": "Basilic frais", "safe_for_pregnancy": "safe", "category": "Herbes", "reason": "Bien laver. Consommer avec modération."},
    "betterave": {"name": "Betterave cuite", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en acide folique et fer."},
    "beurre": {"name": "Beurre pasteurisé", "safe_for_pregnancy": "safe", "category": "Produits laitiers", "reason": "Avec modération, source de vitamine A."},
    "biere": {"name": "Bière", "safe_for_pregnancy": "unsafe", "category": "Boissons", "reason": "INTERDIT. Aucune quantité d'alcool n'est sûre."},
    "biscuits": {"name": "Biscuits secs", "safe_for_pregnancy": "safe", "category": "Produits sucrés", "reason": "Avec modération. Vérifier la composition."},
    "blette": {"name": "Blette cuite", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en vitamines et minéraux."},
    "boeuf-cuit": {"name": "Bœuf bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Cuisson à cœur obligatoire. Éviter saignant."},
    "boeuf-cru": {"name": "Bœuf cru (tartare)", "safe_for_pregnancy": "unsafe", "category": "Viandes", "reason": "INTERDIT. Risque de toxoplasmose et listériose."},
    "boudin-noir": {"name": "Boudin noir", "safe_for_pregnancy": "caution", "category": "Charcuterie", "reason": "Bien cuire. Riche en fer mais aussi en vitamine A."},
    "brie": {"name": "Brie au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Risque de listériose. Préférer le brie pasteurisé."},
    "brocoli": {"name": "Brocoli", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Excellent source d'acide folique et vitamine C."},
    
    # ===== C =====
    "cabillaud": {"name": "Cabillaud cuit", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson maigre recommandé, bien cuire."},
    "cafe": {"name": "Café", "safe_for_pregnancy": "caution", "category": "Boissons", "reason": "Maximum 200mg de caféine/jour (2 tasses)."},
    "camembert-lait-cru": {"name": "Camembert au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Risque de listériose. Choisir version pasteurisée."},
    "camembert-pasteurise": {"name": "Camembert pasteurisé", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Sûr si fabriqué avec du lait pasteurisé."},
    "canard-cuit": {"name": "Canard bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Cuisson à cœur obligatoire."},
    "carotte": {"name": "Carotte", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en bêta-carotène. Bien laver si crue."},
    "carpaccio": {"name": "Carpaccio", "safe_for_pregnancy": "unsafe", "category": "Viandes", "reason": "INTERDIT. Viande crue, risque de toxoplasmose."},
    "celeri": {"name": "Céleri", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver. Peut provoquer des allergies."},
    "cereales-petit-dejeuner": {"name": "Céréales petit-déjeuner", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Souvent enrichies en vitamines, vérifier le sucre."},
    "cerise": {"name": "Cerise", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver avant consommation."},
    "champignons-cuits": {"name": "Champignons cuits", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien cuire. Éviter les champignons sauvages."},
    "cheddar": {"name": "Cheddar", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte dure, sûr pendant la grossesse."},
    "chevre-frais": {"name": "Chèvre frais au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Risque de listériose si non pasteurisé."},
    "chevre-pasteurise": {"name": "Chèvre pasteurisé", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Sûr si pasteurisé."},
    "chocolat-noir": {"name": "Chocolat noir", "safe_for_pregnancy": "safe", "category": "Produits sucrés", "reason": "Avec modération. Contient de la caféine."},
    "chorizo": {"name": "Chorizo", "safe_for_pregnancy": "caution", "category": "Charcuterie", "reason": "Préférer bien cuit. Risque si cru."},
    "chou": {"name": "Chou cuit", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en vitamine C et acide folique."},
    "chou-fleur": {"name": "Chou-fleur", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver si consommé cru."},
    "citron": {"name": "Citron", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine C."},
    "clementine": {"name": "Clémentine", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine C."},
    "coca-cola": {"name": "Coca-Cola", "safe_for_pregnancy": "caution", "category": "Boissons", "reason": "Contient caféine et sucre. Limiter."},
    "cocktails": {"name": "Cocktails alcoolisés", "safe_for_pregnancy": "unsafe", "category": "Boissons", "reason": "INTERDIT. Contient de l'alcool."},
    "comte": {"name": "Comté", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte pressée cuite, sûr."},
    "concombre": {"name": "Concombre", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver et éplucher si possible."},
    "confiture": {"name": "Confiture", "safe_for_pregnancy": "safe", "category": "Produits sucrés", "reason": "Avec modération."},
    "coquillages-crus": {"name": "Coquillages crus", "safe_for_pregnancy": "unsafe", "category": "Fruits de mer", "reason": "INTERDIT. Risque d'intoxication alimentaire."},
    "coquillages-cuits": {"name": "Coquillages bien cuits", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuire jusqu'à ouverture des coquilles."},
    "cornichons": {"name": "Cornichons", "safe_for_pregnancy": "safe", "category": "Condiments", "reason": "Avec modération (sel)."},
    "courgette": {"name": "Courgette", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver ou cuire."},
    "crabe-cuit": {"name": "Crabe cuit", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuire, consommer frais."},
    "creme-fraiche-pasteurisee": {"name": "Crème fraîche pasteurisée", "safe_for_pregnancy": "safe", "category": "Produits laitiers", "reason": "Vérifier la pasteurisation."},
    "crevettes-cuites": {"name": "Crevettes cuites", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuites, consommer rapidement."},
    "croissant": {"name": "Croissant", "safe_for_pregnancy": "safe", "category": "Viennoiseries", "reason": "Avec modération."},
    
    # ===== D =====
    "datte": {"name": "Datte", "safe_for_pregnancy": "safe", "category": "Fruits secs", "reason": "Riche en fer et fibres. Avec modération (sucre)."},
    "dinde-cuite": {"name": "Dinde bien cuite", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Bien cuire à cœur."},
    "dorade-cuite": {"name": "Dorade cuite", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson recommandé, bien cuire."},
    
    # ===== E =====
    "eau": {"name": "Eau", "safe_for_pregnancy": "safe", "category": "Boissons", "reason": "Essentiel. 1,5 à 2L par jour recommandé."},
    "eau-gazeuse": {"name": "Eau gazeuse", "safe_for_pregnancy": "safe", "category": "Boissons", "reason": "Sans problème si pas trop salée."},
    "echalote": {"name": "Échalote", "safe_for_pregnancy": "safe", "category": "Condiments", "reason": "Bien cuire ou laver."},
    "emmental": {"name": "Emmental", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte dure, sûr."},
    "endive": {"name": "Endive", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver."},
    "epinards": {"name": "Épinards", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Excellente source d'acide folique. Bien laver."},
    "espadon": {"name": "Espadon", "safe_for_pregnancy": "avoid", "category": "Poissons", "reason": "Taux élevé de mercure. À éviter."},
    
    # ===== F =====
    "feta-pasteurisee": {"name": "Feta pasteurisée", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Sûre si pasteurisée."},
    "feta-lait-cru": {"name": "Feta au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Risque de listériose."},
    "figue": {"name": "Figue", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en fibres et calcium."},
    "flageolets": {"name": "Flageolets", "safe_for_pregnancy": "safe", "category": "Légumineuses", "reason": "Source de protéines végétales et fer."},
    "foie": {"name": "Foie", "safe_for_pregnancy": "avoid", "category": "Abats", "reason": "Trop riche en vitamine A (tératogène)."},
    "foie-gras": {"name": "Foie gras", "safe_for_pregnancy": "avoid", "category": "Charcuterie", "reason": "Risque de listériose et excès de vitamine A."},
    "fraise": {"name": "Fraise", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine C. Bien laver."},
    "framboise": {"name": "Framboise", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver soigneusement."},
    "fromage-blanc": {"name": "Fromage blanc", "safe_for_pregnancy": "safe", "category": "Produits laitiers", "reason": "Riche en calcium et protéines."},
    "fromage-rape-industriel": {"name": "Fromage râpé industriel", "safe_for_pregnancy": "caution", "category": "Fromages", "reason": "Vérifier la date. Consommer rapidement après ouverture."},
    "fruits-de-mer-crus": {"name": "Fruits de mer crus", "safe_for_pregnancy": "unsafe", "category": "Fruits de mer", "reason": "INTERDIT. Risque d'intoxication."},
    
    # ===== G =====
    "gingembre": {"name": "Gingembre", "safe_for_pregnancy": "safe", "category": "Épices", "reason": "Peut aider contre les nausées. Modération."},
    "gorgonzola": {"name": "Gorgonzola", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Fromage à pâte persillée, risque de listériose."},
    "gouda": {"name": "Gouda", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte dure, sûr."},
    "gruyere": {"name": "Gruyère", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte dure, sûr."},
    
    # ===== H =====
    "haricots-rouges": {"name": "Haricots rouges", "safe_for_pregnancy": "safe", "category": "Légumineuses", "reason": "Bien cuire. Source de fer et protéines."},
    "haricots-verts": {"name": "Haricots verts", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riches en fibres et vitamines."},
    "hareng-fume": {"name": "Hareng fumé", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Fumé à froid, préférer bien cuit."},
    "homard-cuit": {"name": "Homard cuit", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuire, consommer frais."},
    "huitres": {"name": "Huîtres crues", "safe_for_pregnancy": "unsafe", "category": "Fruits de mer", "reason": "INTERDIT crues. Risque d'intoxication."},
    "huile-olive": {"name": "Huile d'olive", "safe_for_pregnancy": "safe", "category": "Matières grasses", "reason": "Excellente source d'oméga-9."},
    
    # ===== I =====
    "infusion": {"name": "Infusion (tisane)", "safe_for_pregnancy": "caution", "category": "Boissons", "reason": "Éviter certaines plantes. Demander conseil."},
    
    # ===== J =====
    "jambon-blanc": {"name": "Jambon blanc", "safe_for_pregnancy": "safe", "category": "Charcuterie", "reason": "Cuit, généralement sûr."},
    "jambon-cru": {"name": "Jambon cru (serrano, parme)", "safe_for_pregnancy": "avoid", "category": "Charcuterie", "reason": "Risque de toxoplasmose si non immunisée."},
    "jus-orange-pasteurise": {"name": "Jus d'orange pasteurisé", "safe_for_pregnancy": "safe", "category": "Boissons", "reason": "Riche en vitamine C."},
    "jus-fruits-frais": {"name": "Jus de fruits frais", "safe_for_pregnancy": "caution", "category": "Boissons", "reason": "Préférer pasteurisé. Boire immédiatement si pressé."},
    
    # ===== K =====
    "kiwi": {"name": "Kiwi", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Très riche en vitamine C."},
    
    # ===== L =====
    "lait-cru": {"name": "Lait cru", "safe_for_pregnancy": "unsafe", "category": "Produits laitiers", "reason": "INTERDIT. Risque de listériose."},
    "lait-pasteurise": {"name": "Lait pasteurisé/UHT", "safe_for_pregnancy": "safe", "category": "Produits laitiers", "reason": "Source de calcium essentiel."},
    "laitue": {"name": "Laitue", "safe_for_pregnancy": "caution", "category": "Légumes", "reason": "Bien laver soigneusement."},
    "lapin-cuit": {"name": "Lapin bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Bien cuire à cœur."},
    "lardons": {"name": "Lardons", "safe_for_pregnancy": "caution", "category": "Charcuterie", "reason": "Bien cuire avant consommation."},
    "lentilles": {"name": "Lentilles", "safe_for_pregnancy": "safe", "category": "Légumineuses", "reason": "Excellente source de fer et acide folique."},
    "limande-cuite": {"name": "Limande cuite", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson maigre recommandé."},
    "litchi": {"name": "Litchi", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Avec modération."},
    
    # ===== M =====
    "mache": {"name": "Mâche", "safe_for_pregnancy": "caution", "category": "Légumes", "reason": "Bien laver très soigneusement."},
    "maïs": {"name": "Maïs", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Bien cuit, source de fibres."},
    "mandarine": {"name": "Mandarine", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamine C."},
    "mangue": {"name": "Mangue", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en vitamines A et C."},
    "maquereau": {"name": "Maquereau cuit", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Riche en oméga-3. Max 2 fois/semaine."},
    "marlin": {"name": "Marlin", "safe_for_pregnancy": "avoid", "category": "Poissons", "reason": "Taux élevé de mercure."},
    "mayonnaise-industrielle": {"name": "Mayonnaise industrielle", "safe_for_pregnancy": "safe", "category": "Sauces", "reason": "Faite avec œufs pasteurisés."},
    "mayonnaise-maison": {"name": "Mayonnaise maison", "safe_for_pregnancy": "unsafe", "category": "Sauces", "reason": "INTERDIT. Œufs crus, risque de salmonellose."},
    "melon": {"name": "Melon", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver l'extérieur avant de couper."},
    "menthe": {"name": "Menthe fraîche", "safe_for_pregnancy": "safe", "category": "Herbes", "reason": "Bien laver."},
    "merguez-cuite": {"name": "Merguez bien cuite", "safe_for_pregnancy": "safe", "category": "Charcuterie", "reason": "Bien cuire à cœur."},
    "merlan-cuit": {"name": "Merlan cuit", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson maigre recommandé."},
    "miel": {"name": "Miel", "safe_for_pregnancy": "safe", "category": "Produits sucrés", "reason": "Sûr pour la maman, pas pour bébé < 1 an."},
    "morbier": {"name": "Morbier", "safe_for_pregnancy": "caution", "category": "Fromages", "reason": "Vérifier si pasteurisé."},
    "mortadelle": {"name": "Mortadelle", "safe_for_pregnancy": "caution", "category": "Charcuterie", "reason": "Préférer bien cuite."},
    "moules-cuites": {"name": "Moules cuites", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuites, consommer frais."},
    "mousse-chocolat": {"name": "Mousse au chocolat maison", "safe_for_pregnancy": "unsafe", "category": "Desserts", "reason": "INTERDIT si œufs crus. Version industrielle OK."},
    "mozzarella-pasteurisee": {"name": "Mozzarella pasteurisée", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Sûre si pasteurisée."},
    "munster": {"name": "Munster", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Fromage à croûte lavée, risque de listériose."},
    "myrtille": {"name": "Myrtille", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Riche en antioxydants. Bien laver."},
    
    # ===== N =====
    "navet": {"name": "Navet", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien cuire ou laver."},
    "nectarine": {"name": "Nectarine", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver."},
    "noix": {"name": "Noix", "safe_for_pregnancy": "safe", "category": "Fruits à coque", "reason": "Source d'oméga-3 et vitamines."},
    "noix-de-coco": {"name": "Noix de coco", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Avec modération."},
    "nutella": {"name": "Nutella", "safe_for_pregnancy": "safe", "category": "Produits sucrés", "reason": "Avec modération (sucre et graisses)."},
    
    # ===== O =====
    "oeuf-dur": {"name": "Œuf dur", "safe_for_pregnancy": "safe", "category": "Œufs", "reason": "Bien cuit, excellent pour la grossesse."},
    "oeuf-mollet": {"name": "Œuf mollet", "safe_for_pregnancy": "avoid", "category": "Œufs", "reason": "Jaune pas assez cuit, risque de salmonellose."},
    "oeuf-cru": {"name": "Œuf cru", "safe_for_pregnancy": "unsafe", "category": "Œufs", "reason": "INTERDIT. Risque de salmonellose."},
    "oignon": {"name": "Oignon", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Cuit ou bien lavé si cru."},
    "olive": {"name": "Olive", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Source de bonnes graisses."},
    "orange": {"name": "Orange", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Excellente source de vitamine C."},
    
    # ===== P =====
    "pain": {"name": "Pain", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Préférer complet pour les fibres."},
    "pamplemousse": {"name": "Pamplemousse", "safe_for_pregnancy": "caution", "category": "Fruits", "reason": "Peut interagir avec certains médicaments."},
    "papaye": {"name": "Papaye mûre", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Mûre uniquement. Éviter verte."},
    "parmesan": {"name": "Parmesan", "safe_for_pregnancy": "safe", "category": "Fromages", "reason": "Fromage à pâte dure, sûr."},
    "pastèque": {"name": "Pastèque", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver l'extérieur avant de couper."},
    "pate-de-campagne": {"name": "Pâté de campagne", "safe_for_pregnancy": "avoid", "category": "Charcuterie", "reason": "Risque de listériose."},
    "pates": {"name": "Pâtes", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Source d'énergie. Préférer complètes."},
    "peche": {"name": "Pêche", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver ou peler."},
    "persil": {"name": "Persil", "safe_for_pregnancy": "safe", "category": "Herbes", "reason": "Riche en fer. Bien laver."},
    "petits-pois": {"name": "Petits pois", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Source de protéines végétales."},
    "poire": {"name": "Poire", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver ou peler."},
    "poireau": {"name": "Poireau", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en acide folique."},
    "pois-chiches": {"name": "Pois chiches", "safe_for_pregnancy": "safe", "category": "Légumineuses", "reason": "Excellente source de protéines et fer."},
    "poisson-cru": {"name": "Poisson cru (sushi)", "safe_for_pregnancy": "unsafe", "category": "Poissons", "reason": "INTERDIT. Risque de parasites et bactéries."},
    "poisson-fume": {"name": "Poisson fumé", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Préférer bien cuit. Risque de listériose."},
    "poivron": {"name": "Poivron", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en vitamine C. Bien laver."},
    "pomme": {"name": "Pomme", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver ou peler."},
    "pomme-de-terre": {"name": "Pomme de terre", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien cuire. Éviter si germée."},
    "porc-cuit": {"name": "Porc bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Cuisson à cœur obligatoire."},
    "poulet-cuit": {"name": "Poulet bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Cuisson à cœur obligatoire."},
    "poulpe-cuit": {"name": "Poulpe cuit", "safe_for_pregnancy": "safe", "category": "Fruits de mer", "reason": "Bien cuire."},
    "prune": {"name": "Prune", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Aide la digestion. Bien laver."},
    "pruneau": {"name": "Pruneau", "safe_for_pregnancy": "safe", "category": "Fruits secs", "reason": "Riche en fibres, aide contre la constipation."},
    
    # ===== Q =====
    "quiche": {"name": "Quiche", "safe_for_pregnancy": "safe", "category": "Plats préparés", "reason": "Bien cuite, généralement sûre."},
    "quinoa": {"name": "Quinoa", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Excellente source de protéines complètes."},
    
    # ===== R =====
    "radis": {"name": "Radis", "safe_for_pregnancy": "caution", "category": "Légumes", "reason": "Bien laver soigneusement."},
    "raisin": {"name": "Raisin", "safe_for_pregnancy": "safe", "category": "Fruits", "reason": "Bien laver."},
    "ravioli": {"name": "Ravioli", "safe_for_pregnancy": "safe", "category": "Pâtes", "reason": "Bien cuire. Vérifier la garniture."},
    "reblochon": {"name": "Reblochon", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Fromage à croûte lavée, risque de listériose."},
    "requin": {"name": "Requin", "safe_for_pregnancy": "avoid", "category": "Poissons", "reason": "Taux très élevé de mercure."},
    "rillettes": {"name": "Rillettes", "safe_for_pregnancy": "avoid", "category": "Charcuterie", "reason": "Risque de listériose."},
    "riz": {"name": "Riz", "safe_for_pregnancy": "safe", "category": "Céréales", "reason": "Source d'énergie. Préférer complet."},
    "roquefort": {"name": "Roquefort", "safe_for_pregnancy": "avoid", "category": "Fromages", "reason": "Fromage à pâte persillée, risque de listériose."},
    
    # ===== S =====
    "salade-composee": {"name": "Salade composée", "safe_for_pregnancy": "caution", "category": "Plats préparés", "reason": "Préférer fait maison, bien laver."},
    "saucisse-cuite": {"name": "Saucisse bien cuite", "safe_for_pregnancy": "safe", "category": "Charcuterie", "reason": "Bien cuire à cœur."},
    "saucisson": {"name": "Saucisson sec", "safe_for_pregnancy": "avoid", "category": "Charcuterie", "reason": "Viande crue séchée, risque de toxoplasmose."},
    "saumon-cuit": {"name": "Saumon cuit", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Riche en oméga-3. Bien cuire."},
    "saumon-fume": {"name": "Saumon fumé", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Risque de listériose. Préférer bien cuit."},
    "soja": {"name": "Soja", "safe_for_pregnancy": "caution", "category": "Légumineuses", "reason": "Avec modération (phytoestrogènes)."},
    "sole-cuite": {"name": "Sole cuite", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Poisson maigre recommandé."},
    "steak-tartare": {"name": "Steak tartare", "safe_for_pregnancy": "unsafe", "category": "Viandes", "reason": "INTERDIT. Viande crue."},
    "surimi": {"name": "Surimi", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Cuit, généralement sûr."},
    "sushi": {"name": "Sushi au poisson cru", "safe_for_pregnancy": "unsafe", "category": "Poissons", "reason": "INTERDIT. Poisson cru."},
    
    # ===== T =====
    "tarama": {"name": "Tarama", "safe_for_pregnancy": "avoid", "category": "Poissons", "reason": "Œufs de poisson crus, risque de listériose."},
    "tartare-saumon": {"name": "Tartare de saumon", "safe_for_pregnancy": "unsafe", "category": "Poissons", "reason": "INTERDIT. Poisson cru."},
    "the": {"name": "Thé", "safe_for_pregnancy": "caution", "category": "Boissons", "reason": "Contient caféine et tanins. Limiter."},
    "thon-boite": {"name": "Thon en boîte", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Max 150g/semaine (mercure)."},
    "thon-frais": {"name": "Thon frais", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Limiter (mercure). Bien cuire."},
    "tiramisu": {"name": "Tiramisu maison", "safe_for_pregnancy": "unsafe", "category": "Desserts", "reason": "Contient œufs crus et mascarpone."},
    "tofu": {"name": "Tofu", "safe_for_pregnancy": "safe", "category": "Légumineuses", "reason": "Source de protéines. Avec modération."},
    "tomate": {"name": "Tomate", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Riche en lycopène. Bien laver."},
    "truite-cuite": {"name": "Truite cuite", "safe_for_pregnancy": "safe", "category": "Poissons", "reason": "Bien cuire, recommandé."},
    "truite-fumee": {"name": "Truite fumée", "safe_for_pregnancy": "caution", "category": "Poissons", "reason": "Préférer bien cuite."},
    
    # ===== V =====
    "veau-cuit": {"name": "Veau bien cuit", "safe_for_pregnancy": "safe", "category": "Viandes", "reason": "Bien cuire à cœur."},
    "viande-crue": {"name": "Viande crue", "safe_for_pregnancy": "unsafe", "category": "Viandes", "reason": "INTERDIT. Risque de toxoplasmose."},
    "vin": {"name": "Vin", "safe_for_pregnancy": "unsafe", "category": "Boissons", "reason": "INTERDIT. Aucune quantité sûre."},
    "vinaigre": {"name": "Vinaigre", "safe_for_pregnancy": "safe", "category": "Condiments", "reason": "Sans danger."},
    
    # ===== Y =====
    "yaourt": {"name": "Yaourt", "safe_for_pregnancy": "safe", "category": "Produits laitiers", "reason": "Excellent source de calcium et probiotiques."},
    
    # ===== Z =====
    "courgette": {"name": "Courgette", "safe_for_pregnancy": "safe", "category": "Légumes", "reason": "Bien laver ou cuire."},
}

# Liste des catégories disponibles
FOOD_CATEGORIES = [
    "Fruits",
    "Légumes", 
    "Viandes",
    "Poissons",
    "Fruits de mer",
    "Produits laitiers",
    "Fromages",
    "Œufs",
    "Céréales",
    "Légumineuses",
    "Charcuterie",
    "Boissons",
    "Produits sucrés",
    "Desserts",
    "Condiments",
    "Herbes",
    "Épices",
    "Matières grasses",
    "Sauces",
    "Plats préparés",
    "Viennoiseries",
    "Fruits à coque",
    "Fruits secs",
    "Abats",
    "Pâtes",
    "Autre"
]
