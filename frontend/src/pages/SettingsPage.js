import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Bell, Mail, BookOpen, Calendar, Check, Gift, Crown, Sparkles, Users, Send, Lock, Baby, Heart, Upload, FileText } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_tips: true,
    appointment_reminders: true,
    email_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  
  // Referral states
  const [referral1Email, setReferral1Email] = useState('');
  const [referral1Name, setReferral1Name] = useState('');
  const [referral2Email, setReferral2Email] = useState('');
  const [referral2Name, setReferral2Name] = useState('');
  const [referralStatus, setReferralStatus] = useState(null);
  const [submittingReferral, setSubmittingReferral] = useState(false);
  
  // Subscription full status
  const [fullStatus, setFullStatus] = useState(null);
  
  // Refund form
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundDocument, setRefundDocument] = useState(null);
  const [refundDetails, setRefundDetails] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadSubscriptionStatus();
    loadReferralStatus();
    loadFullSubscriptionStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.preferences.get();
      setPreferences(response.data);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getStatus();
      setSubscriptionStatus(response.data.subscription_status || 'free');
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    }
  };
  
  const loadReferralStatus = async () => {
    try {
      const response = await api.referral.getStatus();
      setReferralStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement parrainages:', error);
    }
  };
  
  const loadFullSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getFullStatus();
      setFullStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut complet:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.preferences.update(preferences);
      toast.success('Préférences enregistrées!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Veuillez entrer un code');
      return;
    }
    
    setRedeemingCode(true);
    try {
      const response = await api.subscription.redeemCode(promoCode);
      toast.success(response.data.message);
      setSubscriptionStatus('premium');
      setPromoCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
    } finally {
      setRedeemingCode(false);
    }
  };
  
  const handleSubmitReferral = async () => {
    if (!referral1Email.trim() || !referral1Name.trim()) {
      toast.error('Veuillez remplir au moins le premier parrainage');
      return;
    }
    
    setSubmittingReferral(true);
    try {
      await api.referral.submit({
        referral1_email: referral1Email,
        referral1_name: referral1Name,
        referral2_email: referral2Email || null,
        referral2_name: referral2Name || null
      });
      toast.success('Parrainages enregistrés !');
      setReferral1Email('');
      setReferral1Name('');
      setReferral2Email('');
      setReferral2Name('');
      loadReferralStatus();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setSubmittingReferral(false);
    }
  };
  
  const handleRefundRequest = async () => {
    if (!refundDocument) {
      toast.error('Veuillez joindre un document justificatif (attestation médicale)');
      return;
    }
    
    setSubmittingRefund(true);
    try {
      const formData = new FormData();
      formData.append('reason', 'miscarriage');
      formData.append('details', refundDetails || 'Demande de remboursement suite à une fausse couche');
      formData.append('document', refundDocument);
      
      const response = await api.postpartum.requestRefundWithDoc(formData);
      toast.success(response.data.message);
      setShowRefundForm(false);
      setRefundDocument(null);
      setRefundDetails('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la demande');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Paramètres" />

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : (
          <>
            {/* Section Code Promo */}
            <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
              subscriptionStatus === 'premium' 
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' 
                : 'bg-white border-slate-100'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  subscriptionStatus === 'premium'
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-br from-pink-500 to-pink-400'
                }`}>
                  {subscriptionStatus === 'premium' ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    <Gift className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {subscriptionStatus === 'premium' ? 'Premium activé' : 'Code promo'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {subscriptionStatus === 'premium' 
                      ? 'Vous bénéficiez de l\'accès premium !' 
                      : 'Entrez votre code pour activer le premium'}
                  </p>
                </div>
              </div>

              {subscriptionStatus === 'premium' ? (
                <div className="flex items-center gap-2 p-4 bg-amber-100 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-semibold">Merci d'être abonnée !</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="BETA-XXXXX"
                    className="flex-1 rounded-xl border-slate-200 uppercase"
                    data-testid="promo-code-input"
                  />
                  <Button
                    onClick={handleRedeemCode}
                    disabled={redeemingCode}
                    data-testid="redeem-code-button"
                    className="bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl px-6 font-semibold"
                  >
                    {redeemingCode ? '...' : 'Activer'}
                  </Button>
                </div>
              )}
            </Card>
            
            {/* Section Parrainage */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Parrainage
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Parrainez 2 amies et obtenez le suivi post-partum gratuit !
                  </p>
                </div>
              </div>
              
              {/* Statut actuel */}
              {referralStatus && (
                <div className="mb-4 p-4 bg-white/60 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600">Parrainages complétés</span>
                    <span className="text-lg font-bold text-purple-600">
                      {referralStatus.completed_count}/2
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${(referralStatus.completed_count / 2) * 100}%` }}
                    />
                  </div>
                  {referralStatus.postpartum_unlocked && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Suivi post-partum débloqué !</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Liste des parrainages existants */}
              {referralStatus?.referrals?.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-600">Vos parrainages :</p>
                  {referralStatus.referrals.map((ref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-700">{ref.referral_name}</p>
                        <p className="text-xs text-slate-500">{ref.referral_email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ref.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ref.status === 'completed' ? 'Inscrit(e)' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Formulaire de parrainage */}
              {(!referralStatus?.postpartum_unlocked) && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Ajoutez les coordonnées de vos filleules :</p>
                  
                  {/* Parrainage 1 */}
                  <div className="p-4 bg-white/60 rounded-2xl space-y-3">
                    <p className="text-sm font-semibold text-purple-600">Filleule 1</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={referral1Name}
                        onChange={(e) => setReferral1Name(e.target.value)}
                        placeholder="Prénom"
                        className="rounded-xl border-purple-200"
                        data-testid="referral1-name"
                      />
                      <Input
                        value={referral1Email}
                        onChange={(e) => setReferral1Email(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="rounded-xl border-purple-200"
                        data-testid="referral1-email"
                      />
                    </div>
                  </div>
                  
                  {/* Parrainage 2 */}
                  <div className="p-4 bg-white/60 rounded-2xl space-y-3">
                    <p className="text-sm font-semibold text-purple-600">Filleule 2</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={referral2Name}
                        onChange={(e) => setReferral2Name(e.target.value)}
                        placeholder="Prénom"
                        className="rounded-xl border-purple-200"
                        data-testid="referral2-name"
                      />
                      <Input
                        value={referral2Email}
                        onChange={(e) => setReferral2Email(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="rounded-xl border-purple-200"
                        data-testid="referral2-email"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSubmitReferral}
                    disabled={submittingReferral}
                    data-testid="submit-referral-button"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submittingReferral ? 'Envoi...' : 'Enregistrer mes parrainages'}
                  </Button>
                </div>
              )}
            </Card>
            
            {/* Section Post-partum (si éligible) */}
            {fullStatus && subscriptionStatus === 'premium' && (
              <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
                fullStatus.postpartum_unlocked
                  ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200'
                  : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    fullStatus.postpartum_unlocked
                      ? 'bg-gradient-to-br from-rose-500 to-pink-500'
                      : 'bg-gradient-to-br from-slate-400 to-slate-300'
                  }`}>
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Suivi Post-partum
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {fullStatus.postpartum_unlocked 
                        ? 'Accès activé !' 
                        : `Accessible après 6 mois d'abonnement`}
                    </p>
                  </div>
                </div>
                
                {fullStatus.postpartum_unlocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-4 bg-rose-100 rounded-2xl">
                      <Check className="w-5 h-5 text-rose-600" />
                      <p className="text-rose-800 font-semibold">
                        {fullStatus.postpartum_free_via_referral 
                          ? 'Offert grâce à vos parrainages !' 
                          : 'Suivi post-partum activé !'}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/postpartum')}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
                    >
                      Accéder au suivi post-partum
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Mois d'abonnement</span>
                        <span className="font-bold text-slate-700">{fullStatus.months_subscribed}/6</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((fullStatus.months_subscribed / 6) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {fullStatus.postpartum_eligible ? (
                      <Button
                        onClick={() => navigate('/subscription/checkout?product=postpartum')}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
                      >
                        Acheter le suivi post-partum (8€)
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl text-amber-700">
                        <Lock className="w-5 h-5" />
                        <p className="text-sm">
                          Encore {6 - fullStatus.months_subscribed} mois avant de pouvoir acheter cette option
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-center text-slate-500">
                      Ou parrainez 2 amies pour l'obtenir gratuitement !
                    </p>
                  </div>
                )}
              </Card>
            )}
            
            {/* Section Remboursement - Fausse couche */}
            {subscriptionStatus === 'premium' && (
              <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-300 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Situation difficile ?
                    </h2>
                    <p className="text-slate-500 text-sm">
                      En cas de fausse couche, vous pouvez demander un remboursement
                    </p>
                  </div>
                </div>
                
                {!showRefundForm ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4">
                      Si vous traversez une épreuve difficile (fausse couche), sachez que nous sommes là pour vous. 
                      Vous pouvez demander un remboursement au prorata des mois restants sur présentation d'une attestation médicale.
                    </p>
                    
                    <Button
                      onClick={() => setShowRefundForm(true)}
                      data-testid="show-refund-form-button"
                      className="w-full bg-slate-100 text-slate-700 rounded-full py-3 hover:bg-slate-200"
                    >
                      Demander un remboursement
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Pour traiter votre demande, veuillez joindre une attestation médicale (certificat médical, compte-rendu d'hospitalisation, etc.)
                    </p>
                    
                    {/* Upload zone */}
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
                      {refundDocument ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-8 h-8 text-green-500" />
                          <div className="text-left">
                            <p className="font-semibold text-slate-700">{refundDocument.name}</p>
                            <p className="text-xs text-slate-500">{(refundDocument.size / 1024).toFixed(1)} Ko</p>
                          </div>
                          <Button
                            onClick={() => setRefundDocument(null)}
                            className="bg-red-100 text-red-600 rounded-full px-3 py-1 text-sm"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600 font-semibold">Cliquez pour sélectionner un fichier</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG (max 5 Mo)</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            data-testid="refund-document-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('Fichier trop volumineux (max 5 Mo)');
                                  return;
                                }
                                setRefundDocument(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    
                    {/* Optional details */}
                    <div>
                      <label className="text-sm font-semibold text-slate-600 block mb-1">
                        Informations complémentaires (optionnel)
                      </label>
                      <textarea
                        value={refundDetails}
                        onChange={(e) => setRefundDetails(e.target.value)}
                        placeholder="Ajoutez des détails si nécessaire..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none"
                        rows={3}
                        data-testid="refund-details-input"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundDocument(null);
                          setRefundDetails('');
                        }}
                        className="flex-1 bg-slate-100 text-slate-600 rounded-full py-3"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleRefundRequest}
                        disabled={submittingRefund || !refundDocument}
                        data-testid="submit-refund-button"
                        className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 disabled:opacity-50"
                      >
                        {submittingRefund ? 'Envoi...' : 'Envoyer ma demande'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Notifications par email</h2>
                  <p className="text-slate-500">Gérez vos préférences de notifications</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-slate-600 font-semibold">Adresse email</Label>
                  <Input
                    id="email"
                    data-testid="email-address-input"
                    type="email"
                    value={preferences.email_address}
                    onChange={(e) => setPreferences({ ...preferences, email_address: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  {/* Notifications générales */}
                  <div
                    onClick={() => handleToggle('email_notifications')}
                    data-testid="toggle-email-notifications"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-sky-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Notifications par email</p>
                        <p className="text-sm text-slate-500">Recevoir des emails de rappel</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.email_notifications ? 'bg-sky-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.email_notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Conseils hebdomadaires */}
                  <div
                    onClick={() => handleToggle('weekly_tips')}
                    data-testid="toggle-weekly-tips"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Conseils hebdomadaires</p>
                        <p className="text-sm text-slate-500">Recevoir les conseils chaque semaine</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.weekly_tips ? 'bg-teal-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.weekly_tips ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Rappels rendez-vous */}
                  <div
                    onClick={() => handleToggle('appointment_reminders')}
                    data-testid="toggle-appointment-reminders"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Rappels de rendez-vous</p>
                        <p className="text-sm text-slate-500">Rappels pour vos rdv médicaux</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.appointment_reminders ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.appointment_reminders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                data-testid="save-preferences-button"
                disabled={saving}
                className="w-full mt-6 bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-3xl p-6 border-0">
              <h4 className="font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <Mail className="inline w-5 h-5 mr-2" />
                À propos des notifications email
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Les emails sont envoyés automatiquement selon vos préférences</li>
                <li>• Vous recevrez un conseil hebdomadaire adapté à votre semaine de grossesse</li>
                <li>• Les rappels de rendez-vous sont envoyés la veille</li>
                <li>• Vous pouvez désactiver les notifications à tout moment</li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
