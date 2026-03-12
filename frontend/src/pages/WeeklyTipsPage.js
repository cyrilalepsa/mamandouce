import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BookOpen, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/PageHeader';

function WeeklyTipsPage() {
  const navigate = useNavigate();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

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
        setSelectedWeek(response.data.current_week);
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

  const weeks = [
    { week: 1, trimester: 1 },
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
          <div className="grid grid-cols-3 gap-2">
            {weeks.map((item) => (
              <button
                key={item.week}
                data-testid={`week-${item.week}-button`}
                onClick={() => setSelectedWeek(item.week)}
                className={`rounded-2xl py-3 px-4 font-semibold transition-all ${
                  selectedWeek === item.week
                    ? 'bg-gradient-to-r from-teal-400 to-teal-300 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                S{item.week}
              </button>
            ))}
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
                <div className="flex justify-center">
                  <img 
                    src={currentTip.image_url} 
                    alt={`Embryon semaine ${currentTip.week}`}
                    className="w-64 h-64 object-contain rounded-2xl"
                  />
                </div>
              )}

              {currentTip.embryo_size && (
                <div className="bg-white rounded-2xl p-6">
                  <p className="text-sm text-slate-500 font-semibold mb-1">Taille de l'embryon</p>
                  <p className="text-2xl font-bold text-sky-600">{currentTip.embryo_size}</p>
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
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default WeeklyTipsPage;
