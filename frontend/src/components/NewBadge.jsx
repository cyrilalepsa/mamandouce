import { useState, useEffect, createContext, useContext } from 'react';
import { Sparkles } from 'lucide-react';
import { getActiveBadges } from '../data/appUpdates';

// Context pour gérer les badges "Nouveau"
const NewBadgeContext = createContext({
  isNew: () => false,
  markAsSeen: () => {},
  activeBadges: []
});

export function NewBadgeProvider({ children }) {
  const [seenBadges, setSeenBadges] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);

  useEffect(() => {
    // Charger les badges vus depuis localStorage
    const seen = JSON.parse(localStorage.getItem('mamandouce_badges_seen') || '[]');
    setSeenBadges(seen);
    
    // Obtenir les badges actifs (nouvelles fonctionnalités)
    setActiveBadges(getActiveBadges());
  }, []);

  const isNew = (badgeId) => {
    return activeBadges.includes(badgeId) && !seenBadges.includes(badgeId);
  };

  const markAsSeen = (badgeId) => {
    if (!seenBadges.includes(badgeId)) {
      const newSeen = [...seenBadges, badgeId];
      setSeenBadges(newSeen);
      localStorage.setItem('mamandouce_badges_seen', JSON.stringify(newSeen));
    }
  };

  return (
    <NewBadgeContext.Provider value={{ isNew, markAsSeen, activeBadges }}>
      {children}
    </NewBadgeContext.Provider>
  );
}

export function useNewBadge() {
  return useContext(NewBadgeContext);
}

// Composant Badge "Nouveau" réutilisable
export function NewBadge({ badgeId, className = "", size = "sm", onClick }) {
  const { isNew, markAsSeen } = useNewBadge();
  
  if (!isNew(badgeId)) return null;

  const handleClick = () => {
    markAsSeen(badgeId);
    if (onClick) onClick();
  };

  const sizeClasses = {
    xs: "text-[8px] px-1 py-0.5",
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1"
  };

  return (
    <span 
      onClick={handleClick}
      className={`inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold animate-pulse cursor-pointer ${sizeClasses[size]} ${className}`}
    >
      <Sparkles className={size === "xs" ? "w-2 h-2" : size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      NEW
    </span>
  );
}

// Wrapper pour ajouter un badge à n'importe quel élément
export function WithNewBadge({ badgeId, children, position = "top-right" }) {
  const { isNew } = useNewBadge();
  
  if (!isNew(badgeId)) return children;

  const positionClasses = {
    "top-right": "-top-1 -right-1",
    "top-left": "-top-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
    "inline": "ml-2"
  };

  if (position === "inline") {
    return (
      <span className="inline-flex items-center gap-1">
        {children}
        <NewBadge badgeId={badgeId} size="xs" />
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      {children}
      <div className={`absolute ${positionClasses[position]}`}>
        <NewBadge badgeId={badgeId} size="xs" />
      </div>
    </div>
  );
}
