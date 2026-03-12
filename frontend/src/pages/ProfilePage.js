import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react';
import api from '../utils/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUser(userRes.data);
      
      const profileRes = await api.pregnancy.getProfile();
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mon profil</h1>
        </div>

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : (
          <>
            <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="user-info-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{user?.name}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Mail className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-semibold text-slate-700">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-xs text-slate-500">Membre depuis</p>
                    <p className="font-semibold text-slate-700">{formatDate(user?.created_at)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {pregnancyProfile && (
              <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="pregnancy-info-card">
                <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Informations de grossesse</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date des dernières règles</p>
                    <p className="text-lg font-bold text-slate-700">{formatDate(pregnancyProfile.last_period_date)}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date de conception estimée</p>
                    <p className="text-lg font-bold text-pink-600">{formatDate(pregnancyProfile.estimated_conception_date)}</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4">
                    <p className="text-sm text-slate-500 font-semibold">Date prévue d'accouchement</p>
                    <p className="text-lg font-bold text-rose-600">{formatDate(pregnancyProfile.estimated_due_date)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-4">
                    <p className="text-sm text-slate-600 font-semibold">Semaine actuelle</p>
                    <p className="text-3xl font-bold text-slate-700">{pregnancyProfile.current_week} semaines</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
