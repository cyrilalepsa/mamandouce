import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useSubscription } from './SubscriptionGate';

/**
 * Composant pour afficher un verrou sur les fonctionnalités premium
 * 
 * @param {Object} props
 * @param {string} props.title - Titre de la fonctionnalité verrouillée
 * @param {string} props.description - Description de ce que l'utilisateur pourrait faire avec Premium
 * @param {React.ReactNode} props.children - Contenu à afficher si l'utilisateur est premium
 * @param {boolean} props.inline - Si true, affiche une version compacte inline
 * @param {boolean} props.showUpgradeButton - Si true, affiche un bouton de mise à niveau
 */
export function PremiumFeatureLock({ 
  title = "Fonctionnalité Premium", 
  description = "Passez à Premium pour débloquer cette fonctionnalité.",
  children,
  inline = false,
  showUpgradeButton = true
}) {
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  // Si chargement, afficher un placeholder
  if (loading) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-2xl h-32"></div>
    );
  }

  // Si premium, afficher le contenu
  if (isPremium) {
    return children;
  }

  // Version inline (pour les boutons, liens, etc.)
  if (inline) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm font-medium">Premium requis</span>
      </button>
    );
  }

  // Version plein écran (pour les pages entières)
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
          <Crown className="w-10 h-10 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {title}
        </h2>
        
        <p className="text-slate-500 mb-6">
          {description}
        </p>

        {showUpgradeButton && (
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
            data-testid="upgrade-to-premium"
          >
            <Crown className="w-5 h-5 mr-2" />
            Passer à Premium
          </Button>
        )}

        <p className="mt-4 text-xs text-slate-400">
          30€ pour 9 mois • soit 3,33€/mois
        </p>
      </div>
    </div>
  );
}

/**
 * Composant pour afficher un message de restriction avec compteur
 * Utilisé pour les fonctionnalités limitées (ex: 5 scans/semaine)
 */
export function LimitedFeatureBanner({
  remaining,
  total,
  featureName = "utilisations",
  onUpgrade
}) {
  const navigate = useNavigate();

  if (remaining > total * 0.5) {
    // Plus de 50% restant - afficher un badge discret
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {remaining} {featureName} restants cette semaine
          </span>
        </div>
        <button
          onClick={() => navigate('/pricing')}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          Illimité avec Premium
        </button>
      </div>
    );
  }

  if (remaining > 0) {
    // Moins de 50% restant - afficher un avertissement
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">
            Plus que {remaining} {featureName} cette semaine
          </span>
        </div>
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          <Crown className="w-3 h-3" />
          Premium
        </button>
      </div>
    );
  }

  // Plus de quota - afficher un blocage
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
      <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="font-medium text-red-700 mb-1">Limite atteinte</p>
      <p className="text-sm text-red-600 mb-3">
        Vous avez utilisé vos {total} {featureName} gratuits cette semaine.
      </p>
      <button
        onClick={() => navigate('/pricing')}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        <Crown className="w-4 h-4 inline mr-2" />
        Passer à Premium - Illimité
      </button>
    </div>
  );
}

export default PremiumFeatureLock;
