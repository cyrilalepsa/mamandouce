import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { AppointmentsSection } from '../components/postpartum';

export default function PostpartumRdvPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ appointments: true });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.postpartum.getContent();
      if (response.data) {
        setContent(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/section/postpartum')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-700">RDV médicaux</h1>
            <p className="text-sm text-slate-500">Suivi post-accouchement</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <AppointmentsSection
            content={content}
            isExpanded={expandedSections.appointments}
            onToggle={() => toggleSection('appointments')}
            favorites={[]}
            onToggleFavorite={() => {}}
          />
        )}
      </div>
    </div>
  );
}
