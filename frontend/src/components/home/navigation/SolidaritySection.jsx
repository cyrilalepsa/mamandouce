import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple,
  History, Stethoscope, Bell,
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users, Pin, PinOff, Phone, PiggyBank, Award, HandHeart, HelpCircle
} from 'lucide-react';
import { useSubscription } from '../../SubscriptionGate';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { PastelMosaicCard, PastelPillCard, CollapsibleSection, usePinnedSections, PASTEL_STYLES } from './_shared';
import { N20Amount } from '../../N20Icon';

export function SolidaritySection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [walletData, setWalletData] = useState({ balance: 0, total_earned: 0 });
  const [badgesData, setBadgesData] = useState({ progress: {} });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [walletRes, badgesRes] = await Promise.all([
        api.get('/api/solidarity/wallet').catch(() => ({ data: { balance: 3, total_earned: 3 } })),
        api.get('/api/solidarity/badges').catch(() => ({ data: { progress: {} } }))
      ]);
      setWalletData(walletRes.data);
      setBadgesData(badgesRes.data);
    } catch (error) {
      console.error('Error loading solidarity data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const balance = walletData?.balance || 0;
  const goal = 30;
  const progress = Math.min((balance / goal) * 100, 100);
  const isUnlocked = balance >= goal;
  
  const badgeProgress = badgesData?.progress || {};
  const hasBronze = badgeProgress.has_bronze;
  const hasSilver = badgeProgress.has_silver;
  const hasGold = badgeProgress.has_gold;

  return (
    <CollapsibleSection 
      title="Solidarité"
      icon={HandHeart} 
      iconColor="text-purple-500"
      defaultOpen={false}
      sectionId="solidarity"
    >
      {/* Tirelire Card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-4 mb-4 cursor-pointer active:scale-[0.99] transition-all"
        style={{
          background: isUnlocked 
            ? 'linear-gradient(145deg, rgba(254,249,195,0.95) 0%, rgba(253,224,71,0.8) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(252,231,243,0.9) 45%, rgba(249,168,212,0.7) 100%)',
          boxShadow: `0 10px 28px -6px ${isUnlocked ? 'rgba(234,179,8,0.25)' : 'rgba(236,72,153,0.25)'}, inset 0 2px 6px rgba(255,255,255,0.98)`,
          border: `2px solid ${isUnlocked ? 'rgba(234,179,8,0.3)' : 'rgba(249,168,212,0.3)'}`,
        }}
        onClick={() => navigate('/referral')}
        data-testid="tirelire-section-card"
      >
        {/* Voile blanc supprimé */}
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-yellow-100' : 'bg-pink-100'}`}>
                <PiggyBank className={`w-6 h-6 ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`} />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Ma Tirelire N20</p>
                <p className={`text-2xl font-bold ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`}>
                  {loading ? '...' : <N20Amount value={balance} size={22} valueClassName="text-2xl font-bold" />}
                </p>
              </div>
            </div>
            {isUnlocked && (
              <div className="flex items-center gap-1 bg-yellow-200/60 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                <Gift className="w-3 h-3" /> Débloqué !
              </div>
            )}
          </div>
          
          {/* Jauge de progression */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progression</span>
              <span className="inline-flex items-center gap-1">
                <N20Amount value={balance} size={12} />
                <span>/</span>
                <N20Amount value={goal} size={12} />
              </span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
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
          
          <p className="text-xs text-slate-500 text-center">
            {isUnlocked 
              ? '🎉 Offrez une Invitation Sérénité !'
              : `+3€ par parrainage • Encore ${goal - balance}€ pour débloquer`
            }
          </p>
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex justify-center gap-4 mb-4">
        {/* Bronze */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasBronze ? 'bg-gradient-to-br from-amber-600 to-amber-700' : 'bg-slate-200'
          }`}>
            {hasBronze ? (
              <Award className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasBronze ? 'text-amber-700' : 'text-slate-400'}`}>Bronze</p>
          {!hasBronze && (
            <p className="text-[10px] text-slate-400">{badgeProgress.contributions_validated || 0}/3</p>
          )}
        </div>
        
        {/* Argent */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasSilver ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-slate-200'
          }`}>
            {hasSilver ? (
              <Award className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasSilver ? 'text-slate-600' : 'text-slate-400'}`}>Argent</p>
          {!hasSilver && (
            <p className="text-[10px] text-slate-400">{badgeProgress.contributions_validated || 0}/5</p>
          )}
        </div>
        
        {/* Or */}
        <div className="text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-1 ${
            hasGold ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-slate-200'
          }`}>
            {hasGold ? (
              <Crown className="w-7 h-7 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <p className={`text-xs font-medium ${hasGold ? 'text-yellow-700' : 'text-slate-400'}`}>Or</p>
          {!hasGold && (
            <p className="text-[10px] text-slate-400">5 + 3 parrainages</p>
          )}
        </div>
      </div>
      
      {/* Relais Maman info */}
      <PastelPillCard color="purple" onClick={() => navigate('/referral')} testId="relais-maman-nav">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100/60 backdrop-blur-sm flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <HandHeart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-700">Le Relais Maman</h3>
            <p className="text-xs text-slate-500">Parrainez et aidez d'autres mamans</p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </div>
      </PastelPillCard>
    </CollapsibleSection>
  );
}
