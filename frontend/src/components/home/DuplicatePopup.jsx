import { Plus } from 'lucide-react';

/**
 * Popup de duplication avec fond gris transparent
 * Utilisé dans PostpartumPage, JourneyStepsPage, SectionDetailPage, etc.
 */
export function DuplicatePopup({
  isVisible,
  onClose,
  onSelectPage,
  onCreateNewPage,
  pages,
  itemName,
  t
}) {
  if (!isVisible) return null;
  
  const userPages = pages.filter(p => !p.isDefault);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center px-4 select-none"
      onClick={onClose}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none' 
      }}
    >
      {/* Fond gris transparent avec blur */}
      <div 
        className="relative rounded-[28px] p-5 mx-4 max-w-[300px] w-full select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(60, 60, 67, 0.45)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="w-11 h-11 mx-auto mb-2 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #f9a8d4 0%, #f472b6 50%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.35), inset 0 -3px 8px rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-white text-lg relative z-10">📋</span>
            <div 
              className="absolute top-0.5 left-1 right-1 h-[45%] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)' }}
            />
          </div>
          <h3 className="text-base font-bold text-white">
            {t('journey.duplicateTo', 'Dupliquer vers...')}
          </h3>
          {itemName && (
            <p className="text-xs text-white/60 mt-0.5">{itemName}</p>
          )}
        </div>
            
        {/* Liste des pages */}
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
          {userPages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: page.color || ['#c7d2fe', '#fecdd3', '#bbf7d0', '#fde68a', '#ddd6fe'][index % 5]
                }}
              />
              <span className="font-medium text-white/90 text-sm">Page {index + 1}</span>
            </button>
          ))}
          
          {userPages.length === 0 && (
            <p className="text-center text-white/50 text-xs py-2">
              {t('journey.noUserPages', 'Aucune page personnalisée')}
            </p>
          )}
              
          {/* Bouton créer nouvelle page - Effet bombé rose */}
          <button
            onClick={onCreateNewPage}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)',
              boxShadow: '0 4px 15px rgba(244, 114, 182, 0.3), inset 0 -3px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(244, 114, 182, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 text-pink-600 relative z-10" />
            <span className="font-semibold text-pink-700 text-sm relative z-10">
              {t('journey.createNewPage', 'Créer une nouvelle page')}
            </span>
            <div 
              className="absolute top-0 left-2 right-2 h-[45%] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.1) 100%)' }}
            />
          </button>
        </div>
            
        {/* Bouton Annuler - Semi-transparent */}
        <button 
          onClick={onClose}
          className="w-full p-2.5 rounded-2xl transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="font-medium text-white/90 text-sm">
            {t('common.cancel', 'Annuler')}
          </span>
        </button>
      </div>
    </div>
  );
}

export default DuplicatePopup;
