import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Baby, Calendar, Heart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { PregnancyToggle } from '../components/cycle/PregnancyToggle';
import { FertilityRemindersCard, PregnancyCard } from '../components/profile';
import { isPregnancyActive } from '../utils/pregnancyStatus';

export default function PregnancyFertilityPage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cycleStatus, setCycleStatus] = useState(null);
  const [fertilityEnabled, setFertilityEnabled] = useState(false);
  const [fertilityLoading, setFertilityLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [loading, setLoading] = useState(true);

  const isPregnant = isPregnancyActive({
    profile,
    user,
    storedPregnant: localStorage.getItem('mamandouce_pregnant'),
  });
  const dueDate = profile?.estimated_due_date
    || localStorage.getItem('mamandouce_due_date')
    || '';

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profileResult, cycleResult, fertilityResult, subscriptionResult] =
      await Promise.allSettled([
        api.pregnancy.getProfile(),
        api.cycle.status(),
        api.pregnancy.getFertilityRemindersStatus(),
        api.subscription.getFullStatus(),
      ]);

    if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data || null);
    if (cycleResult.status === 'fulfilled') setCycleStatus(cycleResult.value.data || null);
    if (fertilityResult.status === 'fulfilled') {
      setFertilityEnabled(Boolean(fertilityResult.value.data?.enabled));
    }
    if (subscriptionResult.status === 'fulfilled') {
      setSubscriptionStatus(
        subscriptionResult.value.data?.subscription_status
        || (subscriptionResult.value.data?.is_premium ? 'premium' : 'free'),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleFertility = async () => {
    if (isPregnant) return;
    setFertilityLoading(true);
    try {
      const next = !fertilityEnabled;
      await api.pregnancy.toggleFertilityReminders(next);
      setFertilityEnabled(next);
    } finally {
      setFertilityLoading(false);
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Non renseignée'
      : date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-2 rounded-full">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Grossesse & Fertilité</h1>
            <p className="text-sm text-slate-500">
              {isPregnant ? 'Votre parcours grossesse' : 'Votre cycle et votre projet bébé'}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center rounded-3xl">Chargement...</Card>
        ) : (
          <>
            <PregnancyToggle
              mode="profile"
              isPregnant={isPregnant}
              dueDate={dueDate}
              lastPeriodDate={profile?.last_period_date}
              cycleLength={profile?.cycle_length || 28}
              currentWeek={profile?.current_week}
              trimester={profile?.trimester}
              onPregnant={async (_dpa, periodDate) => {
                await api.pregnancy.calculate({
                  last_period_date: periodDate,
                  cycle_length: profile?.cycle_length || 28,
                });
                await refreshMe();
                await loadData();
              }}
            />

            {!isPregnant && cycleStatus?.show_alert && (
              <Card className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50">
                <div className="flex gap-3">
                  <Calendar className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-amber-800">{cycleStatus?.message || 'Suivi du cycle'}</p>
                    {cycleStatus?.suggestion && (
                      <p className="text-sm text-amber-700">{cycleStatus.suggestion}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {isPregnant ? (
              <>
                <PregnancyCard
                  pregnancyProfile={profile}
                  subscriptionStatus={subscriptionStatus}
                  setSubscriptionStatus={setSubscriptionStatus}
                  onLoadFullStatus={loadData}
                  formatDate={formatDate}
                />
                <Card className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
                  <div className="flex items-center gap-3">
                    <Baby className="w-8 h-8 text-pink-500" />
                    <div>
                      <p className="font-bold text-pink-700">Votre grossesse est en cours</p>
                      <p className="text-sm text-pink-600">Retrouvez ici vos informations essentielles.</p>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <FertilityRemindersCard
                pregnancyProfile={profile}
                fertilityRemindersEnabled={fertilityEnabled}
                fertilityRemindersLoading={fertilityLoading}
                onToggle={toggleFertility}
              />
            )}

            <Button
              onClick={() => navigate(isPregnant ? '/tracking' : '/cycle-tracking')}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              {isPregnant ? 'Ouvrir le suivi grossesse' : 'Ouvrir le suivi de cycle'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
