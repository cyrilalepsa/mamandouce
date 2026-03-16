import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Heart, AlertTriangle, Baby, Droplets,
  Shield, Stethoscope, Info, CalendarDays, Check, Lock, Gift, Crown, Sparkles, Utensils, HandHeart, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

// Import refactored components
import {
  AppointmentsSection,
  DifficultiesSection,
  BreastfeedingSection,
  FormulaSection,
  DiapersSection,
  BabywearingSection,
  DiversificationSection,
  RecipesSection,
  PrecautionsSection
} from '../components/postpartum';

export default function PostpartumPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    appointments: false,
    difficulties: false,
    breastfeeding: false,
    formula: false,
    diapers: false,
    babywearing: false,
    diversification: false,
    recipes: false,
    precautions: false
  });
  
  // Postpartum status
  const [postpartumStatus, setPostpartumStatus] = useState(null);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [savingBirthDate, setSavingBirthDate] = useState(false);
  
  // Favorites
  const [favorites, setFavorites] = useState([]);
  
  // Full subscription status
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    loadContent();
    loadPostpartumStatus();
    loadSubscriptionStatus();
    loadFavorites();
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

  const loadFavorites = async () => {
    try {
      const response = await api.postpartum.getFavorites();
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getColorClasses = (color) => {
    const colors = {
      pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
      sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600' }
    };
    return colors[color] || colors.pink;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const sections = [
    { id: 'appointments', label: 'RDV post-partum', icon: Calendar, color: 'pink' },
    { id: 'difficulties', label: 'Difficultés courantes', icon: AlertTriangle, color: 'amber' },
    { id: 'breastfeeding', label: 'Allaitement maternel', icon: Heart, color: 'rose' },
    { id: 'formula', label: 'Biberon & préparation', icon: Baby, color: 'sky' },
    { id: 'diapers', label: 'Couches & change', icon: Droplets, color: 'cyan' },
    { id: 'babywearing', label: 'Portage bébé', icon: HandHeart, color: 'violet' },
    { id: 'diversification', label: 'Diversification alimentaire', icon: Utensils, color: 'orange' },
    { id: 'recipes', label: 'Recettes pour bébé', icon: Sparkles, color: 'emerald', badge: content?.recipes?.length || 0 },
    { id: 'precautions', label: 'Précautions & sécurité', icon: Shield, color: 'slate' },
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
                  <span>40+ recettes pour bébé</span>
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

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const colorClasses = getColorClasses(section.color);
            const isExpanded = expandedSections[section.id];
            
            return (
              <Card key={section.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  data-testid={`toggle-${section.id}`}
                >
                  <div className={`w-10 h-10 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-700">{section.label}</h3>
                      {section.badge && (
                        <span className={`px-2 py-0.5 ${colorClasses.bg} ${colorClasses.text} text-xs rounded-full font-medium`}>
                          {section.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isExpanded ? `${colorClasses.bg} ${colorClasses.text}` : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 pb-4 border-t border-slate-100">
                    {section.id === 'appointments' && (
                      <AppointmentsSection appointments={content?.appointments} />
                    )}
                    {section.id === 'difficulties' && (
                      <DifficultiesSection difficulties={content?.difficulties} />
                    )}
                    {section.id === 'breastfeeding' && (
                      <BreastfeedingSection breastfeeding={content?.breastfeeding} />
                    )}
                    {section.id === 'formula' && (
                      <FormulaSection formula={content?.formula} />
                    )}
                    {section.id === 'diapers' && (
                      <DiapersSection diapers={content?.diapers} />
                    )}
                    {section.id === 'babywearing' && (
                      <BabywearingSection babywearing={content?.babywearing} />
                    )}
                    {section.id === 'diversification' && (
                      <DiversificationSection diversification={content?.diversification} />
                    )}
                    {section.id === 'recipes' && (
                      <RecipesSection 
                        babyRecipes={content?.baby_recipes} 
                        favorites={favorites}
                        onFavoritesChange={setFavorites}
                      />
                    )}
                    {section.id === 'precautions' && (
                      <PrecautionsSection precautions={content?.precautions} />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
