import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Plus } from 'lucide-react';
import { useHomeLayout } from '../../contexts/HomeLayoutContext';

// Popup de sélection de page pour la duplication - Style compact avec effet bombé
export function PageSelectionPopup({ isVisible, onClose, onSelectPage, itemName }) {
  const { t } = useTranslation();
  const { pages, getUserPages, addPage } = useHomeLayout();
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  if (!isVisible) return null;
  
  const userPages = getUserPages();
  
  const handleCreateAndSelect = async () => {
    const userPagesCount = userPages.length;
    const defaultName = `Page ${userPagesCount + 1}`;
    const success = await addPage(defaultName);
    if (success) {
      const newPage = { id: `page-${Date.now()}`, name: defaultName };
      onSelectPage(newPage.id);
      setIsCreatingPage(false);
      setNewPageName('');
      onClose();
    }
  };
  
  const handleSelectPage = (pageId) => {
    onSelectPage(pageId);
    onClose();
  };

  // Style bombé 3D pour les boutons
  const glossyButtonStyle = {
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center pb-24 px-4"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      {/* Modal compact en bas - Style nuage pastel */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-[300px] w-full select-none animate-in slide-in-from-bottom-4 duration-300"
      >
        <div 
          className="relative rounded-[28px] p-5 shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(253,242,248,0.95) 50%, rgba(252,231,243,0.9) 100%)',
            border: '1px solid rgba(244, 114, 182, 0.2)'
          }}
        >
          {/* Header avec icône */}
          <div className="text-center mb-4">
            <div 
              className="w-12 h-12 mx-auto mb-2 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35), inset 0 -3px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Copy className="w-5 h-5 text-white relative z-10" />
              {/* Reflet glossy */}
              <div 
                className="absolute top-0.5 left-1 right-1 h-[45%] rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)' }}
              />
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              {t('duplicate.title', 'Dupliquer vers...')}
            </h3>
            {itemName && (
              <p className="text-xs text-slate-400 mt-0.5">{itemName}</p>
            )}
          </div>
          
          {/* Liste des pages avec effet bombé */}
          <div className="space-y-2 mb-3">
            {userPages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.9) 100%)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08), inset 0 -2px 5px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(203, 213, 225, 0.4)'
                }}
              >
                {/* Bulle colorée */}
                <div 
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: page.color || ['#c7d2fe', '#fecdd3', '#bbf7d0', '#fde68a', '#ddd6fe'][index % 5],
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <span className="font-medium text-slate-600 text-sm">
                  Page {index + 1}
                </span>
                {/* Reflet */}
                <div 
                  className="absolute top-0 left-2 right-2 h-[40%] rounded-full pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 100%)' }}
                />
              </button>
            ))}
            
            {userPages.length === 0 && (
              <p className="text-center text-slate-400 text-xs py-2">
                {t('duplicate.noPages', 'Aucune page personnalisée')}
              </p>
            )}
          </div>
          
          {/* Bouton créer nouvelle page - Effet bombé 3D glossy rose */}
          <button
            onClick={handleCreateAndSelect}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)',
              boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3), inset 0 -3px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(244, 114, 182, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 text-pink-600 relative z-10" />
            <span className="font-semibold text-pink-700 text-sm relative z-10">
              {t('duplicate.createNew', 'Créer une nouvelle page')}
            </span>
            {/* Reflet glossy */}
            <div 
              className="absolute top-0 left-2 right-2 h-[45%] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 100%)' }}
            />
          </button>
          
          {/* Bouton Annuler - Effet bombé 3D glossy gris */}
          <button
            onClick={onClose}
            className="w-full mt-2 p-3 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.06), inset 0 -2px 5px rgba(0,0,0,0.04)',
              border: '1px solid rgba(203, 213, 225, 0.5)'
            }}
          >
            <span className="font-medium text-slate-500 text-sm relative z-10">
              {t('common.cancel', 'Annuler')}
            </span>
            {/* Reflet glossy */}
            <div 
              className="absolute top-0 left-2 right-2 h-[45%] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 100%)' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageSelectionPopup;
