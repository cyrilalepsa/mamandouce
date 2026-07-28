// Composant de carte pastel nuage réutilisable
// Style: petit, dégradé pastel nuage, sans bulle autour des icônes

import { ChevronRight } from 'lucide-react';

// Cartes pastel nuage pour une navigation plus douce
export function PastelCloudCard({ 
  icon: Icon, 
  emoji,
  title, 
  description, 
  onClick, 
  gradient = 'from-pink-50/80 to-rose-50/60',
  iconColor = 'text-pink-500',
  className = '',
  showArrow = true,
  size = 'normal', // 'small', 'normal', 'large'
  testId
}) {
  const sizeClasses = {
    small: 'p-3 rounded-xl',
    normal: 'p-4 rounded-2xl',
    large: 'p-5 rounded-2xl'
  };
  
  const iconSizes = {
    small: 'w-5 h-5',
    normal: 'w-6 h-6',
    large: 'w-7 h-7'
  };
  
  const textSizes = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg'
  };
  
  const descSizes = {
    small: 'text-[10px]',
    normal: 'text-xs',
    large: 'text-sm'
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full card-glass-interactive bg-gradient-to-br ${gradient} ${sizeClasses[size]}
        hover:scale-[1.01] active:scale-[0.99] transition-all duration-200
        text-left select-none shadow
        ${className}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none',
      }}
      data-testid={testId}
    >
      <div className="flex items-center gap-3">
        {/* Icône directe sans bulle */}
        {Icon && <Icon className={`${iconSizes[size]} ${iconColor} flex-shrink-0`} />}
        {emoji && <span className={`${size === 'small' ? 'text-xl' : 'text-2xl'} flex-shrink-0`}>{emoji}</span>}
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-slate-700 ${textSizes[size]} truncate`}>
            {title}
          </h3>
          {description && (
            <p className={`text-slate-500 ${descSizes[size]} truncate mt-0.5`}>
              {description}
            </p>
          )}
        </div>
        
        {showArrow && (
          <ChevronRight className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400 flex-shrink-0`} />
        )}
      </div>
    </button>
  );
}

// Carte grille (pour affichage en 2 colonnes)
export function PastelGridCard({ 
  icon: Icon,
  emoji,
  title, 
  description,
  onClick, 
  gradient = 'from-pink-50/80 to-rose-50/60',
  iconColor = 'text-pink-500',
  className = '',
  testId
}) {
  return (
    <button
      onClick={onClick}
      className={`
        card-glass-interactive bg-gradient-to-br ${gradient} p-3 rounded-xl shadow
        hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
        text-center select-none
        ${className}
      `}
      style={{ 
        WebkitUserSelect: 'none', 
        WebkitTouchCallout: 'none'
      }}
      data-testid={testId}
    >
      {/* Icône directe sans bulle */}
      {Icon && <Icon className={`w-6 h-6 ${iconColor} mx-auto mb-1.5`} />}
      {emoji && <span className="text-2xl block mb-1">{emoji}</span>}
      
      <h3 className="font-semibold text-slate-700 text-sm leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">
          {description}
        </p>
      )}
    </button>
  );
}

// Gradients pastel prédéfinis
export const PASTEL_GRADIENTS = {
  pink: 'from-pink-50/80 via-pink-50/60 to-rose-50/50',
  blue: 'from-sky-50/80 via-blue-50/60 to-indigo-50/50',
  purple: 'from-violet-50/80 via-purple-50/60 to-fuchsia-50/50',
  green: 'from-emerald-50/80 via-green-50/60 to-teal-50/50',
  amber: 'from-amber-50/80 via-yellow-50/60 to-orange-50/50',
  rose: 'from-rose-50/80 via-pink-50/60 to-red-50/50',
  slate: 'from-slate-50/80 via-gray-50/60 to-zinc-50/50',
  indigo: 'from-indigo-50/80 via-blue-50/60 to-violet-50/50',
  teal: 'from-teal-50/80 via-cyan-50/60 to-emerald-50/50',
  orange: 'from-orange-50/80 via-amber-50/60 to-yellow-50/50',
};

export default PastelCloudCard;
