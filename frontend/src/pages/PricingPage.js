import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, X, Crown, Baby, Users, Lock, Gift, Heart, HelpCircle, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';

// Modal FAQ
function FAQModal({ isOpen, onClose }) {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    {
      question: "Quelle est la différence entre Standard et Premium ?",
      answer: "En Standard, vous avez accès aux conseils des 4 premières semaines et à 5 scans par semaine. En Premium, vous débloquez les 41 semaines de conseils, le scanner illimité et toutes les fonctionnalités avancées."
    },
    {
      question: "Comment fonctionne le paiement ?",
      answer: "Paiement sécurisé unique de 27€ pour 9 mois d'accès complet. Sans renouvellement automatique."
    },
    {
      question: "Que se passe-t-il après les 9 mois ?",
      answer: "Votre compte reste actif en version Standard. Si vous avez acheté le post-partum, vous gardez l'accès pendant 6 mois après l'accouchement."
    },
    {
      question: "Comment accéder au suivi post-partum ?",
      answer: "Vous pouvez acheter l'option (8€) à tout moment. Le contenu sera débloqué après avoir confirmé votre accouchement via l'icône bébé dans Profil → Informations de grossesse."
    },
    {
      question: "Puis-je être remboursée en cas de fausse couche ?",
      answer: "Oui, nous comprenons cette situation difficile. Envoyez une attestation médicale via les paramètres et nous vous remboursons au prorata des mois restants."
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-700">Questions fréquentes</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="font-medium text-slate-700 pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white border-t border-slate-200 text-slate-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingPage() {
  const navigate = useNavigate();
  const [showFAQ, setShowFAQ] = useState(false);

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

        {/* Hero Premium - Taille augmentée */}
        <Card className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-6 text-center border-0">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>MamanDouce Premium</h2>
          <p className="text-base text-slate-600 mb-3">Accompagnement complet pendant 9 mois</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-bold text-sky-600">27€</span>
            <span className="text-xl text-slate-500">/9 mois</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">soit seulement 3€/mois</p>
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mt-3">
            Sans renouvellement automatique
          </div>
        </Card>

        {/* Comparatif - Texte agrandi */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Standard (Gratuit) */}
          <Card className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Standard</h3>
              <div className="text-3xl font-bold text-slate-600">Gratuit</div>
              <p className="text-sm text-slate-500">Pour découvrir l'app</p>
            </div>
            <ul className="space-y-2.5 mb-4">
              {featuresStandard.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/auth')}
              data-testid="free-button"
              className="w-full bg-slate-100 text-slate-700 rounded-full py-2.5 font-bold hover:bg-slate-200"
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
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>Premium</h3>
              <div className="text-4xl font-bold text-white">27€</div>
              <p className="text-sm text-sky-100">/9 mois (3€/mois)</p>
            </div>
            <ul className="space-y-2.5 mb-4">
              {featuresPremium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white">{feature.text}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/subscription/checkout')}
              data-testid="premium-button"
              className="w-full bg-white text-sky-600 rounded-full py-3 font-bold shadow-md hover:shadow-lg"
            >
              S'abonner maintenant
            </Button>
          </Card>
        </div>

        {/* Option Post-partum - Plus lisible */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Suivi Post-partum
              </h3>
              <p className="text-slate-600 mb-3">
                6 mois d'accompagnement après l'accouchement
              </p>
              
              <div className="bg-white rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-rose-600">8€</span>
                    <span className="text-sm text-slate-500">paiement unique</span>
                  </div>
                  <Button
                    onClick={() => navigate('/subscription/checkout?product=postpartum')}
                    data-testid="buy-postpartum-button"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full px-5 py-2 font-bold"
                  >
                    Acheter
                  </Button>
                </div>
              </div>
              
              {/* Parrainage */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">Ou GRATUIT avec parrainage !</span>
                </div>
                <p className="text-purple-700 text-sm">
                  Parrainez 2 amies et le post-partum est offert
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Garanties */}
        <Card className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-700 mb-4 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>Pourquoi choisir Premium ?</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">Satisfait ou remboursé</h4>
              <p className="text-xs text-slate-500">30 jours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">Paiement sécurisé</h4>
              <p className="text-xs text-slate-500">Via Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">Remboursement</h4>
              <p className="text-xs text-slate-500">Fausse couche</p>
            </div>
          </div>
        </Card>

        {/* Bouton FAQ flottant */}
        <button
          onClick={() => setShowFAQ(true)}
          data-testid="faq-button"
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
        >
          <HelpCircle className="w-7 h-7" />
        </button>
        
        {/* Modal FAQ */}
        <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
      </div>
    </div>
  );
}

export default PricingPage;
