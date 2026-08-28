import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { FertilityRemindersCard, PregnancyCard } from '../components/profile';
import { MaternityLeaveSummaryCard } from '../components/pregnancy/MaternityLeaveSummaryCard';
import { isPregnancyActive } from '../utils/pregnancyStatus';

/**
 * Vue dédiée Grossesse & Fertilité — suivi grossesse, congé maternité Ameli, etc.
 * Route canonique : /grossesse
 */
export default function GrossessePage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState(null);
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
    const [profileResult, fertilityResult, subscriptionResult] = await Promise.allSettled([
      api.pregnancy.getProfile(),
      api.pregnancy.getFertilityRemindersStatus(),
      api.subscription.getFullStatus(),
    ]);

    if (profileResult.status === 'fulfilled') setProfile(profileResult.value.data || null);
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

  useEffect(() => {
    refreshMe?.();
  }, [refreshMe]);

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
    <div className="min-h-screen gradient-bg" data-testid="grossesse-page">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <Button onClick={() => navigate('/')} variant="ghost" className="p-2 rounded-full" data-testid="grossesse-back-button">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Grossesse & Fertilité</h1>
            <p className="text-sm text-slate-600">
              {isPregnant ? 'Votre parcours grossesse' : 'Préparez votre projet bébé'}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center rounded-[24px] soft-clay-text-flat">Chargement...</Card>
        ) : isPregnant ? (
          <div className="space-y-4" data-testid="grossesse-pregnant-panel">
            <PregnancyCard
              pregnancyProfile={profile}
              subscriptionStatus={subscriptionStatus}
              setSubscriptionStatus={setSubscriptionStatus}
              onLoadFullStatus={loadData}
              formatDate={formatDate}
            />
            <MaternityLeaveSummaryCard defaultOpen={false} className="!col-span-1 w-full" />
          </div>
        ) : (
          <>
            <Card className="p-4 rounded-[24px] border-2 border-pink-100 bg-pink-50/80 soft-clay-text-flat" data-testid="grossesse-preconception-card">
              <p className="text-sm text-slate-700 leading-relaxed">
                Déclarez votre grossesse depuis le <strong>Suivi de cycles</strong> pour déverrouiller
                cette espace (dates, congé maternité Ameli, informations de grossesse).
              </p>
              <Button
                onClick={() => navigate('/cycle-tracking')}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                data-testid="grossesse-open-cycle-tracking"
              >
                <Heart className="w-4 h-4 mr-2" />
                Ouvrir le suivi de cycles
              </Button>
            </Card>
            <FertilityRemindersCard
              pregnancyProfile={profile}
              fertilityRemindersEnabled={fertilityEnabled}
              fertilityRemindersLoading={fertilityLoading}
              onToggle={toggleFertility}
            />
          </>
        )}
      </div>
    </div>
  );
}
