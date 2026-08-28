import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useHomeLayout } from '../contexts/HomeLayoutContext';
import { DuplicatePopup } from '../components/home/DuplicatePopup';
import { getPostpartumCategoryById, getPostpartumItemsForCategory } from '../config/sectionNavigation';
import { PostpartumCategoryGrid } from '../components/postpartum/PostpartumCategoryGrid';
import { PostpartumSectionHeader } from '../components/postpartum/PostpartumSectionHeader';

const CATEGORY_ID = 'soins';

export default function PostpartumSoinsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const category = getPostpartumCategoryById(CATEGORY_ID);

  const { pages, addPage, duplicateItemToPage } = useHomeLayout();
  const [selectedForDuplicate, setSelectedForDuplicate] = useState(null);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const longPressTimer = useRef(null);

  const handleLongPressStart = (itemId) => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setSelectedForDuplicate(itemId);
      setShowDuplicatePopup(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
    setSelectedForDuplicate(null);
  };

  const handleDuplicate = async (pageId) => {
    if (duplicateItemToPage && selectedForDuplicate) {
      await duplicateItemToPage(selectedForDuplicate, pageId);
      toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
    }
    closeDuplicatePopup();
  };

  const handleCreatePageAndDuplicate = async () => {
    if (addPage) {
      const userPages = pages.filter((p) => !p.isDefault);
      const newPage = await addPage(`Page ${userPages.length + 1}`);
      if (newPage && duplicateItemToPage && selectedForDuplicate) {
        await duplicateItemToPage(selectedForDuplicate, newPage.id);
        toast.success(t('journey.duplicatedSuccess', 'Élément dupliqué !'));
      }
    }
    closeDuplicatePopup();
  };

  const selectedItem = getPostpartumItemsForCategory(CATEGORY_ID).find((i) => i.id === selectedForDuplicate);

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-2 rounded-full hover:bg-white/50">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
        </div>

        <PostpartumSectionHeader
          category={category}
          title={t(category?.titleKey, category?.title)}
          subtitle={t(category?.descKey, category?.desc)}
        />

        <PostpartumCategoryGrid
          categoryId={CATEGORY_ID}
          selectedId={selectedForDuplicate}
          onItemClick={(item) => navigate(item.route)}
          onLongPressStart={handleLongPressStart}
          onLongPressEnd={handleLongPressEnd}
        />

        <p className="text-center text-xs text-slate-400 mt-4">
          Appui long pour dupliquer vers une page personnalisée
        </p>
      </div>

      <DuplicatePopup
        isVisible={showDuplicatePopup}
        onClose={closeDuplicatePopup}
        onSelectPage={handleDuplicate}
        onCreateNewPage={handleCreatePageAndDuplicate}
        pages={pages}
        itemName={selectedItem ? t(selectedItem.titleKey, selectedItem.title) : category?.title}
        t={t}
      />
    </div>
  );
}
