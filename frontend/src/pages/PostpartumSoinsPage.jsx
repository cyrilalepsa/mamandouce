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
import { PostpartumHubCard } from '../components/postpartum/PostpartumHubCard';

const SOINS_ITEMS = [
  { 
    id: 'diapers', 
    icon: '😴', 
    title: 'Coucher et change', 
    desc: 'Sommeil, couches, soins',
    color: 'from-yellow-400 to-amber-500',
    vibrantBg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(254,249,195,0.95) 30%, rgba(253,230,138,0.85) 70%, rgba(251,191,36,0.75) 100%)',
    vibrantBorder: 'rgba(234,179,8,0.4)',
    vibrantShadow: '234,179,8',
    route: '/postpartum/soins/coucher-change'
  },
  { 
    id: 'babywearing', 
    icon: '🤱', 
    title: 'Portage', 
    desc: 'Écharpes, porte-bébé, positions',
    color: 'from-blue-400 to-sky-500',
    vibrantBg: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
    vibrantBorder: 'rgba(14,165,233,0.4)',
    vibrantShadow: '14,165,233',
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
        <div className="flex items-center gap-4 mb-6">
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Grille de cartes 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {SOINS_ITEMS.map((item) => (
            <PostpartumHubCard
              key={item.id}
              title={item.title}
              desc={item.desc}
              emoji={item.icon}
              selected={selectedForDuplicate === item.id}
              onClick={() => navigate(item.route)}
              onTouchStart={() => handleLongPressStart(item.id)}
              onTouchEnd={handleLongPressEnd}
              onTouchMove={handleLongPressEnd}
              onMouseDown={() => handleLongPressStart(item.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            />
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
