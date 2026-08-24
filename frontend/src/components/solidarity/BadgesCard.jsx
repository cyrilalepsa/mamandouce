/**
 * BadgesCard - Affichage des badges et progression
 */
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Award, Star, Trophy, Crown, Lock, CheckCircle2, Gift, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

const BADGE_CONFIG = {
  bronze: {
    icon: Award,
    label: 'Bronze',
    color: 'from-amber-400 to-amber-500',
    bgColor: 'bg-amber-50',
    darkBgColor: 'dark:bg-amber-900/30',
    textColor: 'text-amber-600',
    darkTextColor: 'dark:text-amber-400',
    requirement: '3 contributions validées'
  },
  silver: {
    icon: Star,
    label: 'Argent',
    color: 'from-slate-300 to-slate-400',
    bgColor: 'bg-slate-100',
    darkBgColor: 'dark:bg-slate-700',
    textColor: 'text-slate-500',
    darkTextColor: 'dark:text-slate-300',
    requirement: '2 contributions + 1 parrainage'
  },
  gold: {
    icon: Crown,
    label: 'Or',
    color: 'from-yellow-300 to-yellow-500',
    bgColor: 'bg-yellow-50',
    darkBgColor: 'dark:bg-yellow-900/30',
    textColor: 'text-yellow-600',
    darkTextColor: 'dark:text-yellow-400',
    requirement: '5 contributions + 3 parrainages',
    reward: '1 code invitation Premium offert'
  }
};

export default function BadgesCard() {
  const { isDarkMode } = useTheme();
  const [badgesData, setBadgesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  
  useEffect(() => {
    loadBadges();
  }, []);
  
  const loadBadges = async () => {
    try {
      const response = await api.get('/api/solidarity/badges');
      setBadgesData(response.data);
      
      // Notification pour nouveaux badges
      if (response.data.new_badges && response.data.new_badges.length > 0) {
        response.data.new_badges.forEach(badge => {
          toast.success(`Nouveau badge débloqué: ${BADGE_CONFIG[badge]?.label}!`, {
            icon: '🏆'
          });
        });
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClaimGoldReward = async () => {
    setClaiming(true);
    try {
      const response = await api.post('/api/solidarity/badges/claim-gold-reward');
      toast.success(`Code invitation offert: ${response.data.invite_code}`, {
        duration: 10000
      });
      loadBadges();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setClaiming(false);
    }
  };
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  const cardBg = isDarkMode 
    ? 'bg-slate-800/90' 
    : 'bg-white/70 backdrop-blur-xl border border-white/80';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-700';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-500';
  
  if (loading) {
    return (
      <Card className={`${cardBg} rounded-3xl p-5`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="flex gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }
  
  const progress = badgesData?.progress || {};
  
  return (
    <Card className={`${cardBg} rounded-3xl p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className={`font-bold ${textColor}`} style={textShadow}>Mes Badges</h3>
      </div>
      
      {/* Badges display */}
      <div className="flex justify-center gap-6 mb-6">
        {Object.entries(BADGE_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          const isUnlocked = progress[`has_${type}`];
          const progressPercent = progress[`${type}_progress`] || 0;
          
          return (
            <div key={type} className="text-center">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isUnlocked 
                    ? `bg-gradient-to-br ${config.color}` 
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {isUnlocked ? (
                    <Icon className="w-8 h-8 text-white" />
                  ) : (
                    <Lock className={`w-6 h-6 ${textMuted}`} />
                  )}
                </div>
                
                {/* Progress ring pour badges non débloqués */}
                {!isUnlocked && progressPercent > 0 && (
                  <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-slate-200 dark:text-slate-600"
                    />
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                      className={config.textColor}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                
                {/* Check mark for unlocked */}
                {isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <p className={`text-sm font-medium mt-2 ${isUnlocked ? config.textColor : textMuted}`} style={textShadow}>
                {config.label}
              </p>
              {!isUnlocked && (
                <p className={`text-xs ${textMuted}`} style={textShadow}>
                  {Math.round(progressPercent)}%
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress stats */}
      <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-4 space-y-3`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${textMuted}`} style={textShadow}>Contributions validées</span>
          <span className={`font-bold ${textColor}`} style={textShadow}>
            {progress.contributions_validated || 0}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${textMuted}`} style={textShadow}>Parrainages réussis</span>
          <span className={`font-bold ${textColor}`} style={textShadow}>
            {progress.referrals_completed || 0}
          </span>
        </div>
      </div>
      
      {/* Gold reward claim button */}
      {progress.has_gold && (
        <div className="mt-4">
          <Button
            onClick={handleClaimGoldReward}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full py-5 font-semibold"
          >
            <Gift className="w-4 h-4 mr-2" />
            {claiming ? 'Récupération...' : 'Réclamer mon code invitation Premium'}
          </Button>
        </div>
      )}
      
      {/* Next badge hint */}
      {!progress.has_gold && (
        <div className={`mt-4 p-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-xl`}>
          <p className={`text-xs ${textMuted}`} style={textShadow}>
            🎯 Prochain objectif: {
              !progress.has_bronze ? 'Badge Bronze (3 contributions)' :
              !progress.has_silver ? 'Badge Argent (5 contributions)' :
              'Badge Or (5 contributions + 3 parrainages)'
            }
          </p>
        </div>
      )}
    </Card>
  );
}
