import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { CloudCard } from '../components/ui/CloudCard';
import api from '../utils/api';
import { DiapersSection } from '../components/postpartum';

export default function PostpartumCoucherChangePage() {
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
        <CloudCard color="yellow" className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="p-2 rounded-full hover:bg-white/50"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-700">Coucher et change</h1>
              <p className="text-sm text-slate-500">Sommeil, couches, soins</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Moon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CloudCard>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <DiapersSection diapers={content?.diapers} />
        )}
      </div>
    </div>
  );
}
