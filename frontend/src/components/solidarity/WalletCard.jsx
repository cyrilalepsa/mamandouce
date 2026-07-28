/**
 * WalletCard - Affichage de la cagnotte solidaire
 */
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { 
  Wallet, Gift, TrendingUp, History, ChevronRight, Sparkles
} from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import { N20Amount } from '../N20Icon';

export default function WalletCard({ compact = false }) {
  const { isDarkMode } = useTheme();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWallet();
  }, []);
  
  const loadWallet = async () => {
    try {
      const response = await api.get('/api/solidarity/wallet');
      setWallet(response.data);
    } catch (error) {
      console.error('Error loading wallet:', error);
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
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className={`text-xs ${textMuted}`} style={textShadow}>Ma cagnotte N20</p>
          <p className={`text-lg font-bold ${textColor}`} style={textShadow}>
            <N20Amount value={wallet?.balance || 0} size={18} valueClassName={`text-lg font-bold ${textColor}`} />
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Card className={`${cardBg} rounded-3xl overflow-hidden`}>
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm" style={textShadow}>Ma Cagnotte N20</p>
              <p className="text-3xl font-bold text-white" style={textShadow}>
                <N20Amount value={wallet?.balance || 0} size={26} valueClassName="text-3xl font-bold text-white" />
              </p>
            </div>
          </div>
          <Sparkles className="w-8 h-8 text-white/50" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-green-50'} rounded-xl p-3 text-center`}>
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">
              <N20Amount value={wallet?.total_earned || 0} size={16} valueClassName="text-lg font-bold text-green-600" />
            </p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Total gagné</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-pink-50'} rounded-xl p-3 text-center`}>
            <Gift className="w-5 h-5 text-pink-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-pink-600">
              <N20Amount value={wallet?.total_donated || 0} size={16} valueClassName="text-lg font-bold text-pink-600" />
            </p>
            <p className={`text-xs ${textMuted}`} style={textShadow}>Total offert</p>
          </div>
        </div>
        
        {/* Dernières transactions */}
        {wallet?.transactions && wallet.transactions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className={`w-4 h-4 ${textMuted}`} />
              <p className={`text-sm font-medium ${textColor}`} style={textShadow}>Dernières transactions</p>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {wallet.transactions.slice(0, 5).map((tx, index) => (
                <div key={index} className={`flex items-center justify-between py-2 px-3 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textColor} truncate`} style={textShadow}>
                      {tx.description}
                    </p>
                    <p className={`text-xs ${textMuted}`} style={textShadow}>
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-pink-500'}`}>
                    <N20Amount value={tx.amount} size={14} showSign={tx.amount > 0} valueClassName="text-sm font-bold" />
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Info cagnotte */}
        <div className={`mt-4 p-3 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-xl`}>
          <p className={`text-xs ${textMuted}`} style={textShadow}>
            💡 Gagnez <span className="font-medium text-purple-500 inline-flex items-center gap-0.5"><N20Amount value={3} size={12} showSign /></span> pour chaque parrainage réussi
            et <span className="font-medium text-purple-500 inline-flex items-center gap-0.5"><N20Amount value={1} size={12} showSign /></span> par contribution validée !
          </p>
        </div>
      </div>
    </Card>
  );
}
