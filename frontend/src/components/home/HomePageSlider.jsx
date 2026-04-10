/**
 * HomePageSlider.jsx
 * Composant slider horizontal pour la navigation entre pages
 * Extrait de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import NameOfTheDay from '../NameOfTheDay';
import { DraggableItem, ItemGroup } from './DragDropComponents';
import { WeekDisplayWidget, JourneyStepsCard } from './HomeWidgets';
import PageSelectionPopup from './PageSelectionPopup';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';

/**
 * Slider horizontal avec page principale et pages utilisateur
 */
export function HomePageSlider({
  // États de swipe
  isSwiping,
  swipeOffset,
  isDefaultPage,
  // Données
  currentPage,
  userPage,
  hasPregnancyProfile,
  pregnancyProfile,
  // Handlers pour les items
  selectedForGroup,
  setSelectedForGroup,
  handleOpenGroup,
  handleRenameGroup,
  handleDeleteGroup,
  handleDropOnItem,
  addItemToGroup,
  removeItemFromPage,
  isPremium = false
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { duplicateItemToPage } = useHomeLayout();
  
  // État pour la popup de duplication/suppression
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('duplicate'); // 'duplicate' ou 'delete'
  const [selectedItem, setSelectedItem] = useState(null);

  // La page utilisateur à afficher dans le slider (uniquement quand on swipe vers elle)
  const displayUserPage = isDefaultPage ? userPage : currentPage;
  const shouldShowUserPageContent = displayUserPage && !displayUserPage.isDefault;
  
  // Déterminer si on est sur une page utilisateur (pas la page par défaut)
  const isUserPage = !isDefaultPage && currentPage && !currentPage.isDefault;
  
  // Gérer l'appui long sur un élément
  const handleItemLongPress = (item, isOnUserPage) => {
    setSelectedItem(item);
    if (isOnUserPage) {
      // Sur page utilisateur: suppression seulement
      setPopupMode('delete');
    } else {
      // Sur page par défaut: duplication
      setPopupMode('duplicate');
    }
    setShowPopup(true);
  };
  
  // Masquer la popup
  const handleHidePopup = () => {
    setShowPopup(false);
    setSelectedItem(null);
  };
  
  // Gérer la sélection d'une page pour duplication
  const handleSelectPageForDuplication = async (pageId) => {
    if (selectedItem && duplicateItemToPage) {
      await duplicateItemToPage(selectedItem.id, pageId);
    }
    handleHidePopup();
  };
  
  // Gérer la suppression d'un élément
  const handleDeleteItem = () => {
    if (selectedItem && removeItemFromPage && displayUserPage) {
      removeItemFromPage(selectedItem.id, displayUserPage.id);
    }
    handleHidePopup();
  };

  return (
    <div 
      className="relative no-layout-shift flex-1 overflow-hidden"
      style={{ minHeight: '500px' }}
    >
      {/* Slider des pages */}
      <div 
        className={`flex ${isSwiping ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ 
          transform: `translateX(calc(${isDefaultPage ? '0%' : '-50%'} + ${swipeOffset}px))`,
          width: '200%',
          willChange: isSwiping ? 'transform' : 'auto'
        }}
      >
        {/* === PAGE PRINCIPALE (50% du slider) === */}
        <div 
          className="w-1/2 flex-shrink-0 px-0.5 no-layout-shift overflow-hidden"
          style={{ minHeight: '480px' }}
        >
          {/* Semaine X et Fête du jour - layout adaptatif */}
          {hasPregnancyProfile ? (
            <div className="grid grid-cols-2 gap-3 card-stable card-fade-in pb-4" style={{ minHeight: '96px' }}>
              <WeekDisplayWidget pregnancyProfile={pregnancyProfile} t={t} compact navigate={navigate} />
              <NameOfTheDay isDarkMode={isDarkMode} compact={true} />
            </div>
          ) : (
            <div className="w-full px-2 card-stable card-fade-in" style={{ minHeight: '60px' }}>
              <NameOfTheDay isDarkMode={isDarkMode} compact={false} fullWidth={true} />
            </div>
          )}
          
          {/* Les étapes - juste en dessous des cartes */}
          <div className="mt-14 card-stable card-fade-in" style={{ animationDelay: '0.1s' }}>
            <JourneyStepsCard t={t} navigate={navigate} />
          </div>
        </div>

        {/* === PAGES UTILISATEUR (50% du slider) - Fenêtre de swiping === */}
        <div 
          className="w-1/2 flex-shrink-0 px-2 relative overflow-hidden"
          style={{ minHeight: '480px' }}
        >
          {/* Contenu de la page utilisateur - UNIQUEMENT si c'est une vraie page utilisateur (pas la page home) */}
          {shouldShowUserPageContent && (!isDefaultPage || isSwiping || Math.abs(swipeOffset) > 10) && (
            <div className="flex flex-col h-full">
              
              {/* Groupes existants */}
              {displayUserPage?.groups?.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {displayUserPage.groups.map((group) => (
                    <ItemGroup
                      key={group.id}
                      group={group}
                      onOpen={handleOpenGroup}
                      onRename={handleRenameGroup}
                      onDelete={handleDeleteGroup}
                      hasSelectedItem={!!selectedForGroup}
                      onAddSelectedItem={(targetGroup) => {
                        // Ajouter l'item sélectionné au groupe
                        if (selectedForGroup && addItemToGroup && displayUserPage) {
                          addItemToGroup(displayUserPage.id, targetGroup.id, selectedForGroup.id);
                          setSelectedForGroup(null);
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Items individuels */}
              {displayUserPage?.items?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {displayUserPage.items.map((item, index) => (
                    <DraggableItem
                      key={`item-${item.id}-${index}`}
                      item={item}
                      index={index}
                      totalItems={displayUserPage.items.length}
                      onRemove={(itemId) => removeItemFromPage(itemId, displayUserPage.id)}
                      isUserPage={true}
                      canDrag={true}
                      onLongPress={(item) => handleItemLongPress(item, true)}
                      onHidePopup={handleHidePopup}
                      onDropOnItem={handleDropOnItem}
                      onAddToGroup={(itemId, groupId) => {
                        // Wrapper pour passer le pageId correct
                        if (addItemToGroup && displayUserPage) {
                          addItemToGroup(displayUserPage.id, groupId, itemId);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Popup de duplication OU suppression selon le mode */}
      {popupMode === 'duplicate' ? (
        <PageSelectionPopup
          isVisible={showPopup}
          onClose={handleHidePopup}
          onSelectPage={handleSelectPageForDuplication}
          itemName={selectedItem ? (selectedItem.name || selectedItem.id) : null}
        />
      ) : (
        /* Popup de suppression - version compacte avec boutons bombés */
        showPopup && selectedItem && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={handleHidePopup}
          >
            <div 
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 w-auto max-w-[280px] shadow-xl border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-slate-700 text-sm font-medium text-center mb-3">
                Supprimer cet élément ?
              </p>
              <div className="flex gap-2">
                {/* Bouton Annuler - Effet bombé gris/blanc */}
                <button
                  onClick={handleHidePopup}
                  className="flex-1 py-2.5 px-3 rounded-2xl text-slate-600 text-sm font-semibold transition-all active:scale-95 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                    boxShadow: '0 4px 15px rgba(148, 163, 184, 0.3), inset 0 -3px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(203, 213, 225, 0.5)'
                  }}
                >
                  <span className="relative z-10">Annuler</span>
                  {/* Reflet glossy */}
                  <div 
                    className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)' }}
                  />
                </button>
                {/* Bouton Supprimer - Effet bombé rouge/rose */}
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 py-2.5 px-3 rounded-2xl text-white text-sm font-semibold transition-all active:scale-95 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 -3px 8px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <span className="relative z-10">Supprimer</span>
                  {/* Reflet glossy */}
                  <div 
                    className="absolute top-0 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)' }}
                  />
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default HomePageSlider;
