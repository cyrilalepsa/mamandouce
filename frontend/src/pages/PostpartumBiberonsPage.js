import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { FormulaSection } from '../components/postpartum';

export default function PostpartumBiberonsPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/postpartum/alimentation')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-700">Biberons</h1>
            <p className="text-sm text-slate-500">Préparation, quantités, stérilisation</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <FormulaSection
            content={content}
            isExpanded={true}
            onToggle={() => {}}
            favorites={[]}
            onToggleFavorite={() => {}}
          />
        )}
      </div>
    </div>
  );
}
