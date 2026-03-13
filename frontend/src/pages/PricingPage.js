import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Check, X, Crown } from 'lucide-react';
import AppTitle from '../components/AppTitle';
import PageHeader from '../components/PageHeader';

function PricingPage() {
  const navigate = useNavigate();

  const features = {
    free: [
      { text: 'Calculateur de grossesse basique', included: true },
      { text: '5 scans de produits par semaine', included: true },
      { text: 'Conseils des 4 premières semaines', included: true },
      { text: 'Accès CAF/Ameli/Mairie', included: true },
      { text: '41 semaines de conseils complets', included: false },
      { text: 'Images évolution embryon', included: false },
      { text: 'Scanner illimité', included: false },
      { text: 'Démarches administratives', included: false },
      { text: 'Notifications email', included: false },
      { text: 'Historique complet', included: false },
      { text: 'Support prioritaire', included: false }
    ],
    premium: [
      { text: 'Calculateur de grossesse basique', included: true },
      { text: 'Scanner ILLIMITÉ de produits', included: true },
      { text: '41 semaines de conseils complets', included: true },
      { text: 'Accès CAF/Ameli/Mairie', included: true },
      { text: '6 images évolution embryon/fœtus', included: true },
      { text: 'Démarches administratives détaillées', included: true },
      { text: 'Notifications email automatiques', included: true },
      { text: 'Historique complet recherches', included: true },
      { text: 'Sans publicité', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Mises à jour gratuites', included: true }
    ]
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <PageHeader title="Abonnements" />
          <div className="flex-1 text-right">
            <p className="text-slate-500">Accompagnement complet pour votre grossesse</p>
          </div>
        </div>

        {/* Hero */}
        <Card className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-3xl p-8 text-center border-0">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>MamanDouce Premium</h2>
          <p className="text-xl text-slate-600 mb-4">Tout ce dont vous avez besoin pour une grossesse sereine</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-sky-600">27€</span>
            <div className="text-left">
              <span className="text-2xl text-slate-500 block">/an</span>
            </div>
          </div>
          <p className="text-slate-500 mt-2">soit seulement 2,25€/mois</p>
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mt-4">
            ✓ Sans renouvellement automatique
          </div>
          <p className="text-sm text-slate-500 mt-2">Vous décidez si vous souhaitez renouveler à la fin de l'année</p>
        </Card>

        {/* Comparatif */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gratuit */}
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Gratuit</h3>
              <div className="text-4xl font-bold text-slate-600 mb-2">0€</div>
              <p className="text-slate-500">Pour découvrir</p>
            </div>
            <ul className="space-y-3 mb-6">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                    {feature.text}
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
              ⭐ RECOMMANDÉ
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Premium</h3>
              <div className="text-5xl font-bold text-white mb-2">27€</div>
              <p className="text-sky-100">/an (2,25€/mois)</p>
              <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold mt-2">
                Sans renouvellement auto
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {features.premium.map((feature, index) => (
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
              S'abonner maintenant 💎
            </Button>
          </Card>
        </div>

        {/* Garanties */}
        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-700 mb-6 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>Pourquoi choisir Premium ?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Satisfait ou remboursé</h4>
              <p className="text-sm text-slate-500">30 jours pour changer d'avis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Paiement sécurisé</h4>
              <p className="text-sm text-slate-500">Via Stripe, leader mondial</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💝</span>
              </div>
              <h4 className="font-bold text-slate-700 mb-2">Données privées</h4>
              <p className="text-sm text-slate-500">Conforme RGPD</p>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Questions fréquentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Puis-je annuler mon abonnement ?</h4>
              <p className="text-slate-600">Oui, vous pouvez annuler à tout moment depuis votre compte. Aucun engagement.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Comment fonctionne le paiement ?</h4>
              <p className="text-slate-600">Paiement sécurisé unique de 27€ pour 12 mois d'accès complet. Sans renouvellement automatique.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Mes données sont-elles sécurisées ?</h4>
              <p className="text-slate-600">Absolument. Nous sommes conformes RGPD et vos données ne sont jamais partagées.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PricingPage;