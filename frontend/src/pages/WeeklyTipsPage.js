import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, ChevronRight, AlertTriangle, Lock, Crown } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/PageHeader';
import { useSubscription } from '../components/SubscriptionGate';

function WeeklyTipsPage() {
  const navigate = useNavigate();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  
  // Semaines gratuites (1-4)
  const FREE_WEEKS = [1, 2, 3, 4];

  useEffect(() => {
    loadPregnancyProfile();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      loadWeeklyTip(selectedWeek);
    }
  }, [selectedWeek]);

  const loadPregnancyProfile = async () => {
    try {
      const response = await api.pregnancy.getProfile();
      if (response.data && response.data.current_week) {
        setPregnancyProfile(response.data);
        // Si l'utilisateur est gratuit et sa semaine actuelle > 4, mettre semaine 4
        const currentWeek = response.data.current_week;
        if (!isPremium && currentWeek > 4) {
          setSelectedWeek(4);
        } else {
          setSelectedWeek(currentWeek);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const loadWeeklyTip = async (week) => {
    try {
      const response = await api.tips.getWeekly(week);
      setCurrentTip(response.data);
    } catch (error) {
      console.error('Erreur chargement conseil:', error);
    }
  };

  const handleWeekSelect = (week) => {
    // Si l'utilisateur est gratuit et essaie de sélectionner une semaine > 4
    if (!isPremium && !FREE_WEEKS.includes(week)) {
      return; // Ne rien faire - le bouton sera désactivé visuellement
    }
    setSelectedWeek(week);
  };

  const weeks = [
    { week: 1, trimester: 1 },
    { week: 2, trimester: 1 },
    { week: 3, trimester: 1 },
    { week: 4, trimester: 1 },
    { week: 8, trimester: 1 },
    { week: 12, trimester: 1 },
    { week: 16, trimester: 2 },
    { week: 20, trimester: 2 },
    { week: 24, trimester: 2 },
    { week: 28, trimester: 3 },
    { week: 32, trimester: 3 },
    { week: 36, trimester: 3 },
    { week: 40, trimester: 3 },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Conseils hebdomadaires" />

        {pregnancyProfile && (
          <Card className="bg-gradient-to-br from-teal-100 to-sky-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-300 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Semaine actuelle</p>
                <p className="text-2xl font-bold text-teal-600">Semaine {pregnancyProfile.current_week}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Sélectionner une semaine</h3>
          
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
          
          <div className="grid grid-cols-3 gap-2">
            {weeks.map((item) => {
              const isLocked = !isPremium && !FREE_WEEKS.includes(item.week);
              return (
                <button
                  key={item.week}
                  data-testid={`week-${item.week}-button`}
                  onClick={() => handleWeekSelect(item.week)}
                  disabled={isLocked}
                  className={`relative rounded-2xl py-3 px-4 font-semibold transition-all ${
                    selectedWeek === item.week
                      ? 'bg-gradient-to-r from-teal-400 to-teal-300 text-white shadow-lg'
                      : isLocked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  S{item.week}
                  {isLocked && (
                    <Lock className="w-3 h-3 absolute top-1 right-1 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {currentTip && (
          <Card className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="tip-card">
            <div className="space-y-6">
              <div>
                <span className="inline-block px-4 py-1 bg-teal-100 text-teal-600 rounded-full text-sm font-semibold mb-3">
                  Semaine {currentTip.week}
                </span>
                <h2 className="text-3xl font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>{currentTip.title}</h2>
              </div>

              {currentTip.image_url && (
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={currentTip.image_url} 
                      alt={`Fœtus semaine ${currentTip.week}`}
                      className="w-56 h-56 object-contain rounded-2xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-sky-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Taille</p>
                      <p className="text-xl font-bold text-sky-600">{currentTip.embryo_size}</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Poids</p>
                      <p className="text-xl font-bold text-pink-500">{currentTip.embryo_weight || '< 1 g'}</p>
                    </div>
                  </div>
                  {currentTip.fruit_comparison && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200 text-center">
                      <p className="text-sm text-amber-700">
                        <span className="font-semibold">Taille comparable à :</span> {currentTip.fruit_comparison}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!currentTip.image_url && currentTip.embryo_size && (
                <div className="bg-white rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-sky-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Taille</p>
                      <p className="text-xl font-bold text-sky-600">{currentTip.embryo_size}</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Poids</p>
                      <p className="text-xl font-bold text-pink-500">{currentTip.embryo_weight || '< 1 g'}</p>
                    </div>
                  </div>
                  {currentTip.fruit_comparison && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200 text-center">
                      <p className="text-sm text-amber-700">
                        <span className="font-semibold">Taille comparable à :</span> {currentTip.fruit_comparison}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl p-6">
                <p className="text-slate-600 leading-relaxed">{currentTip.description}</p>
              </div>

              {currentTip.development && (
                <div className="bg-gradient-to-br from-pink-100 to-sky-100 rounded-2xl p-6">
                  <h4 className="font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Développement</h4>
                  <p className="text-slate-600">{currentTip.development}</p>
                </div>
              )}

              {currentTip.administrative_tasks && currentTip.administrative_tasks.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    📋 Démarches administratives
                  </h4>
                  <ul className="space-y-2">
                    {currentTip.administrative_tasks.map((task, index) => (
                      <li key={index} className="text-slate-700 leading-relaxed">
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note importante dents et cheveux */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-rose-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-800 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      ⚠️ Note importante
                    </h4>
                    <p className="text-slate-700 leading-relaxed mb-3">
                      <strong>Ne négligez pas vos dents et vos cheveux !</strong> Durant la grossesse, ils sont très fragilisés en raison des changements hormonaux.
                    </p>
                    <ul className="space-y-2 text-slate-600 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">🦷</span>
                        <span><strong>Dents :</strong> Consultez votre dentiste dès le début de la grossesse et signalez tout saignement des gencives.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">💇</span>
                        <span><strong>Cheveux :</strong> Une chute de cheveux peut survenir. N'hésitez pas à consulter un dermatologue si nécessaire.</span>
                      </li>
                    </ul>
                    <p className="text-xs text-rose-600 mt-3 italic">
                      N'hésitez pas à consulter les spécialistes pour prendre soin de vous !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default WeeklyTipsPage;
