# Base de données complète des aliments pour femmes enceintes
# Basé sur les recommandations de la CDC, FDA et autorités sanitaires françaises

FOOD_SAFETY_DATABASE = {
    # Produits laitiers - SAFE
    "3228020000000": {"barcode": "3228020000000", "name": "Lait pasteurisé", "safe_for_pregnancy": "safe", "category": "Laitages"},
    "3250391600007": {"barcode": "3250391600007", "name": "Emmental", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
    "lait-pasteurise": {"barcode": "lait-pasteurise", "name": "Lait pasteurisé", "safe_for_pregnancy": "safe", "category": "Laitages"},
    "yaourt": {"barcode": "yaourt", "name": "Yaourt nature", "safe_for_pregnancy": "safe", "category": "Laitages"},
    "comte": {"barcode": "comte", "name": "Comté", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
    "gruyere": {"barcode": "gruyere", "name": "Gruyère", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
    "parmesan": {"barcode": "parmesan", "name": "Parmesan", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
    "cheddar": {"barcode": "cheddar", "name": "Cheddar", "safe_for_pregnancy": "safe", "category": "Fromage à pâte dure"},
    "mozzarella-pasteurisee": {"barcode": "mozzarella-pasteurisee", "name": "Mozzarella pasteurisée", "safe_for_pregnancy": "safe", "category": "Fromage"},
    
    # Produits laitiers - AVOID
    "camembert": {"barcode": "camembert", "name": "Camembert au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromage à pâte molle"},
    "brie": {"barcode": "brie", "name": "Brie au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromage à pâte molle"},
    "roquefort": {"barcode": "roquefort", "name": "Roquefort", "safe_for_pregnancy": "avoid", "category": "Fromage à pâte persillée"},
    "chevre-frais": {"barcode": "chevre-frais", "name": "Fromage de chèvre frais", "safe_for_pregnancy": "avoid", "category": "Fromage frais"},
    "feta-lait-cru": {"barcode": "feta-lait-cru", "name": "Feta au lait cru", "safe_for_pregnancy": "avoid", "category": "Fromage"},
    
    # Viandes - SAFE (bien cuites)
    "poulet-cuit": {"barcode": "poulet-cuit", "name": "Poulet bien cuit", "safe_for_pregnancy": "safe", "category": "Viande"},
    "boeuf-cuit": {"barcode": "boeuf-cuit", "name": "Bœuf bien cuit", "safe_for_pregnancy": "safe", "category": "Viande"},
    "jambon-cuit": {"barcode": "jambon-cuit", "name": "Jambon cuit", "safe_for_pregnancy": "safe", "category": "Charcuterie"},
    "dinde-cuite": {"barcode": "dinde-cuite", "name": "Dinde bien cuite", "safe_for_pregnancy": "safe", "category": "Viande"},
    
    # Viandes - CAUTION
    "jambon-cru": {"barcode": "jambon-cru", "name": "Jambon cru", "safe_for_pregnancy": "caution", "category": "Charcuterie"},
    "saucisson": {"barcode": "saucisson", "name": "Saucisson sec", "safe_for_pregnancy": "caution", "category": "Charcuterie"},
    "chorizo": {"barcode": "chorizo", "name": "Chorizo", "safe_for_pregnancy": "caution", "category": "Charcuterie"},
    
    # Viandes - UNSAFE
    "steak-tartare": {"barcode": "steak-tartare", "name": "Steak tartare", "safe_for_pregnancy": "unsafe", "category": "Viande crue"},
    "carpaccio": {"barcode": "carpaccio", "name": "Carpaccio", "safe_for_pregnancy": "unsafe", "category": "Viande crue"},
    
    # Poissons - SAFE
    "saumon-cuit": {"barcode": "saumon-cuit", "name": "Saumon cuit", "safe_for_pregnancy": "safe", "category": "Poisson"},
    "thon-en-boite": {"barcode": "thon-en-boite", "name": "Thon en boîte", "safe_for_pregnancy": "safe", "category": "Poisson"},
    "cabillaud": {"barcode": "cabillaud", "name": "Cabillaud", "safe_for_pregnancy": "safe", "category": "Poisson"},
    "sole": {"barcode": "sole", "name": "Sole", "safe_for_pregnancy": "safe", "category": "Poisson"},
    "crevettes-cuites": {"barcode": "crevettes-cuites", "name": "Crevettes cuites", "safe_for_pregnancy": "safe", "category": "Fruits de mer"},
    
    # Poissons - CAUTION
    "saumon-fume": {"barcode": "saumon-fume", "name": "Saumon fumé", "safe_for_pregnancy": "caution", "category": "Poisson fumé"},
    "truite-fumee": {"barcode": "truite-fumee", "name": "Truite fumée", "safe_for_pregnancy": "caution", "category": "Poisson fumé"},
    "thon-frais": {"barcode": "thon-frais", "name": "Thon frais (limiter)", "safe_for_pregnancy": "caution", "category": "Poisson"},
    
    # Poissons - UNSAFE
    "raw-fish": {"barcode": "raw-fish", "name": "Poisson cru (sushi)", "safe_for_pregnancy": "unsafe", "category": "Poisson cru"},
    "sushi": {"barcode": "sushi", "name": "Sushi", "safe_for_pregnancy": "unsafe", "category": "Poisson cru"},
    "sashimi": {"barcode": "sashimi", "name": "Sashimi", "safe_for_pregnancy": "unsafe", "category": "Poisson cru"},
    "espadon": {"barcode": "espadon", "name": "Espadon", "safe_for_pregnancy": "unsafe", "category": "Poisson à mercure élevé"},
    "requin": {"barcode": "requin", "name": "Requin", "safe_for_pregnancy": "unsafe", "category": "Poisson à mercure élevé"},
    "huitres-crues": {"barcode": "huitres-crues", "name": "Huîtres crues", "safe_for_pregnancy": "unsafe", "category": "Fruits de mer crus"},
    
    # Œufs - SAFE
    "oeufs-durs": {"barcode": "oeufs-durs", "name": "Œufs durs", "safe_for_pregnancy": "safe", "category": "Œufs"},
    "oeufs-brouilles": {"barcode": "oeufs-brouilles", "name": "Œufs brouillés bien cuits", "safe_for_pregnancy": "safe", "category": "Œufs"},
    
    # Œufs - UNSAFE
    "oeufs-mollets": {"barcode": "oeufs-mollets", "name": "Œufs mollets", "safe_for_pregnancy": "unsafe", "category": "Œufs peu cuits"},
    "mayonnaise-maison": {"barcode": "mayonnaise-maison", "name": "Mayonnaise maison", "safe_for_pregnancy": "unsafe", "category": "Œufs crus"},
    "mousse-chocolat-maison": {"barcode": "mousse-chocolat-maison", "name": "Mousse au chocolat maison", "safe_for_pregnancy": "unsafe", "category": "Œufs crus"},
    
    # Fruits et légumes - SAFE (bien lavés)
    "pommes": {"barcode": "pommes", "name": "Pommes (bien lavées)", "safe_for_pregnancy": "safe", "category": "Fruits"},
    "bananes": {"barcode": "bananes", "name": "Bananes", "safe_for_pregnancy": "safe", "category": "Fruits"},
    "oranges": {"barcode": "oranges", "name": "Oranges", "safe_for_pregnancy": "safe", "category": "Fruits"},
    "carottes-cuites": {"barcode": "carottes-cuites", "name": "Carottes cuites", "safe_for_pregnancy": "safe", "category": "Légumes"},
    "haricots-verts": {"barcode": "haricots-verts", "name": "Haricots verts cuits", "safe_for_pregnancy": "safe", "category": "Légumes"},
    "brocoli": {"barcode": "brocoli", "name": "Brocoli cuit", "safe_for_pregnancy": "safe", "category": "Légumes"},
    "epinards-cuits": {"barcode": "epinards-cuits", "name": "Épinards cuits", "safe_for_pregnancy": "safe", "category": "Légumes"},
    
    # Fruits et légumes - CAUTION
    "salade-verte": {"barcode": "salade-verte", "name": "Salade verte crue", "safe_for_pregnancy": "caution", "category": "Légumes crus"},
    "tomates-crues": {"barcode": "tomates-crues", "name": "Tomates crues", "safe_for_pregnancy": "caution", "category": "Légumes crus"},
    "pousses-crues": {"barcode": "pousses-crues", "name": "Pousses crues (germes)", "safe_for_pregnancy": "caution", "category": "Légumes crus"},
    
    # Produits sucrés - SAFE
    "3017620422003": {"barcode": "3017620422003", "name": "Nutella", "safe_for_pregnancy": "safe", "category": "Pâte à tartiner"},
    "miel": {"barcode": "miel", "name": "Miel", "safe_for_pregnancy": "safe", "category": "Sucré"},
    "confiture": {"barcode": "confiture", "name": "Confiture", "safe_for_pregnancy": "safe", "category": "Sucré"},
    "chocolat-noir": {"barcode": "chocolat-noir", "name": "Chocolat noir", "safe_for_pregnancy": "safe", "category": "Sucré"},
    
    # Boissons - SAFE
    "eau": {"barcode": "eau", "name": "Eau", "safe_for_pregnancy": "safe", "category": "Boissons"},
    "jus-de-fruits-pasteurise": {"barcode": "jus-de-fruits-pasteurise", "name": "Jus de fruits pasteurisé", "safe_for_pregnancy": "safe", "category": "Boissons"},
    "lait-pasteurise-boisson": {"barcode": "lait-pasteurise-boisson", "name": "Lait pasteurisé", "safe_for_pregnancy": "safe", "category": "Boissons"},
    "tisane-sans-cafeine": {"barcode": "tisane-sans-cafeine", "name": "Tisane sans caféine", "safe_for_pregnancy": "safe", "category": "Boissons"},
    
    # Boissons - CAUTION
    "cafe": {"barcode": "cafe", "name": "Café (max 200mg/jour)", "safe_for_pregnancy": "caution", "category": "Boissons caféinées"},
    "the": {"barcode": "the", "name": "Thé (limiter)", "safe_for_pregnancy": "caution", "category": "Boissons caféinées"},
    "jus-de-fruits-frais": {"barcode": "jus-de-fruits-frais", "name": "Jus de fruits frais non pasteurisé", "safe_for_pregnancy": "caution", "category": "Boissons"},
    
    # Boissons - UNSAFE
    "alcool": {"barcode": "alcool", "name": "Alcool", "safe_for_pregnancy": "unsafe", "category": "Boissons alcoolisées"},
    "vin": {"barcode": "vin", "name": "Vin", "safe_for_pregnancy": "unsafe", "category": "Boissons alcoolisées"},
    "biere": {"barcode": "biere", "name": "Bière", "safe_for_pregnancy": "unsafe", "category": "Boissons alcoolisées"},
    "cocktails": {"barcode": "cocktails", "name": "Cocktails", "safe_for_pregnancy": "unsafe", "category": "Boissons alcoolisées"},
    "boissons-energisantes": {"barcode": "boissons-energisantes", "name": "Boissons énergisantes", "safe_for_pregnancy": "unsafe", "category": "Boissons"},
    
    # Plats préparés - CAUTION
    "sandwichs-prepares": {"barcode": "sandwichs-prepares", "name": "Sandwichs préparés", "safe_for_pregnancy": "caution", "category": "Plats préparés"},
    "salades-preparees": {"barcode": "salades-preparees", "name": "Salades préparées", "safe_for_pregnancy": "caution", "category": "Plats préparés"},
    "sushis-prepares": {"barcode": "sushis-prepares", "name": "Sushis préparés", "safe_for_pregnancy": "unsafe", "category": "Plats préparés"},
    
    # Autres
    "pate": {"barcode": "pate", "name": "Pâté", "safe_for_pregnancy": "avoid", "category": "Charcuterie"},
    "foie-gras": {"barcode": "foie-gras", "name": "Foie gras", "safe_for_pregnancy": "avoid", "category": "Charcuterie"},
    "rillettes": {"barcode": "rillettes", "name": "Rillettes", "safe_for_pregnancy": "avoid", "category": "Charcuterie"},
}
