import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { CloudCard } from '../components/ui/CloudCard';
import api from '../utils/api';
import { BabywearingSection } from '../components/postpartum';

export default function PostpartumPortagePage() {
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
              <h1 className="text-2xl font-bold text-slate-700">Portage</h1>
              <p className="text-sm text-slate-500">Écharpes, porte-bébé, positions</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
        </CloudCard>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <BabywearingSection babywearing={content?.babywearing} />
        )}
      </div>
    </div>
  );
}
