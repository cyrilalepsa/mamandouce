/**
 * ReferralPage.js - Page de parrainage avec lien unique et tirelire
 * "Invitation Sérénité" - Système de parrainage avec code unique
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Heart, Copy, Check, Share2, Gift, PiggyBank, 
  Users, Award, ChevronRight, Sparkles, HandHeart,
  Crown, Lock, ArrowLeft
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

function ReferralPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [successfulReferrals, setSuccessfulReferrals] = useState(0);
  const [copied, setCopied] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [badgesData, setBadgesData] = useState(null);
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      // Charger le code de parrainage et les données wallet en parallèle
      const [codeRes, walletRes, badgesRes] = await Promise.all([
        api.get('/api/referral/code'),
        api.get('/api/solidarity/wallet').catch(() => ({ data: { balance: 0 } })),
        api.get('/api/solidarity/badges').catch(() => ({ data: { progress: {} } }))
      ]);
      
      setReferralCode(codeRes.data.referral_code);
      setReferralLink(codeRes.data.referral_link);
      setSponsorName(codeRes.data.sponsor_name);
      setWalletBalance(codeRes.data.wallet_balance || 0);
      setSuccessfulReferrals(codeRes.data.successful_referrals || 0);
      setWalletData(walletRes.data);
      setBadgesData(badgesRes.data);
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback pour mobile
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation Sérénité - MamanDouce',
          text: `${sponsorName} vous invite à rejoindre MamanDouce ! Utilisez mon code ${referralCode} pour vous inscrire.`,
          url: referralLink
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };
  
  const goal = 30;
  const balance = walletData?.balance || walletBalance;
  const progress = Math.min((balance / goal) * 100, 100);
  const isUnlocked = balance >= goal;
  
  const badgeProgress = badgesData?.progress || {};
  const hasBronze = badgeProgress.has_bronze;
  const hasSilver = badgeProgress.has_silver;
  const hasGold = badgeProgress.has_gold;
  
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-pulse text-pink-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'gradient-bg'} p-4 pb-20`}>
      <div className="max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <button 
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-white/80'} shadow-lg`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
          </button>
          <h1 
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}
            style={{ fontFamily: 'Nunito, sans-serif', ...textShadow }}
          >
            Invitation Sérénité
          </h1>
        </div>
        
        {/* Tirelire Card */}
        <Card 
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.9) 100%)'
              : isUnlocked 
                ? 'linear-gradient(145deg, rgba(254,249,195,0.95) 0%, rgba(253,224,71,0.8) 100%)'
                : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(252,231,243,0.9) 45%, rgba(249,168,212,0.7) 100%)',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : `0 10px 40px -6px ${isUnlocked ? 'rgba(234,179,8,0.25)' : 'rgba(236,72,153,0.25)'}`,
            border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : 'none'
          }}
        >
          {/* Reflet */}
          {!isDarkMode && (
            <div 
              className="absolute top-0 left-4 right-4 h-1/3 rounded-t-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
            />
          )}
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isUnlocked ? 'bg-yellow-100' : 'bg-pink-100'}`}>
                  <PiggyBank className={`w-8 h-8 ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
                    Ma Cagnotte de Complicité
                  </p>
                  <p className={`text-4xl font-bold ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`}>
                    {balance.toFixed(0)}€
                  </p>
                </div>
              </div>
              {isUnlocked && (
                <div className="flex items-center gap-1 bg-yellow-200/60 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                  <Gift className="w-4 h-4" /> Débloqué !
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} style={textShadow}>Objectif</span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} style={textShadow}>{balance.toFixed(0)}€ / {goal}€</span>
              </div>
              <div className={`h-4 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-600' : 'bg-white/50'}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isUnlocked 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                      : 'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <p className={`text-sm text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
              {isUnlocked 
                ? '🎉 Passez le relais : offrez la sérénité à une amie !'
                : `3€ offerts dès le départ • Partagez pour remplir la cagnotte`
              }
            </p>
          </div>
        </Card>
        
        {/* Referral Link Card */}
        <Card 
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.9) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(243,232,255,0.9) 45%, rgba(216,180,254,0.7) 100%)',
            boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 10px 40px -6px rgba(139,92,246,0.25)',
            border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : 'none'
          }}
        >
          {!isDarkMode && (
            <div 
              className="absolute top-0 left-4 right-4 h-1/3 rounded-t-full pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
            />
          )}
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
                  Votre lien unique
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} style={textShadow}>
                  Partagez avec vos amies
                </p>
              </div>
            </div>
            
            {/* Code display */}
            <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white/60'} rounded-2xl p-4 mb-4`}>
              <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={textShadow}>
                Votre code de parrainage
              </p>
              <p className={`text-3xl font-bold tracking-wider text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {referralCode}
              </p>
            </div>
            
            {/* Link input */}
            <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white/60'} rounded-2xl p-3 flex items-center gap-2 mb-4`}>
              <input 
                type="text" 
                value={referralLink} 
                readOnly
                className={`flex-1 bg-transparent text-sm ${isDarkMode ? 'text-white' : 'text-slate-600'} outline-none`}
                data-testid="referral-link-input"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                className={`${copied ? 'bg-green-500' : 'bg-purple-500'} text-white rounded-xl px-3`}
                data-testid="copy-link-btn"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Share buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-4 font-semibold"
                data-testid="copy-link-btn-large"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier le lien
              </Button>
              <Button
                onClick={shareLink}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl py-4 font-semibold"
                data-testid="share-link-btn"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Stats Card */}
        <Card 
          className="rounded-3xl p-5"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.9) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(220,252,231,0.9) 100%)',
            boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 10px 30px -6px rgba(34,197,94,0.2)',
            border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : 'none'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} style={textShadow}>
                  Parrainages réussis
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-green-600'}`}>
                  {successfulReferrals}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={textShadow}>
                Total gagné
              </p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                +{(successfulReferrals * 3)}€
              </p>
            </div>
          </div>
        </Card>
        
        {/* Badges Section */}
        <div className={`rounded-3xl p-5 ${isDarkMode ? 'bg-slate-800' : 'bg-white/80'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
            Mes Badges
          </h3>
          <div className="flex justify-center gap-6">
            {/* Bronze */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                hasBronze ? 'bg-gradient-to-br from-amber-600 to-amber-700' : 'bg-slate-200'
              }`}>
                {hasBronze ? (
                  <Award className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className={`text-sm font-medium ${hasBronze ? 'text-amber-700' : 'text-slate-400'}`}>Bronze</p>
              {!hasBronze && (
                <p className="text-xs text-slate-400">{badgeProgress.contributions_validated || 0}/3</p>
              )}
            </div>
            
            {/* Argent */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                hasSilver ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-slate-200'
              }`}>
                {hasSilver ? (
                  <Award className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className={`text-sm font-medium ${hasSilver ? 'text-slate-600' : 'text-slate-400'}`}>Argent</p>
              {!hasSilver && (
                <p className="text-xs text-slate-400">{badgeProgress.contributions_validated || 0}/5</p>
              )}
            </div>
            
            {/* Or */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                hasGold ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-slate-200'
              }`}>
                {hasGold ? (
                  <Crown className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className={`text-sm font-medium ${hasGold ? 'text-yellow-700' : 'text-slate-400'}`}>Or</p>
              {!hasGold && (
                <p className="text-xs text-slate-400">5 + 3 parrainages</p>
              )}
            </div>
          </div>
        </div>
        
        {/* How it works */}
        <Card 
          className="rounded-3xl p-5"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(51,65,85,0.9) 100%)'
              : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(241,245,249,0.9) 100%)',
            border: isDarkMode ? '1px solid rgba(100,116,139,0.3)' : 'none'
          }}
        >
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
            <Sparkles className="w-5 h-5 text-purple-500" />
            Comment ça marche ?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-pink-600">1</div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
                Partagez votre lien unique avec vos amies enceintes ou mamans
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-purple-600">2</div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
                Quand elles rejoignent le cercle, vous gagnez <strong className="text-purple-600">3€</strong> dans votre cagnotte
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-yellow-600">3</div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`} style={textShadow}>
                À 30€, passez le relais : offrez la sérénité à une autre maman
              </p>
            </div>
          </div>
        </Card>
        
        {/* Relais Maman link */}
        <div 
          className="rounded-3xl p-5 cursor-pointer active:scale-[0.98] transition-all"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(126,34,206,0.3) 0%, rgba(236,72,153,0.3) 100%)'
              : 'linear-gradient(145deg, rgba(243,232,255,0.9) 0%, rgba(252,231,243,0.9) 100%)',
            boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 10px 30px -6px rgba(139,92,246,0.2)',
          }}
          onClick={() => navigate('/settings')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <HandHeart className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`} style={textShadow}>
                  Le Relais Maman
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} style={textShadow}>
                  Transmettez la sérénité à une autre maman
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-purple-400'}`} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default ReferralPage;
