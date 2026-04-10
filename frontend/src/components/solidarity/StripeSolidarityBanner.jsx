/**
 * StripeSolidarityBanner - Encart de paiement Stripe avec message de complicité
 * "Ici, on se serre les coudes."
 */
import { Heart, HandHeart, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function StripeSolidarityBanner({ price = 30 }) {
  const { isDarkMode } = useTheme();
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  
  return (
    <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-5 border`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
          <HandHeart className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className={`font-bold ${textColor}`} style={textShadow}>
            Ici, on se serre les coudes.
          </p>
          <p className="text-purple-500 dark:text-purple-400 font-medium text-sm">
            Entre mamans, c'est comme ça.
          </p>
        </div>
      </div>
      
      {/* Message principal */}
      <div className={`p-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} rounded-xl mb-4`}>
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${textColor}`} style={textShadow}>
            <span className="font-bold text-pink-500">3€</span> de votre abonnement sont mis de côté pour{' '}
            <span className="font-bold text-purple-500">offrir un accès gratuit</span> à une autre maman 
            via le Relais Maman.
          </p>
        </div>
      </div>
      
      {/* Prix */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${textMuted}`} style={textShadow}>Abonnement Premium</p>
          <p className={`text-2xl font-bold ${textColor}`} style={textShadow}>
            {price}€
            <span className={`text-sm font-normal ${textMuted} ml-1`}>/ an</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <div className="text-right">
            <p className="text-xs text-green-500 font-medium">Inclus</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>3€ de complicité</p>
          </div>
        </div>
      </div>
      
      {/* Sous-texte */}
      <p className={`text-xs ${textMuted} mt-3 text-center`} style={textShadow}>
        💝 Le cercle des mamans qui se soutiennent
      </p>
    </div>
  );
}
