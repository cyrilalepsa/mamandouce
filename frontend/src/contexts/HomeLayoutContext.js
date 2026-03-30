import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const HomeLayoutContext = createContext(null);

// Configuration par défaut de la page principale
const DEFAULT_LAYOUT = {
  pages: [
    {
      id: 'home',
      name: 'Accueil',
      isDefault: true,
      theme: 'default',
      items: [
        { id: 'week-display', type: 'widget', category: null, size: 'medium' },
        { id: 'name-of-day', type: 'widget', category: null, size: 'medium' },
        { id: 'preconception', type: 'section', expanded: false },
        { id: 'pregnancy', type: 'section', expanded: false },
        { id: 'baby-preparation', type: 'section', expanded: false },
        { id: 'postpartum', type: 'section', expanded: false },
        { id: 'services', type: 'section', expanded: false },
      ]
    }
  ],
  currentPageIndex: 0,
  defaultPageId: 'home', // Page affichée par défaut au login
  version: 3
};

// Tous les éléments disponibles
export const AVAILABLE_ITEMS = {
  widgets: [
    { id: 'week-display', name: 'Semaine de grossesse', icon: 'Baby', premium: false },
    { id: 'name-of-day', name: 'Prénom du jour', icon: 'Sparkles', premium: false },
    { id: 'fertility-summary', name: 'Résumé fertilité', icon: 'Heart', premium: true },
    { id: 'next-appointment', name: 'Prochain RDV', icon: 'Calendar', premium: true },
  ],
  sections: [
    { id: 'preconception', name: 'En route vers la grossesse', icon: 'Sparkles', premium: false },
    { id: 'pregnancy', name: 'Grossesse', icon: 'Baby', premium: false },
    { id: 'baby-preparation', name: 'Préparer l\'arrivée de bébé', icon: 'Gift', premium: false },
    { id: 'postpartum', name: 'Suivi post-partum', icon: 'Heart', premium: false },
    { id: 'services', name: 'Services et ressources', icon: 'Settings', premium: false },
  ],
  cards: [
    { id: 'cycle-tracking', name: 'Suivi de cycles', icon: 'CalendarDays', section: 'preconception', premium: false },
    { id: 'calculator', name: 'Calculateur', icon: 'Calculator', section: 'preconception', premium: false },
    { id: 'pregnancy-after-35', name: 'Grossesse après 35 ans', icon: 'Heart', section: 'preconception', premium: false },
    { id: 'scanner', name: 'Scanner aliments', icon: 'ScanBarcode', section: 'pregnancy', premium: false },
    { id: 'library', name: 'Bibliothèque', icon: 'Apple', section: 'pregnancy', premium: false },
    { id: 'favorites', name: 'Favoris', icon: 'Heart', section: 'pregnancy', premium: false },
    { id: 'history', name: 'Historique', icon: 'History', section: 'pregnancy', premium: false },
    { id: 'baby-names', name: 'Prénoms', icon: 'Users', section: 'pregnancy', premium: false },
    { id: 'tips', name: 'Évolution et conseils', icon: 'BookHeart', section: 'pregnancy', premium: false },
    { id: 'appointments', name: 'Rendez-vous', icon: 'Stethoscope', section: 'pregnancy', premium: false },
    { id: 'pregnancy-tracking', name: 'Suivi grossesse', icon: 'LineChart', section: 'pregnancy', premium: true },
    { id: 'reminders', name: 'Rappels', icon: 'Bell', section: 'pregnancy', premium: false },
    { id: 'maternity-bag', name: 'Valise maternité', icon: 'Briefcase', section: 'baby-preparation', premium: false },
    { id: 'birth-list', name: 'Liste de naissance', icon: 'Gift', section: 'baby-preparation', premium: false },
    { id: 'postpartum-guide', name: 'Guide post-partum', icon: 'Book', section: 'postpartum', premium: false },
    { id: 'recipes', name: 'Recettes', icon: 'UtensilsCrossed', section: 'postpartum', premium: false },
  ]
};

