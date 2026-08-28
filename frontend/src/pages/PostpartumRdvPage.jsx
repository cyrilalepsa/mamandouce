import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { AppointmentsSection } from '../components/postpartum';
import { getPostpartumCategoryById } from '../config/sectionNavigation';
import { PostpartumSectionHeader } from '../components/postpartum/PostpartumSectionHeader';

const CATEGORY_ID = 'rdv';

export default function PostpartumRdvPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const category = getPostpartumCategoryById(CATEGORY_ID);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.postpartum.getContent();
      if (response.data) setContent(response.data);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AppointmentsSection appointments={content?.appointments} />
        )}
      </div>
    </div>
  );
}
