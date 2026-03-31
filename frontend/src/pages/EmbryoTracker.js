import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Baby, Lock, Crown } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useSubscription } from '../components/SubscriptionGate';

function EmbryoTracker() {
  const navigate = useNavigate();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [embryoData, setEmbryoData] = useState(null);
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  
  // Semaines gratuites (1-4)
  const MAX_FREE_WEEK = 4;

  useEffect(() => {
    loadPregnancyProfile();
  }, []);

  useEffect(() => {
    if (currentWeek) {
      loadEmbryoData(currentWeek);
    }
  }, [currentWeek]);

  const loadPregnancyProfile = async () => {
    try {
      const response = await api.pregnancy.getProfile();
      if (response.data && response.data.current_week) {
        setPregnancyProfile(response.data);
        // Si l'utilisateur est gratuit et sa semaine actuelle > 4, mettre semaine 4
        const week = response.data.current_week;
        if (!isPremium && week > MAX_FREE_WEEK) {
          setCurrentWeek(MAX_FREE_WEEK);
        } else {
          setCurrentWeek(week);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const loadEmbryoData = async (week) => {
    try {
      const response = await api.embryo.getWeek(week);
      setEmbryoData(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleWeekChange = (newWeek) => {
    const maxWeek = isPremium ? 40 : MAX_FREE_WEEK;
    if (newWeek >= 1 && newWeek <= maxWeek) {
      setCurrentWeek(newWeek);
    }
  };
  
  const maxWeek = isPremium ? 40 : MAX_FREE_WEEK;

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/journey-steps?open=pregnancy')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Évolution de l'embryon</h1>
        </div>

        {pregnancyProfile && (
          <Card className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Vous êtes actuellement à</p>
                <p className="text-3xl font-bold text-rose-600">Semaine {pregnancyProfile.current_week} SA</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          {/* Banner pour utilisateurs gratuits */}
          {!subscriptionLoading && !isPremium && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-700">Semaines 1-4 disponibles gratuitement</span>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full"
              >
                <Crown className="w-3 h-3" />
                Tout débloquer
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => handleWeekChange(currentWeek - 1)}
              data-testid="prev-week-button"
              disabled={currentWeek <= 1}
              className="bg-slate-100 text-slate-600 rounded-full px-6 py-2 font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              ← Précédent
            </Button>
            <div className="text-center">
              <p className="text-sm text-slate-500">Semaine</p>
              <p className="text-3xl font-bold text-sky-600" data-testid="current-week-display">{currentWeek}</p>
            </div>
            <Button
              onClick={() => handleWeekChange(currentWeek + 1)}
              data-testid="next-week-button"
              disabled={currentWeek >= maxWeek}
              className="bg-slate-100 text-slate-600 rounded-full px-6 py-2 font-semibold hover:bg-slate-200 disabled:opacity-50"
            >
              Suivant →
            </Button>
          </div>

          <input
            type="range"
            data-testid="week-slider"
            min="1"
            max={maxWeek}
            value={currentWeek}
            onChange={(e) => handleWeekChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-sky-200 to-pink-200 rounded-full appearance-none cursor-pointer"
            style={{
              accentColor: '#87CEEB'
            }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Semaine 1 SA</span>
            <span>Semaine {maxWeek} SA</span>
          </div>
        </Card>

        {embryoData && (
          <Card className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="embryo-info-card">
            <div className="space-y-6">
              {embryoData.image_url && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={embryoData.image_url} 
                    alt={`Embryon semaine ${currentWeek}`}
                    className="w-64 h-64 object-contain rounded-2xl"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Taille de l'embryon</h3>
                <p className="text-4xl font-bold text-sky-600">{embryoData.embryo_size}</p>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h4 className="text-lg font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Développement</h4>
                <p className="text-slate-600 leading-relaxed">{embryoData.development}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-2xl p-4">
                <p className="text-sm text-slate-600 text-center">
                  Chaque grossesse est unique. Consultez votre professionnel de santé pour des informations personnalisées.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default EmbryoTracker;
