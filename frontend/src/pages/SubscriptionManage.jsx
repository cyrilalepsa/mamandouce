import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Crown, Calendar, CreditCard } from 'lucide-react';
import api from '../utils/api';

function SubscriptionManage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const userRes = await api.auth.getMe();
      setUser(userRes.data);
      
      // Ici on chargerait les détails de l'abonnement
      // Pour l'instant, on utilise les données du user
      setSubscription({
        status: userRes.data.subscription_status || 'inactive',
        expiry: userRes.data.subscription_expiry || null
      });
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isActive = subscription?.status === 'active';
  const isExpired = subscription?.expiry && new Date(subscription.expiry) < new Date();

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
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('subscription.mySubscription')}</h1>
        </div>

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">{t('common.loading')}</p>
          </Card>
        ) : (
          <>
            {/* Statut actuel */}
            <Card className={`rounded-3xl p-8 border-2 ${
              isActive && !isExpired
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isActive && !isExpired
                    ? 'bg-gradient-to-br from-amber-400 to-amber-300'
                    : 'bg-slate-200'
                }`}>
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {isActive && !isExpired ? t('subscription.premiumActive') : t('subscription.free')}
                  </h2>
                  <p className="text-slate-600">
                    {isActive && !isExpired
                      ? t('subscription.allFeaturesUnlocked')
                      : t('subscription.upgradeToPremium')}
                  </p>
                </div>
              </div>

              {isActive && subscription.expiry && (
                <div className="mt-6 flex items-center gap-3 bg-white rounded-2xl p-4">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sm text-slate-500">{t('subscription.expiryDate')}</p>
                    <p className="font-bold text-slate-700">{formatDate(subscription.expiry)}</p>
                    {isExpired && (
                      <p className="text-sm text-red-500 mt-1">{t('subscription.expired')}</p>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Actions */}
            {!isActive || isExpired ? (
              <Card className="bg-gradient-to-br from-sky-400 to-sky-300 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('subscription.goPremiumTitle')}</h3>
                <p className="text-sky-50 mb-6">{t('subscription.goPremiumDesc')}</p>
                <ul className="space-y-2 mb-6 text-white">
                  <li>✓ {t('subscription.features.unlimitedScanner')}</li>
                  <li>✓ {t('subscription.features.weeklyTips')}</li>
                  <li>✓ {t('subscription.features.fullTracking')}</li>
                  <li>✓ {t('subscription.features.babyPrep')}</li>
                  <li>✓ {t('subscription.features.emailNotifications')}</li>
                </ul>
                <Button
                  onClick={() => navigate('/pricing')}
                  data-testid="upgrade-button"
                  className="w-full bg-white text-sky-600 rounded-full py-3 font-bold text-lg hover:shadow-xl"
                >
                  {t('subscription.subscribeNow')}
                </Button>
              </Card>
            ) : (
              <Card className="bg-white rounded-3xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('subscription.management')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <CreditCard className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="text-sm text-slate-500">{t('subscription.amountPaid')}</p>
                      <p className="font-bold text-slate-700">30€ / 9 mois</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    {t('subscription.contactUs')}
                  </p>
                </div>
              </Card>
            )}

            {/* Infos */}
            <Card className="bg-white rounded-3xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('subscription.needHelp')}</h3>
              <p className="text-slate-600 text-sm">
                {t('subscription.helpDesc')}
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SubscriptionManage;