import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, X, Crown, Baby, Users, Lock, Gift, Heart, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// Composant pour section déroulante
function CollapsibleFAQ({ question, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-3 flex items-center justify-between text-left"
      >
        <h4 className="font-semibold text-slate-700 text-sm">{question}</h4>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-3 text-slate-600 text-sm animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function PricingPage() {
  const navigate = useNavigate();

  const featuresStandard = [
    { text: 'Calculateur de grossesse basique', included: true },
    { text: '5 scans de produits par semaine', included: true },
    { text: 'Conseils des 4 premières semaines', included: true },
    { text: 'Accès CAF/Ameli/Mairie', included: true },
    { text: 'Calendrier de fertilité', included: true },
    { text: '41 semaines de conseils complets', included: false },
    { text: 'Images évolution embryon', included: false },
    { text: 'Scanner illimité', included: false },
    { text: 'Check-list sac de maternité', included: false },
    { text: 'Démarches administratives', included: false },
    { text: 'Notifications email', included: false },
    { text: 'Historique complet', included: false },
    { text: 'Support prioritaire', included: false }
  ];
  
  const featuresPremium = [
    { text: 'Calculateur de grossesse complet', included: true },
    { text: 'Scanner ILLIMITÉ de produits', included: true },
    { text: '41 semaines de conseils complets', included: true },
    { text: 'Accès CAF/Ameli/Mairie', included: true },
    { text: '6 images évolution embryon/fœtus', included: true },
    { text: 'Calendrier de fertilité détaillé', included: true },
    { text: 'Check-list sac de maternité', included: true },
    { text: 'Démarches administratives détaillées', included: true },
    { text: 'Notifications email automatiques', included: true },
    { text: 'Historique complet recherches', included: true },
    { text: 'Sans publicité', included: true },
    { text: 'Support prioritaire', included: true }
  ];

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <PageHeader title="Abonnements" />
        </div>

        {/* Hero Premium - Plus compact */}
        <Card className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-5 text-center border-0">
          <Crown className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>MamanDouce Premium</h2>
          <p className="text-sm text-slate-600 mb-3">Accompagnement complet pendant 9 mois</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-sky-600">27€</span>
            <span className="text-lg text-slate-500">/9 mois</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">soit seulement 3€/mois</p>
          <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mt-2">
            Sans renouvellement automatique
          </div>
        </Card>

        {/* Comparatif - Plus compact */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Standard (Gratuit) */}
          <Card className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Standard</h3>
              <div className="text-2xl font-bold text-slate-600">Gratuit</div>
              <p className="text-xs text-slate-500">Pour découvrir l'app</p>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              {featuresStandard.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? 'text-slate-700' : 'text-slate-400 text-xs'}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/auth')}
              data-testid="free-button"
              className="w-full bg-slate-100 text-slate-700 rounded-full py-2 text-sm font-bold hover:bg-slate-200"
            >
              Commencer gratuitement
            </Button>
          </Card>

          {/* Premium */}
          <Card className="bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl p-5 shadow-lg border-2 border-amber-400 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-4 py-0.5 rounded-full text-xs font-bold">
              RECOMMANDÉ
            </div>
            <div className="text-center mb-4 mt-2">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Premium</h3>
              <div className="text-3xl font-bold text-white">27€</div>
              <p className="text-xs text-sky-100">/9 mois (3€/mois)</p>
            </div>
            <ul className="space-y-2 mb-4 text-sm">
              {featuresPremium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">{feature.text}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/subscription/checkout')}
              data-testid="premium-button"
              className="w-full bg-white text-sky-600 rounded-full py-2.5 font-bold text-sm shadow-md hover:shadow-lg"
            >
              S'abonner maintenant
            </Button>
          </Card>
        </div>

        {/* Option Post-partum - Plus compact */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Suivi Post-partum
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                6 mois d'accompagnement après l'accouchement
              </p>
              
              <div className="bg-white rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-rose-600">8€</span>
                    <span className="text-xs text-slate-500">paiement unique</span>
                  </div>
                  <Button
                    onClick={() => navigate('/subscription/checkout?product=postpartum')}
                    data-testid="buy-postpartum-button"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-4 py-2 text-xs font-bold"
                  >
                    Acheter
                  </Button>
                </div>
              </div>
              
              {/* Parrainage - Plus compact */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-800 text-sm">Ou GRATUIT avec parrainage !</span>
                </div>
                <p className="text-purple-700 text-xs">
                  Parrainez 2 amies et le post-partum est offert
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Garanties - Plus compact, en ligne */}
        <Card className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-700 mb-3 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>Pourquoi choisir Premium ?</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-xs mb-0.5">Satisfait ou remboursé</h4>
              <p className="text-[10px] text-slate-500">30 jours</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-xs mb-0.5">Paiement sécurisé</h4>
              <p className="text-[10px] text-slate-500">Via Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-xs mb-0.5">Remboursement</h4>
              <p className="text-[10px] text-slate-500">Fausse couche</p>
            </div>
          </div>
        </Card>

        {/* FAQ - Avec menus déroulants */}
        <Card className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Questions fréquentes</h3>
          <div className="space-y-0">
            <CollapsibleFAQ question="Quelle est la différence entre Standard et Premium ?">
              En Standard, vous avez accès aux conseils des 4 premières semaines et à 5 scans par semaine. 
              En Premium, vous débloquez les 41 semaines de conseils, le scanner illimité et toutes les fonctionnalités avancées.
            </CollapsibleFAQ>
            
            <CollapsibleFAQ question="Comment fonctionne le paiement ?">
              Paiement sécurisé unique de 27€ pour 9 mois d'accès complet. Sans renouvellement automatique.
            </CollapsibleFAQ>
            
            <CollapsibleFAQ question="Que se passe-t-il après les 9 mois ?">
              Votre compte reste actif en version Standard. Si vous avez acheté le post-partum, vous gardez l'accès pendant 6 mois après l'accouchement.
            </CollapsibleFAQ>
            
            <CollapsibleFAQ question="Comment accéder au suivi post-partum ?">
              Vous pouvez acheter l'option (8€) à tout moment. Le contenu sera débloqué après avoir confirmé votre accouchement 
              via l'icône bébé dans Profil → Informations de grossesse.
            </CollapsibleFAQ>
            
            <CollapsibleFAQ question="Puis-je être remboursée en cas de fausse couche ?">
              Oui, nous comprenons cette situation difficile. Envoyez une attestation médicale via les paramètres et nous vous remboursons au prorata des mois restants.
            </CollapsibleFAQ>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PricingPage;