export function HomeLayoutProvider({ children }) {
  const { t } = useTranslation();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCustomLayout, setHasCustomLayout] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Charger le layout depuis la BDD
  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const response = await axios.get(`${API}/user/layout`, getAuthHeaders());
      if (response.data && response.data.layout) {
        setLayout(response.data.layout);
        setHasCustomLayout(true);
      } else {
        setLayout(DEFAULT_LAYOUT);
        // Vérifier si c'est la première fois - montrer le tutoriel
        const tutorialSeen = localStorage.getItem('mamandouce_layout_tutorial_seen');
        if (!tutorialSeen) {
          setShowTutorial(true);
        }
      }
    } catch (error) {
      console.error('Erreur chargement layout:', error);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder le layout dans la BDD
  const saveLayout = useCallback(async (newLayout) => {
    try {
      await axios.put(`${API}/user/layout`, { layout: newLayout }, getAuthHeaders());
      setLayout(newLayout);
      setHasCustomLayout(true);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde layout:', error);
      toast.error(t('common.error', 'Erreur lors de la sauvegarde'));
      return false;
    }
  }, [t]);

  // Réinitialiser au layout par défaut
  const resetToDefault = useCallback(async () => {
    try {
      await axios.delete(`${API}/user/layout`, getAuthHeaders());
      setLayout(DEFAULT_LAYOUT);
      setHasCustomLayout(false);
      toast.success(t('home.layoutReset', 'Disposition réinitialisée'));
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast.error(t('common.error', 'Erreur'));
    }
  }, [t]);

  // Ajouter une nouvelle page
  const addPage = useCallback(async (name = 'Nouvelle page') => {
    const newPage = {
      id: `page-${Date.now()}`,
      name,
      isDefault: false,
      items: []
    };
    
    const newLayout = {
      ...layout,
      pages: [...layout.pages, newPage],
      currentPageIndex: layout.pages.length
    };
    
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.pageAdded', 'Page ajoutée !'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Supprimer une page
  const deletePage = useCallback(async (pageId) => {
    if (layout.pages.length <= 1) {
      toast.error(t('home.cannotDeleteLastPage', 'Impossible de supprimer la dernière page'));
      return false;
    }
    
    const pageIndex = layout.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return false;
    
    // Ne pas supprimer la page par défaut
    if (layout.pages[pageIndex].isDefault) {
      toast.error(t('home.cannotDeleteDefaultPage', 'Impossible de supprimer la page d\'accueil'));
      return false;
    }
    
    const newPages = layout.pages.filter(p => p.id !== pageId);
    const newCurrentIndex = Math.min(layout.currentPageIndex, newPages.length - 1);
    
    const newLayout = {
      ...layout,
      pages: newPages,
      currentPageIndex: newCurrentIndex
    };
    
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.pageDeleted', 'Page supprimée'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Renommer une page
  const renamePage = useCallback(async (pageId, newName) => {
    const newPages = layout.pages.map(p => 
      p.id === pageId ? { ...p, name: newName } : p
    );
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Déplacer un élément
  const moveItem = useCallback(async (itemId, fromPageId, toPageId, toIndex) => {
    const fromPage = layout.pages.find(p => p.id === fromPageId);
    const toPage = layout.pages.find(p => p.id === toPageId);
    
    if (!fromPage || !toPage) return false;
    
    const item = fromPage.items.find(i => i.id === itemId);
    if (!item) return false;
    
    let newPages;
    
    if (fromPageId === toPageId) {
      // Déplacement dans la même page
      const newItems = [...fromPage.items];
      const oldIndex = newItems.findIndex(i => i.id === itemId);
      newItems.splice(oldIndex, 1);
      newItems.splice(toIndex, 0, item);
      
      newPages = layout.pages.map(p => 
        p.id === fromPageId ? { ...p, items: newItems } : p
      );
    } else {
      // Déplacement vers une autre page
      const fromItems = fromPage.items.filter(i => i.id !== itemId);
      const toItems = [...toPage.items];
      toItems.splice(toIndex, 0, item);
      
      newPages = layout.pages.map(p => {
        if (p.id === fromPageId) return { ...p, items: fromItems };
        if (p.id === toPageId) return { ...p, items: toItems };
        return p;
      });
    }
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Supprimer un élément d'une page
  const removeItemFromPage = useCallback(async (itemId, pageId) => {
    const page = layout.pages.find(p => p.id === pageId);
    if (!page || page.isDefault) return false; // Ne pas supprimer de la page principale
    
    const newItems = page.items.filter(i => i.id !== itemId);
    
    const newPages = layout.pages.map(p => 
      p.id === pageId ? { ...p, items: newItems } : p
    );
    
    const newLayout = { ...layout, pages: newPages };
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.itemRemoved', 'Élément supprimé'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Changer de page
  const setCurrentPage = useCallback((index) => {
    setLayout(prev => ({ ...prev, currentPageIndex: index }));
  }, []);

  // Fermer le tutoriel
  const dismissTutorial = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem('mamandouce_layout_tutorial_seen', 'true');
  }, []);

  // Changer le thème d'une page (Premium)
  const setPageTheme = useCallback(async (pageId, themeId) => {
    const newPages = layout.pages.map(p => 
      p.id === pageId ? { ...p, theme: themeId } : p
    );
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Redimensionner un widget (Premium)
  const resizeWidget = useCallback(async (pageId, itemId, newSize) => {
    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      
      const newItems = p.items.map(item => 
        item.id === itemId ? { ...item, size: newSize } : item
      );
      
      return { ...p, items: newItems };
    });
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Ajouter un groupe à une page
  const addGroup = useCallback(async (pageId, name = 'Nouveau groupe') => {
    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      items: []
    };
    
    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        groups: [...(p.groups || []), newGroup]
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.groupAdded', 'Groupe ajouté !'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Renommer un groupe
  const renameGroup = useCallback(async (pageId, groupId, newName) => {
    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        groups: (p.groups || []).map(g => 
          g.id === groupId ? { ...g, name: newName } : g
        )
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Supprimer un groupe
  const deleteGroup = useCallback(async (pageId, groupId) => {
    const page = layout.pages.find(p => p.id === pageId);
    const group = page?.groups?.find(g => g.id === groupId);
    
    // Remettre les items du groupe dans la page principale
    const groupItems = group?.items || [];
    
    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        items: [...p.items, ...groupItems],
        groups: (p.groups || []).filter(g => g.id !== groupId)
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.groupDeleted', 'Groupe supprimé'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Créer un groupe en fusionnant deux items (drag & drop)
  const createGroupFromItems = useCallback(async (pageId, item1Id, item2Id, groupName = 'Nouveau groupe') => {
    const page = layout.pages.find(p => p.id === pageId);
    if (!page || page.isDefault) return false;

    const item1 = page.items?.find(i => i.id === item1Id);
    const item2 = page.items?.find(i => i.id === item2Id);
    
    if (!item1 || !item2) return false;

    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      items: [item1, item2]
    };
    
    // Retirer les items de la liste principale et ajouter le groupe
    const newItems = page.items.filter(i => i.id !== item1Id && i.id !== item2Id);
    
    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        items: newItems,
        groups: [...(p.groups || []), newGroup]
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.groupCreated', 'Groupe créé !'));
    }
    return success;
  }, [layout, saveLayout, t]);

  // Ajouter un item à un groupe existant
  const addItemToGroup = useCallback(async (pageId, groupId, itemId) => {
    const page = layout.pages.find(p => p.id === pageId);
    if (!page || page.isDefault) return false;

    const item = page.items?.find(i => i.id === itemId);
    if (!item) return false;

    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        items: p.items.filter(i => i.id !== itemId),
        groups: (p.groups || []).map(g => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            items: [...g.items, item]
          };
        })
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Retirer un item d'un groupe
  const removeItemFromGroup = useCallback(async (pageId, groupId, itemId) => {
    const page = layout.pages.find(p => p.id === pageId);
    if (!page) return false;

    const group = page.groups?.find(g => g.id === groupId);
    if (!group) return false;

    const item = group.items.find(i => i.id === itemId);
    if (!item) return false;

    const newPages = layout.pages.map(p => {
      if (p.id !== pageId) return p;
      
      const updatedGroups = (p.groups || []).map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.filter(i => i.id !== itemId)
        };
      }).filter(g => g.items.length > 0); // Supprimer les groupes vides
      
      return {
        ...p,
        items: [...p.items, item],
        groups: updatedGroups
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout]);

  // Dupliquer un item vers une page utilisateur
  const duplicateItemToPage = useCallback(async (itemId, targetPageId) => {
    const targetPage = layout.pages.find(p => p.id === targetPageId);
    if (!targetPage) return false;
    
    // Vérifier si l'item existe déjà sur la page cible
    const alreadyExists = targetPage.items?.some(i => i.id === itemId);
    if (alreadyExists) {
      toast.info(t('home.alreadyOnPage', 'Cette section est déjà sur cette page'));
      return false;
    }
    
    // Ajouter l'item à la page cible
    const newItem = { id: itemId, type: 'section' };
    
    const newPages = layout.pages.map(p => {
      if (p.id !== targetPageId) return p;
      return {
        ...p,
        items: [...(p.items || []), newItem]
      };
    });
    
    const newLayout = { ...layout, pages: newPages };
    return await saveLayout(newLayout);
  }, [layout, saveLayout, t]);

  // Définir une page comme page d'accueil par défaut
  const setDefaultPage = useCallback(async (pageId) => {
    const newLayout = { ...layout, defaultPageId: pageId };
    const success = await saveLayout(newLayout);
    if (success) {
      toast.success(t('home.defaultPageSet', 'Page d\'accueil définie !'));
    }
    return success;
  }, [layout, saveLayout, t]);

  const value = {
    layout,
    isEditMode,
    setIsEditMode,
    isLoading,
    hasCustomLayout,
    showTutorial,
    dismissTutorial,
    currentPage: layout.pages[layout.currentPageIndex],
    pages: layout.pages,
    currentPageIndex: layout.currentPageIndex,
    defaultPageId: layout.defaultPageId || 'home',
    setCurrentPage,
    addPage,
    deletePage,
    renamePage,
    moveItem,
    removeItemFromPage,
    resetToDefault,
    saveLayout,
    setPageTheme,
    resizeWidget,
    addGroup,
    renameGroup,
    deleteGroup,
    createGroupFromItems,
    addItemToGroup,
    removeItemFromGroup,
    duplicateItemToPage,
    setDefaultPage,
    AVAILABLE_ITEMS
  };

  return (
    <HomeLayoutContext.Provider value={value}>
      {children}
    </HomeLayoutContext.Provider>
  );
}

export function useHomeLayout() {
  const context = useContext(HomeLayoutContext);
  if (!context) {
    throw new Error('useHomeLayout must be used within a HomeLayoutProvider');
  }
  return context;
}

export default HomeLayoutContext;
