import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { CloudCard } from '../components/ui/CloudCard';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { DuplicatePopup } from '../components/home/DuplicatePopup';
import { PostpartumHubCard } from '../components/postpartum/PostpartumHubCard';

const SECURITE_ITEMS = [
  { 
    id: 'difficulties', 
    icon: '💭', 
    title: 'Difficultés rencontrées', 
    desc: 'Baby blues, fatigue, solutions',
    color: 'from-yellow-400 to-amber-500',
    bgGradient: 'from-white/95 via-yellow-100/70 to-amber-100/50',
    route: '/postpartum/securite/difficultes'
  },
  { 
    id: 'precautions', 
    icon: '🛡️', 
    title: 'Précautions et sécurité', 
    desc: 'Gestes à éviter, vigilance',
    color: 'from-blue-400 to-sky-500',
    bgGradient: 'from-white/95 via-blue-100/70 to-sky-100/50',
    route: '/postpartum/securite/precautions'
  },
];

export default function PostpartumSecuritePage() {
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
    const item = SECURITE_ITEMS.find(i => i.id === selectedForDuplicate);
    return item?.title || 'Sécurité';
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
              <h1 className="text-2xl font-bold text-slate-700">Sécurité</h1>
              <p className="text-sm text-slate-500">Difficultés, précautions</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Grille de cartes 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {SECURITE_ITEMS.map((item) => (
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
