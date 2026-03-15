import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, X, Crown, Baby, Users, Lock, Gift, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';

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
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <PageHeader title="Abonnements" />
          <div className="flex-1 text-right">
            <p className="text-slate-500">Accompagnement complet pour votre grossesse</p>
          </div>
        </div>

        {/* Hero Premium */}
        <Card className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-3xl p-8 text-center border-0">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>MamanDouce Premium</h2>
          <p className="text-xl text-slate-600 mb-4">Accompagnement complet pendant 9 mois de grossesse</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-sky-600">27€</span>
            <div className="text-left">
              <span className="text-2xl text-slate-500 block">/9 mois</span>
            </div>
          </div>
          <p className="text-slate-500 mt-2">soit seulement 3€/mois</p>
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mt-4">
            Sans renouvellement automatique
          </div>
        </Card>

        {/* Comparatif */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Standard (Gratuit) */}
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Standard</h3>
              <div className="text-4xl font-bold text-slate-600 mb-2">Gratuit</div>
              <p className="text-slate-500">Pour découvrir l'application</p>
            </div>
            <ul className="space-y-3 mb-6">
              {featuresStandard.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                    {feature.text}
                    {feature.text.includes('4 premières semaines') && (
                      <span className="text-xs text-slate-400 block">Semaines 1 à 4 uniquement</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/auth')}
              data-testid="free-button"
              className="w-full bg-slate-100 text-slate-700 rounded-full py-3 font-bold hover:bg-slate-200"
            >
              Commencer gratuitement
            </Button>
          </Card>

          {/* Premium */}
          <Card className="bg-gradient-to-br from-sky-400 to-sky-300 rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.15)] border-4 border-amber-400 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-6 py-1 rounded-full text-sm font-bold">
              RECOMMANDÉ
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Premium</h3>
              <div className="text-5xl font-bold text-white mb-2">27€</div>
              <p className="text-sky-100">/9 mois (3€/mois)</p>
              <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mt-2">
                Sans renouvellement auto
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {featuresPremium.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{feature.text}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate('/subscription/checkout')}
              data-testid="premium-button"
              className="w-full bg-white text-sky-600 rounded-full py-4 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              S'abonner maintenant
            </Button>
          </Card>
        </div>

        {/* Option Post-partum */}
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border border-rose-200">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Baby className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Suivi Post-partum
              </h3>
              <p className="text-slate-600 mb-4">
                6 mois d'accompagnement après l'accouchement avec conseils détaillés, rendez-vous médicaux, 
                guide allaitement, lait infantile, couches et précautions à prendre.
              </p>
              
              <div className="bg-white rounded-2xl p-4 mb-4">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-rose-600">8€</span>
                    <span className="text-slate-500">paiement unique</span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Achat possible à tout moment
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600 font-semibold">
                    Comment débloquer le contenu ?
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-500 ml-2">
                    <li>Achetez l'option post-partum quand vous le souhaitez</li>
                    <li>Après l'accouchement, allez dans <strong>Profil → Informations de grossesse</strong></li>
                    <li>Cliquez sur l'icône bébé pour confirmer votre accouchement</li>
                    <li>Votre abonnement Premium prend fin et le contenu se débloque !</li>
                  </ol>
                </div>
              </div>
              
              {/* Parrainage */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Gift className="w-6 h-6 text-purple-600" />
                  <h4 className="font-bold text-purple-800">Ou obtenez-le GRATUITEMENT !</h4>
                </div>
                <p className="text-purple-700 text-sm mb-3">
                  <strong>Parrainez 2 amies</strong> qui s'inscrivent sur MamanDouce et le suivi post-partum vous est offert !
                </p>
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Users className="w-4 h-4" />
                  <span>Rendez-vous dans <strong>Paramètres → Parrainage</strong> pour inviter vos amies</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Garanties */}
        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-700 mb-6 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>Pourquoi choisir Premium ?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Satisfait ou remboursé</h4>
              <p className="text-sm text-slate-500">30 jours pour changer d'avis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Paiement sécurisé</h4>
              <p className="text-sm text-slate-500">Via Stripe, leader mondial</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Remboursement fausse couche</h4>
              <p className="text-sm text-slate-500">Au prorata sur attestation</p>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Questions fréquentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Quelle est la différence entre Standard et Premium ?</h4>
              <p className="text-slate-600">
                En Standard, vous avez accès aux conseils des 4 premières semaines et à 5 scans par semaine. 
                En Premium, vous débloquez les 41 semaines de conseils, le scanner illimité et toutes les fonctionnalités avancées.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Comment fonctionne le paiement ?</h4>
              <p className="text-slate-600">Paiement sécurisé unique de 27€ pour 9 mois d'accès complet. Sans renouvellement automatique.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Que se passe-t-il après les 9 mois ?</h4>
              <p className="text-slate-600">
                Votre compte reste actif en version Standard. Si vous avez acheté le post-partum, vous gardez l'accès pendant 6 mois après l'accouchement.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Comment accéder au suivi post-partum ?</h4>
              <p className="text-slate-600">
                Vous pouvez acheter l'option (8€) à tout moment. Le contenu sera débloqué après avoir confirmé votre accouchement 
                via l'icône bébé dans Profil → Informations de grossesse. Votre abonnement Premium prend alors fin.
                Vous pouvez aussi l'obtenir gratuitement en parrainant 2 amies !
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Puis-je être remboursée en cas de fausse couche ?</h4>
              <p className="text-slate-600">
                Oui, nous comprenons cette situation difficile. Envoyez une attestation médicale via les paramètres et nous vous remboursons au prorata des mois restants.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PricingPage;
