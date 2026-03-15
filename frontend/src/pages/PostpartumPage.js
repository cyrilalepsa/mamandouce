import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Heart, AlertTriangle, Baby, 
  Shield, ChevronDown, ChevronUp, Stethoscope, Clock, Info, CalendarDays, Check, Lock, Gift, Crown, Sparkles,
  Play, ExternalLink, Utensils, HandHeart
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

export default function PostpartumPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('appointments');
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);
  
  // Postpartum status
  const [postpartumStatus, setPostpartumStatus] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [savingBirthDate, setSavingBirthDate] = useState(false);
  
  // Full subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    loadContent();
    loadPostpartumStatus();
    loadSubscriptionStatus();
    sendDueReminders();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.postpartum.getContent();
      setContent(response.data);
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPostpartumStatus = async () => {
    try {
      const response = await api.postpartum.getStatus();
      setPostpartumStatus(response.data);
      if (response.data.actual_birth_date) {
        setBirthDate(response.data.actual_birth_date.split('T')[0]);
      }
      if (response.data.baby_name) {
        setBabyName(response.data.baby_name);
      }
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    }
  };
  
  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.subscription.getFullStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Erreur statut abonnement:', error);
    }
  };
  
  const sendDueReminders = async () => {
    try {
      await api.postpartum.sendDueReminders();
    } catch (error) {
      // Silently fail
    }
  };
  
  const handleSaveBirthDate = async () => {
    if (!birthDate) {
      toast.error('Veuillez entrer la date d\'accouchement');
      return;
    }
    
    setSavingBirthDate(true);
    try {
      await api.postpartum.setBirthDate(birthDate, babyName);
      toast.success('Date d\'accouchement enregistrée ! Les rappels de RDV sont programmés.');
      loadPostpartumStatus();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingBirthDate(false);
    }
  };

  // Déterminer l'accès
  const hasPostpartumAccess = postpartumStatus?.postpartum_unlocked;
  const hasGivenBirth = postpartumStatus?.actual_birth_date;
  const canViewFullContent = hasPostpartumAccess && hasGivenBirth;

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const sections = [
    { id: 'appointments', label: 'RDV', icon: Calendar },
    { id: 'difficulties', label: 'Difficultés', icon: AlertTriangle },
    { id: 'breastfeeding', label: 'Allaitement', icon: Heart },
    { id: 'formula', label: 'Biberon', icon: Baby },
    { id: 'babywearing', label: 'Portage', icon: HandHeart },
    { id: 'diversification', label: 'Diversification', icon: Utensils },
    { id: 'recipes', label: 'Recettes', icon: Utensils },
    { id: 'precautions', label: 'Précautions', icon: Shield },
  ];

  // ==================== APERÇU POUR NON-ACHETEURS ====================
  if (!hasPostpartumAccess) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              className="bg-white rounded-full p-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Suivi post-partum
              </h1>
              <p className="text-sm text-slate-500">Les 6 premiers mois avec bébé</p>
            </div>
          </div>
          
          {/* Aperçu attractif */}
          <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-6 border border-rose-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Baby className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Accompagnement post-accouchement
              </h2>
              <p className="text-slate-600">
                6 mois de conseils personnalisés pour vous et votre bébé
              </p>
            </div>
            
            {/* Ce qui est inclus */}
            <div className="bg-white rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Ce qui vous attend
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>9 rendez-vous détaillés</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Guide allaitement complet</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Conseils lait infantile</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Guide des couches</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Baby blues & dépression</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Rappels automatiques</span>
                </div>
              </div>
            </div>
            
            {/* Aperçu des RDV */}
            <div className="bg-white rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-slate-700 mb-3">Aperçu des rendez-vous</h3>
              <div className="space-y-2">
                {content?.appointments?.slice(0, 3).map((apt, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      apt.type === 'obligatoire' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">{apt.title}</p>
                      <p className="text-xs text-slate-500">Semaine {apt.week}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      apt.type === 'obligatoire' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {apt.type}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-2">
                  <Lock className="w-4 h-4" />
                  <span>+ 6 autres rendez-vous détaillés...</span>
                </div>
              </div>
            </div>
            
            {/* Prix et options */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-5 text-center">
                <p className="text-sm opacity-90 mb-1">Accès complet</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">8€</span>
                  <span className="text-lg opacity-90">paiement unique</span>
                </div>
                <p className="text-sm opacity-80 mt-2">
                  Le contenu sera accessible après votre accouchement
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/subscription/checkout?product=postpartum')}
                data-testid="buy-postpartum-button"
                className="w-full bg-white text-rose-600 border-2 border-rose-500 rounded-full py-4 font-bold text-lg hover:bg-rose-50"
              >
                <Crown className="w-5 h-5 mr-2" />
                Acheter le suivi post-partum
              </Button>
              
              {/* Option parrainage */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">Ou obtenez-le gratuitement !</span>
                </div>
                <p className="text-sm text-purple-700">
                  Parrainez 2 amies qui s'inscrivent sur MamanDouce et le suivi post-partum vous est offert.
                </p>
                <Button
                  onClick={() => navigate('/settings')}
                  className="mt-3 bg-purple-100 text-purple-700 rounded-full px-4 py-2 text-sm font-semibold hover:bg-purple-200"
                >
                  Aller aux paramètres
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Rassurance */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Pourquoi ce suivi est important ?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Les premiers mois avec bébé sont intenses. Ce guide vous accompagne pas à pas avec des conseils 
              de professionnels de santé pour chaque étape : rendez-vous médicaux, allaitement, sommeil, 
              et bien-être émotionnel.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Check className="w-4 h-4 text-green-500" />
              <span>Contenu validé par des sages-femmes et pédiatres</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== ACCÈS ACHETÉ MAIS PAS ENCORE ACCOUCHÉ ====================
  if (hasPostpartumAccess && !hasGivenBirth) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              className="bg-white rounded-full p-2 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Suivi post-partum
              </h1>
              <p className="text-sm text-slate-500">Les 6 premiers mois avec bébé</p>
            </div>
          </div>
          
          {/* Statut */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-700">Accès post-partum activé !</h2>
                <p className="text-sm text-slate-500">
                  {postpartumStatus?.postpartum_free_via_referral 
                    ? 'Offert grâce à vos parrainages' 
                    : 'Votre achat a été confirmé'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-6 h-6 text-rose-500" />
                <h3 className="font-bold text-slate-700">Renseignez votre date d'accouchement</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Le contenu du suivi post-partum sera accessible une fois que vous aurez renseigné 
                votre date d'accouchement. Cela nous permet de vous envoyer les rappels au bon moment.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Date d'accouchement</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="rounded-xl border-green-200"
                    data-testid="birth-date-input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Prénom de bébé</label>
                  <Input
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Prénom"
                    className="rounded-xl border-green-200"
                    data-testid="baby-name-input"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSaveBirthDate}
                disabled={savingBirthDate}
                data-testid="confirm-birth-button"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
              >
                <Baby className="w-5 h-5 mr-2" />
                {savingBirthDate ? 'Enregistrement...' : 'J\'ai accouché - Accéder au contenu'}
              </Button>
            </div>
          </Card>
          
          {/* Aperçu de ce qui attend */}
          <Card className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-3">Ce qui vous attend</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Calendar className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">9 RDV</p>
                <p className="text-xs text-slate-500">détaillés</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl">
                <Heart className="w-6 h-6 text-sky-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">Allaitement</p>
                <p className="text-xs text-slate-500">& lait</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Shield className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">Conseils</p>
                <p className="text-xs text-slate-500">6 mois</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== CONTENU COMPLET (ACCÈS + ACCOUCHÉ) ====================
  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            className="bg-white rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Suivi post-partum
            </h1>
            <p className="text-sm text-slate-500">
              {babyName ? `${babyName} - ` : ''}Semaine {postpartumStatus?.current_postpartum_week || 0}
            </p>
          </div>
        </div>
        
        {/* Info bébé */}
        {postpartumStatus?.actual_birth_date && (
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-700">
                  {babyName || 'Bébé'} a {postpartumStatus?.days_since_birth || 0} jours
                </p>
                <p className="text-sm text-slate-500">
                  Né(e) le {new Date(postpartumStatus.actual_birth_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Ces informations sont données à titre indicatif et ne remplacent pas l'avis d'un professionnel de santé. 
              En cas de doute, consultez votre médecin ou sage-femme.
            </p>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                data-testid={`tab-${section.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </Button>
            );
          })}
        </div>

        {/* Content Sections */}
        {activeSection === 'appointments' && content?.appointments && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Rendez-vous sur 6 mois</h2>
            {content.appointments.map((apt, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    apt.type === 'obligatoire' 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-sky-100 text-sky-600'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-700">{apt.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        apt.type === 'obligatoire'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}>
                        {apt.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{apt.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Semaine {apt.week}
                      </span>
                      {apt.duration && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {apt.duration}
                        </span>
                      )}
                      {apt.who && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {apt.who}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  {apt.for_mom && apt.for_mom.length > 0 && (
                    <div className="bg-pink-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-pink-700 mb-2 flex items-center gap-1">
                        <Heart className="w-4 h-4" /> Pour maman
                      </h4>
                      <ul className="text-xs text-pink-800 space-y-1">
                        {apt.for_mom.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-pink-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {apt.for_baby && apt.for_baby.length > 0 && (
                    <div className="bg-sky-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-sky-700 mb-2 flex items-center gap-1">
                        <Baby className="w-4 h-4" /> Pour bébé
                      </h4>
                      <ul className="text-xs text-sky-800 space-y-1">
                        {apt.for_baby.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-sky-400 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {apt.vaccines && apt.vaccines.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-3">
                      <h4 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                        <Shield className="w-4 h-4" /> Vaccins
                      </h4>
                      {apt.vaccines.map((vax, i) => (
                        <div key={i} className="text-xs mb-1">
                          <span className="font-semibold text-green-800">{vax.name}</span>
                          <p className="text-green-600">{vax.protects}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {apt.tips && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100">
                      <p className="text-xs text-slate-700">
                        <span className="font-bold text-pink-600">💡 Conseil :</span> {apt.tips}
                      </p>
                    </div>
                  )}
                  
                  {apt.reimbursement && (
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      💰 {apt.reimbursement}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeSection === 'difficulties' && content?.difficulties && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-700">Difficultés post-partum</h2>
            {content.difficulties.map((diff, index) => (
              <Card key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div
                  onClick={() => setExpandedDifficulty(expandedDifficulty === index ? null : index)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-700">{diff.title}</h3>
                  </div>
                  {expandedDifficulty === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                {expandedDifficulty === index && (
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-sm text-slate-600">{diff.description}</p>
                    {diff.symptoms && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <h4 className="text-sm font-bold text-amber-700 mb-2">Symptômes</h4>
                        <ul className="text-xs text-amber-800 space-y-1">
                          {diff.symptoms.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {diff.when_to_consult && (
                      <div className="bg-red-50 rounded-xl p-3">
                        <h4 className="text-sm font-bold text-red-700 mb-2">Quand consulter ?</h4>
                        <ul className="text-xs text-red-800 space-y-1">
                          {diff.when_to_consult.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {diff.tips && (
                      <div className="bg-green-50 rounded-xl p-3">
                        <h4 className="text-sm font-bold text-green-700 mb-2">Conseils</h4>
                        <ul className="text-xs text-green-800 space-y-1">
                          {diff.tips.map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeSection === 'breastfeeding' && content?.breastfeeding && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Guide de l'allaitement</h2>
            {content.breastfeeding.sections?.map((section, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-2">{section.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{section.content}</p>
                {section.tips && (
                  <ul className="text-xs text-slate-600 space-y-1">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-pink-500">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeSection === 'formula' && content?.formula && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Lait infantile</h2>
            {content.formula.sections?.map((section, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-2">{section.title}</h3>
                <p className="text-sm text-slate-600">{section.content}</p>
              </Card>
            ))}
          </div>
        )}

        {/* SECTION PORTAGE BÉBÉ */}
        {activeSection === 'babywearing' && content?.babywearing && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">{content.babywearing.title}</h2>
            <p className="text-sm text-slate-600">{content.babywearing.description}</p>
            
            {/* Bénéfices */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-3">Bienfaits du portage</h3>
              <div className="grid grid-cols-2 gap-2">
                {content.babywearing.benefits?.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Types de portage */}
            <h3 className="font-bold text-slate-700">Types de porte-bébé</h3>
            {content.babywearing.types?.map((type, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-700">{type.name}</h4>
                  <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {type.age}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{type.description}</p>
                {type.video_url && (
                  <a 
                    href={type.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Voir le tutoriel vidéo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </Card>
            ))}
            
            {/* Règles de sécurité */}
            <Card className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Règles de sécurité
              </h3>
              <ul className="space-y-2">
                {content.babywearing.safety_rules?.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Vidéo générale */}
            {content.babywearing.video_general && (
              <a 
                href={content.babywearing.video_general} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
              >
                <Play className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Voir la vidéo complète sur le portage</p>
              </a>
            )}
          </div>
        )}

        {/* SECTION DIVERSIFICATION */}
        {activeSection === 'diversification' && content?.diversification && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">{content.diversification.title}</h2>
            <p className="text-sm text-slate-600">{content.diversification.description}</p>
            
            {/* Quand commencer */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm border border-green-200">
              <h3 className="font-bold text-green-800 mb-3">Quand commencer ?</h3>
              <p className="text-sm text-green-700 mb-2">{content.diversification.when_to_start?.age}</p>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Signes que bébé est prêt :</h4>
              <ul className="space-y-1">
                {content.diversification.when_to_start?.signs?.map((sign, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Étapes */}
            <h3 className="font-bold text-slate-700">Les étapes de la diversification</h3>
            {content.diversification.stages?.map((stage, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-700">{stage.title}</h4>
                  <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {stage.age}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-slate-600"><strong>Aliments :</strong> {stage.foods?.join(', ')}</p>
                  <p className="text-sm text-slate-600"><strong>Texture :</strong> {stage.texture}</p>
                  <p className="text-sm text-slate-600"><strong>Quantité :</strong> {stage.quantity}</p>
                  <p className="text-sm text-pink-600 bg-pink-50 p-2 rounded-lg">💡 {stage.tips}</p>
                </div>
                {stage.video_url && (
                  <a 
                    href={stage.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Vidéo explicative
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </Card>
            ))}
            
            {/* Aliments interdits */}
            <Card className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Aliments à éviter
              </h3>
              <div className="space-y-2">
                {content.diversification.forbidden_foods?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2">
                    <span className="font-semibold text-red-800">{item.food}</span>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      Avant {item.until}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Premiers aliments */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-orange-50 rounded-2xl p-4">
                <h4 className="font-bold text-orange-800 mb-2">Premiers légumes</h4>
                <div className="flex flex-wrap gap-1">
                  {content.diversification.first_vegetables?.map((veg, i) => (
                    <span key={i} className="bg-white text-orange-700 px-2 py-1 rounded-full text-xs">
                      {veg}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="bg-pink-50 rounded-2xl p-4">
                <h4 className="font-bold text-pink-800 mb-2">Premiers fruits</h4>
                <div className="flex flex-wrap gap-1">
                  {content.diversification.first_fruits?.map((fruit, i) => (
                    <span key={i} className="bg-white text-pink-700 px-2 py-1 rounded-full text-xs">
                      {fruit}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Vidéo générale */}
            {content.diversification.video_general && (
              <a 
                href={content.diversification.video_general} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
              >
                <Play className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Guide complet de la diversification</p>
              </a>
            )}
          </div>
        )}

        {/* SECTION RECETTES */}
        {activeSection === 'recipes' && content?.baby_recipes && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">{content.baby_recipes.title}</h2>
            <p className="text-sm text-slate-600">{content.baby_recipes.description}</p>
            
            {/* Conseils cuisine */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-3">Conseils pour cuisiner</h3>
              <ul className="space-y-2">
                {content.baby_recipes.tips_cooking?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Recettes */}
            <h3 className="font-bold text-slate-700">Nos recettes</h3>
            {content.baby_recipes.recipes?.map((recipe, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-700">{recipe.name}</h4>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                    {recipe.age}
                  </span>
                </div>
                
                {/* Ingrédients */}
                <div className="bg-slate-50 rounded-xl p-3 mb-3">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">Ingrédients</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {recipe.ingredients?.map((ing, i) => (
                      <li key={i}>• {ing}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Étapes */}
                <div className="bg-green-50 rounded-xl p-3 mb-3">
                  <h5 className="text-sm font-semibold text-green-800 mb-2">Préparation</h5>
                  <ol className="text-sm text-green-700 space-y-1">
                    {recipe.steps?.map((step, i) => (
                      <li key={i}>{i + 1}. {step}</li>
                    ))}
                  </ol>
                </div>
                
                {/* Conseil */}
                {recipe.tips && (
                  <p className="text-sm text-pink-600 bg-pink-50 p-2 rounded-lg mb-3">
                    💡 {recipe.tips}
                  </p>
                )}
                
                {/* Vidéo */}
                {recipe.video_url && (
                  <a 
                    href={recipe.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Voir la recette en vidéo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </Card>
            ))}
            
            {/* Vidéo générale */}
            {content.baby_recipes.video_general && (
              <a 
                href={content.baby_recipes.video_general} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity"
              >
                <Play className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">Plus de recettes en vidéo</p>
              </a>
            )}
          </div>
        )}

        {activeSection === 'precautions' && content?.precautions && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700">Précautions générales</h2>
            {content.precautions.map((precaution, index) => (
              <Card key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-2">{precaution.title}</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  {precaution.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
