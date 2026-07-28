import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PiggyBank, Gift, CreditCard, ArrowRight, Sparkles, Check, Euro, History, Send } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import PageHeader from '../components/PageHeader';
import api from '../utils/api';
import { toast } from 'sonner';
import { N20Amount } from '../components/N20Icon';

function TireliirePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sendingGift, setSendingGift] = useState(false);
  const [giftForm, setGiftForm] = useState({ email: '', type: 'postpartum' });
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [applyingReferral, setApplyingReferral] = useState(false);

  // Check for referral code in URL
  const referralCode = searchParams.get('ref');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/tirelire/balance');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching tirelire:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-apply referral bonus if code in URL
  useEffect(() => {
    if (referralCode && !applyingReferral) {
      applyReferralBonus();
    }
  }, [referralCode]);

  const applyReferralBonus = async () => {
    if (!referralCode || applyingReferral) return;
    
    setApplyingReferral(true);
    try {
      const res = await api.post('/tirelire/apply-referral-bonus', null, {
        params: { referral_code: referralCode }
      });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      // Don't show error if already received
      if (error.response?.data?.detail !== "Bonus de parrainage déjà reçu") {
        toast.error(error.response?.data?.detail || 'Erreur');
      }
    } finally {
      setApplyingReferral(false);
    }
  };

  const handleUseForPurchase = async (packageType) => {
    try {
      const res = await api.post('/tirelire/use-for-purchase', null, {
        params: { package_type: packageType }
      });
      
      if (res.data.is_free) {
        // If tirelire covers full price, confirm directly
        const confirmRes = await api.post('/tirelire/confirm-discount', null, {
          params: { package_type: packageType }
        });
        toast.success(`${packageType === 'premium' ? 'Premium' : 'Post-partum'} débloqué gratuitement !`);
        fetchData();
      } else {
        // Redirect to payment with discount
        toast.info(`Réduction de ${res.data.discount}€ appliquée ! Reste à payer: ${res.data.final_price}€`);
        navigate(`/pricing?package=${packageType}&discount=${res.data.discount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  const handleSendGift = async (e) => {
    e.preventDefault();
    if (!giftForm.email) return;
    
    setSendingGift(true);
    try {
      const res = await api.post('/tirelire/send-gift', null, {
        params: {
          recipient_email: giftForm.email,
          gift_type: giftForm.type
        }
      });
      toast.success(res.data.message);
      setShowGiftForm(false);
      setGiftForm({ email: '', type: 'postpartum' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setSendingGift(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Ma Tirelire" icon={<PiggyBank className="w-6 h-6 text-pink-500" />} />

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-pink-100 via-rose-50 to-white p-6 rounded-3xl shadow-xl border-2 border-pink-200/50" data-testid="tirelire-balance-card">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <PiggyBank className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-lg text-rose-600 font-medium mb-1">Mon solde N20</h2>
            <div className="text-5xl font-bold text-rose-700 mb-2 flex justify-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <N20Amount value={data?.balance || 0} size={36} valueClassName="text-5xl font-bold text-rose-700" />
            </div>
            {data?.balance > 0 && (
              <p className="text-rose-500 text-sm">
                Utilisable sur Premium ou Post-partum
              </p>
            )}
          </div>

          {/* Quick Actions */}
          {data?.balance > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUseForPurchase('premium')}
                className="p-3 bg-white/80 rounded-xl border border-pink-200 hover:bg-pink-50 transition-all group"
                data-testid="use-for-premium-btn"
              >
                <div className="text-sm font-medium text-slate-700">Premium</div>
                <div className="text-xs text-slate-500">
                  {data.premium_after_discount === 0 ? (
                    <span className="text-green-600 font-bold">GRATUIT</span>
                  ) : (
                    <>30€ → <span className="text-rose-600 font-bold">{data.premium_after_discount}€</span></>
                  )}
                </div>
              </button>
              <button
                onClick={() => handleUseForPurchase('postpartum')}
                className="p-3 bg-white/80 rounded-xl border border-pink-200 hover:bg-pink-50 transition-all group"
                data-testid="use-for-postpartum-btn"
              >
                <div className="text-sm font-medium text-slate-700">Post-partum</div>
                <div className="text-xs text-slate-500">
                  {data.postpartum_after_discount === 0 ? (
                    <span className="text-green-600 font-bold">GRATUIT</span>
                  ) : (
                    <>10€ → <span className="text-rose-600 font-bold">{data.postpartum_after_discount}€</span></>
                  )}
                </div>
              </button>
            </div>
          )}
        </Card>

        {/* Gift Balance (for Godmothers) */}
        {data?.can_gift && data?.gift_balance > 0 && (
          <Card className="bg-gradient-to-br from-purple-100 via-violet-50 to-white p-5 rounded-2xl shadow-lg border-2 border-purple-200/50" data-testid="gift-balance-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-700">Solde Cadeaux</h3>
                  <p className="text-sm text-slate-500">Pour offrir à tes filleules</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                <N20Amount value={data.gift_balance} size={22} valueClassName="text-2xl font-bold text-purple-600" />
              </div>
            </div>

            {!showGiftForm ? (
              <Button
                onClick={() => setShowGiftForm(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                data-testid="open-gift-form-btn"
              >
                <Send className="w-5 h-5" />
                Offrir un cadeau
              </Button>
            ) : (
              <form onSubmit={handleSendGift} className="space-y-3">
                <Input
                  type="email"
                  value={giftForm.email}
                  onChange={(e) => setGiftForm({ ...giftForm, email: e.target.value })}
                  placeholder="Email de la destinataire"
                  className="w-full rounded-xl border-purple-200"
                  required
                  data-testid="gift-email-input"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGiftForm({ ...giftForm, type: 'postpartum' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      giftForm.type === 'postpartum'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="font-medium">Post-partum</div>
                    <div className="text-sm text-slate-500"><N20Amount value={10} size={12} /></div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGiftForm({ ...giftForm, type: 'premium' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      giftForm.type === 'premium'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="font-medium">Premium</div>
                    <div className="text-sm text-slate-500"><N20Amount value={30} size={12} /></div>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowGiftForm(false)}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendingGift || data.gift_balance < (giftForm.type === 'premium' ? 30 : 10)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white py-2 rounded-xl"
                    data-testid="send-gift-btn"
                  >
                    {sendingGift ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}

        {/* How it works */}
        <Card className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Sparkles className="w-5 h-5 text-amber-500" />
            Comment ça marche ?
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-pink-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-700">Bonus de bienvenue</h4>
                <p className="text-sm text-slate-500">
                  Arrivée via un lien de parrainage = <span className="text-pink-600 font-bold inline-flex items-center gap-1"><N20Amount value={5} size={14} /> offerts</span> dans ta tirelire
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-700">Utilise tes économies</h4>
                <p className="text-sm text-slate-500">
                  Déduis ton solde de l'achat Premium (30€) ou Post-partum (10€)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-700">Deviens Marraine</h4>
                <p className="text-sm text-slate-500">
                  Une fois abonnée, tes parrainages alimentent ton solde cadeaux pour offrir à d'autres !
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction History */}
        {data?.transactions?.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <History className="w-5 h-5 text-slate-500" />
              Historique
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.transactions.map((tx, i) => (
                <div 
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    tx.amount > 0 ? 'bg-green-50' : 'bg-rose-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-700 text-sm">{tx.description}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-rose-600'}`}>
                    <N20Amount value={tx.amount} size={16} showSign={tx.amount > 0} valueClassName="font-bold" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA to referral */}
        <Card className="bg-gradient-to-r from-sky-100 to-pink-100 p-5 rounded-2xl text-center">
          <p className="text-slate-600 mb-3 inline-flex flex-wrap items-center gap-1">
            Invite tes amies et gagne <N20Amount value={5} size={14} /> par parrainage !
          </p>
          <Button
            onClick={() => navigate('/referral')}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full font-bold"
          >
            Parrainer une amie
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default TireliirePage;
