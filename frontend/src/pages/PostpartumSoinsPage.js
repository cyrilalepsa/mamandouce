import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Baby, Moon, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CloudCard } from '../components/ui/CloudCard';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { DuplicatePopup } from '../components/home/DuplicatePopup';

const SOINS_ITEMS = [
  { 
    id: 'diapers', 
    icon: '😴', 
    title: 'Coucher et change', 
    desc: 'Sommeil, couches, soins',
    color: 'from-indigo-400 to-violet-500',
    vibrantBg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(238,242,255,0.95) 30%, rgba(224,231,255,0.85) 70%, rgba(199,210,254,0.75) 100%)',
    vibrantBorder: 'rgba(99,102,241,0.4)',
    vibrantShadow: '99,102,241',
    route: '/postpartum/soins/coucher-change'
  },
  { 
    id: 'babywearing', 
    icon: '🤱', 
    title: 'Portage', 
    desc: 'Écharpes, porte-bébé, positions',
    color: 'from-rose-400 to-pink-500',
    vibrantBg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,228,230,0.95) 30%, rgba(254,205,211,0.85) 70%, rgba(253,164,175,0.75) 100%)',
    vibrantBorder: 'rgba(244,63,94,0.4)',
    vibrantShadow: '244,63,94',
    route: '/postpartum/soins/portage'
  },
];

export default function PostpartumSoinsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Duplication
  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  const [selectedForDuplicate, setSelectedForDuplicate] = useState(null);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [showCreatePageForm, setShowCreatePageForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const longPressTimer = useRef(null);

  const handleLongPressStart = (itemId) => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setSelectedForDuplicate(itemId);
      setShowDuplicatePopup(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedForDuplicate) {
      // Utiliser l'ID sélectionné, pas 'postpartum'
      await duplicateItemToPage(selectedForDuplicate, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
    }
    closeDuplicatePopup();
  };

  const handleCreatePageAndDuplicate = async () => {
    // Créer directement la page sans demander de nom
    if (addPage) {
      const userPages = pages.filter(p => !p.isDefault);
      const defaultName = `Page ${userPages.length + 1}`;
      const newPage = await addPage(defaultName);
      if (newPage && duplicateItemToPage && selectedForDuplicate) {
        // Utiliser l'ID sélectionné, pas 'postpartum'
        await duplicateItemToPage(selectedForDuplicate, newPage.id);
        toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
      }
    }
    closeDuplicatePopup();
  };

  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
    setSelectedForDuplicate(null);
    setShowCreatePageForm(false);
    setNewPageName('');
  };

  const getSelectedItemName = () => {
    const item = SOINS_ITEMS.find(i => i.id === selectedForDuplicate);
    return item?.title || 'Soins';
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <CloudCard color="blue" className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="p-2 rounded-full hover:bg-white/50"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-700">Soins quotidiens</h1>
              <p className="text-sm text-slate-500">Coucher, change, portage</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
          </div>
        </CloudCard>

        {/* Grille de cartes 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {SOINS_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              onTouchStart={() => handleLongPressStart(item.id)}
              onTouchEnd={handleLongPressEnd}
              onTouchMove={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart(item.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all select-none ${
                selectedForDuplicate === item.id ? 'ring-2 ring-pink-400' : ''
              }`}
              style={{ 
                background: item.vibrantBg,
                border: `2px solid ${item.vibrantBorder}`,
                boxShadow: `0 8px 20px -4px rgba(${item.vibrantShadow},0.3), 0 4px 8px -2px rgba(${item.vibrantShadow},0.15), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -3px 6px rgba(${item.vibrantShadow},0.1)`,
                WebkitUserSelect: 'none', 
                WebkitTouchCallout: 'none' 
              }}
            >
              {/* Effet de reflet bombé glossy */}
              <div 
                className="absolute top-0 left-2 right-2 h-2/5 rounded-t-xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
              />
              
              <div className="relative text-center">
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-black text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-700">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info duplication */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Appui long pour dupliquer vers une page personnalisée
        </p>
      </div>

      {/* Popup de duplication avec effet bombé 3D */}
      <DuplicatePopup
        isVisible={showDuplicatePopup}
        onClose={closeDuplicatePopup}
        onSelectPage={handleDuplicate}
        onCreateNewPage={handleCreatePageAndDuplicate}
        pages={pages}
        itemName={getSelectedItemName()}
        t={t}
      />
    </div>
  );
}
