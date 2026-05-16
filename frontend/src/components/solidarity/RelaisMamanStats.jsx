/**
 * RelaisMamanStats - Statistiques publiques du Relais Maman
 */
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { 
  HandHeart, Users, Gift, Heart, TrendingUp
} from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

export default function RelaisMamanStats({ compact = false }) {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    try {
      const response = await api.get('/api/solidarity/relais-maman/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading Relais Maman stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  const cardBg = isDarkMode ? 'bg-slate-800/90' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  
  if (loading) {
    return (
      <Card className={`${cardBg} rounded-3xl p-5`}>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <HandHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Le Relais Maman</p>
            <p className={`text-lg font-bold ${textColor}`} style={textShadow}>
              {stats?.total_collected || 0}€ collectés
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className={`${cardBg} rounded-3xl overflow-hidden`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <HandHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg" style={textShadow}>Le Relais Maman</p>
            <p className="text-white/80 text-sm" style={textShadow}>Solidarité entre mamans</p>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {/* Main stat */}
        <div className="text-center mb-4">
          <p className={`text-sm ${textMuted}`} style={textShadow}>Total collecté</p>
          <p className="text-4xl font-bold text-purple-600">{stats?.total_collected || 0}€</p>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-purple-50'} rounded-xl p-3 text-center`}>
            <Heart className="w-5 h-5 text-pink-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-pink-600">{stats?.donations_count || 0}</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Transmissions</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-purple-50'} rounded-xl p-3 text-center`}>
            <Gift className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">{stats?.gift_cards_sent || 0}</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Invitations</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-purple-50'} rounded-xl p-3 text-center`}>
            <Users className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-indigo-600">{stats?.beneficiaries_count || 0}</p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Mamans</p>
          </div>
        </div>
        
        {/* Description */}
        <div className={`mt-4 p-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-xl`}>
          <p className={`text-xs ${textMuted} text-center`} style={textShadow}>
            Le Relais Maman, c'est le cercle de complicité entre mamans. 
            On se serre les coudes pour que chacune puisse vivre sa grossesse sereinement.
          </p>
        </div>
      </div>
    </Card>
  );
}
