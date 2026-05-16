/**
 * TirelireCard - Affichage de la Tirelire avec jauge visuelle
 * Gamification: 3€ initial + 3€/parrainage, déblocage à 30€
 */
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  PiggyBank, Gift, TrendingUp, Sparkles, Heart, Users, 
  ChevronRight, Lock, Unlock, PartyPopper
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export default function TirelireCard({ onGiftClick }) {
  const { isDarkMode } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    loadWallet();
  }, []);
  
  const loadWallet = async () => {
    try {
      const response = await api.get('/api/solidarity/wallet');
      setWallet(response.data);
      
      // Animation si objectif atteint
      if (response.data.balance >= 30 && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const balance = wallet?.balance || 0;
  const goal = 30;
  const progress = Math.min((balance / goal) * 100, 100);
  const isUnlocked = balance >= goal;
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  const cardBg = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  
  if (loading) {
    return (
      <Card className={`${cardBg} rounded-3xl p-5`}>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className={`${cardBg} rounded-3xl overflow-hidden relative`}>
      {/* Confetti animation when unlocked */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <PartyPopper className="w-16 h-16 text-yellow-400 animate-bounce" />
        </div>
      )}
      
      {/* Header gradient */}
      <div className={`p-5 ${isUnlocked 
        ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500' 
        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <PiggyBank className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium" style={textShadow}>Ma Tirelire</p>
              <p className="text-3xl font-bold text-white" style={textShadow}>{balance}€</p>
            </div>
          </div>
          {isUnlocked ? (
            <Unlock className="w-8 h-8 text-white/80" />
          ) : (
            <Lock className="w-8 h-8 text-white/40" />
          )}
        </div>
      </div>
      
      <div className="p-5 space-y-5">
        {/* Jauge de progression */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${textColor}`} style={textShadow}>
              Progression
            </span>
            <span className={`text-sm font-bold ${isUnlocked ? 'text-green-500' : textColor}`} style={textShadow}>
              {balance}€ / {goal}€
            </span>
          </div>
          
          {/* Progress bar container */}
          <div className={`relative h-6 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
            {/* Progress fill */}
            <div 
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                isUnlocked 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
            
            {/* Sparkle effect */}
            {progress > 0 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/50 blur-sm animate-pulse"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            )}
            
            {/* Milestones */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <span className="text-xs font-bold text-white drop-shadow-lg">0€</span>
              <span className="text-xs font-bold text-white drop-shadow-lg">30€</span>
            </div>
          </div>
          
          {/* Progress percentage */}
          <p className={`text-center text-xs mt-2 ${textMuted}`} style={textShadow}>
            {Math.round(progress)}% de l'objectif
          </p>
        </div>
        
        {/* Comment ça marche */}
        <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-purple-50'} rounded-2xl p-4`}>
          <p className={`text-sm font-medium ${textColor} mb-3`} style={textShadow}>
            <Sparkles className="w-4 h-4 inline mr-2 text-purple-500" />
            Comment remplir ma cagnotte ?
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Heart className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${textColor}`} style={textShadow}>+3€ de complicité</p>
                <p className={`text-xs ${textMuted}`} style={textShadow}>Offert dès le départ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-pink-500" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${textColor}`} style={textShadow}>+3€ par parrainage</p>
                <p className={`text-xs ${textMuted}`} style={textShadow}>Une amie rejoint le cercle</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action button */}
        {isUnlocked ? (
          <Button
            onClick={onGiftClick}
            className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white rounded-full py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Gift className="w-5 h-5 mr-2" />
            Passer le relais à une amie
          </Button>
        ) : (
          <div className={`text-center p-4 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-2xl`}>
            <Lock className={`w-6 h-6 mx-auto mb-2 ${textMuted}`} />
            <p className={`text-sm ${textMuted}`} style={textShadow}>
              Encore <span className="font-bold text-pink-500">{goal - balance}€</span> pour débloquer
            </p>
            <p className={`text-xs ${textMuted} mt-1`} style={textShadow}>
              "Passer le relais à une amie"
            </p>
          </div>
        )}
        
        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-green-50'} rounded-xl p-3 text-center`}>
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{wallet?.total_earned || 0}€</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Total gagné</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-pink-50'} rounded-xl p-3 text-center`}>
            <Gift className="w-5 h-5 text-pink-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-pink-600">{wallet?.total_donated || 0}€</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Total transmis</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
