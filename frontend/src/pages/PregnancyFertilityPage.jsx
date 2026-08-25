import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { PregnancyToggle } from '../components/cycle/PregnancyToggle';
import { FertilityRemindersCard, PregnancyCard } from '../components/profile';
import { MaternityLeaveSummaryCard } from '../components/pregnancy/MaternityLeaveSummaryCard';
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
    if (!value) return 'Non renseignée';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Non renseignée'
      : date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen gradient-bg" data-testid="pregnancy-fertility-page">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => navigate(-1)} variant="ghost" className="p-2 rounded-full">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Grossesse & Fertilité</h1>
            <p className="text-sm text-slate-600">
              {isPregnant ? 'Votre parcours grossesse' : 'Votre cycle et votre projet bébé'}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center rounded-[24px] soft-clay-text-flat">Chargement...</Card>
        ) : (
          <>
            {!isPregnant && (
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
            )}

            {!isPregnant && cycleStatus?.show_alert && (
              <Card className="p-4 rounded-[24px] border-2 border-amber-200 bg-amber-50 soft-clay-text-flat">
                <p className="font-bold text-amber-800">{cycleStatus?.message || 'Suivi du cycle'}</p>
                {cycleStatus?.suggestion && (
                  <p className="text-sm text-amber-700 mt-1">{cycleStatus.suggestion}</p>
                )}
              </Card>
            )}

            {isPregnant ? (
              <div className="space-y-4" data-testid="pregnancy-fertility-pregnant-panel">
                <PregnancyCard
                  pregnancyProfile={profile}
                  subscriptionStatus={subscriptionStatus}
                  setSubscriptionStatus={setSubscriptionStatus}
                  onLoadFullStatus={loadData}
                  formatDate={formatDate}
                />
                <MaternityLeaveSummaryCard defaultOpen className="!col-span-1 w-full" />
              </div>
            ) : (
              <FertilityRemindersCard
                pregnancyProfile={profile}
                fertilityRemindersEnabled={fertilityEnabled}
                fertilityRemindersLoading={fertilityLoading}
                onToggle={toggleFertility}
              />
            )}

            {!isPregnant && (
              <Button
                onClick={() => navigate('/cycle-tracking')}
                className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Ouvrir le suivi de cycle
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
