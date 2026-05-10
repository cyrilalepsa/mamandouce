/**
 * HomeWidgets.jsx
 * Widgets réutilisables pour la page d'accueil
 * Extraits de CustomizableHome.jsx pour améliorer la maintenabilité
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Heart } from 'lucide-react';

// Widget "Semaine de grossesse" - Version compact et normale
export function WeekDisplayWidget({ pregnancyProfile, t, compact = false, navigate }) {
  if (!pregnancyProfile?.current_week) return null;
  
  // Mode compact (côte à côte avec Fête du jour) - Cliquable vers suivi de cycle
  if (compact) {
    return (
      <div 
        className="relative overflow-hidden rounded-3xl px-4 py-3 h-full flex flex-col justify-center items-center cursor-pointer active:scale-[0.98] badge-semaine-x"
        style={{
          height: '96px',
          minHeight: '96px',
          borderRadius: '20px',
          color: '#4A4A4A',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          contain: 'layout paint size'
        }}
        onClick={() => navigate && navigate('/cycle-tracking')}
        data-testid="week-display-card"
      >
        <p className="relative text-[10px] mb-0.5 font-semibold" style={{ color: '#9d174d' }}>✨ {t('pregnancy.youAreAt', 'Vous êtes à la')}</p>
        <p className="relative text-lg font-bold" style={{ 
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {t('pregnancy.week', 'Semaine')} {pregnancyProfile.current_week}
        </p>
        <p className="relative text-[10px] font-medium" style={{ color: '#9d174d' }}>
          Trimestre {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)} • SA
        </p>
      </div>
    );
  }
  
  // Mode normal (pleine largeur)
  return (
    <Card className="badge-semaine-x rounded-2xl px-4 py-3 border-0" data-testid="week-display-card">
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[11px]" style={{ color: '#9d174d' }}>{t('pregnancy.youAreAt', 'Vous êtes à la')}</p>
          <p className="text-base font-bold" style={{ 
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>{t('pregnancy.week', 'Semaine')} {pregnancyProfile.current_week} SA</p>
        </div>
        <div className="text-right">
          <p className="text-[11px]" style={{ color: '#9d174d' }}>{t('pregnancy.trimester', 'Trimestre')} {pregnancyProfile.trimester || Math.ceil(pregnancyProfile.current_week / 13)}</p>
          {pregnancyProfile.estimated_due_date && (
            <p className="text-sm font-bold" style={{ color: '#be185d' }}>
              {new Date(pregnancyProfile.estimated_due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Carte cliquable "Les étapes de votre plus beau voyage" - Style Chamallow sans fond
export function JourneyStepsCard({ t, navigate }) {
  // Composant cœur 3D avec vrai SVG Heart de lucide-react - FOND TRANSPARENT
  const GlossyHeart = ({ size, color, rotation = 0, top = 0, left = 0 }) => (
    <div 
      className="absolute"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
        background: 'transparent',
      }}
    >
      <Heart 
        size={size} 
        fill={color}
        color={color}
        strokeWidth={0}
        style={{
          filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.5))',
        }}
      />
      {/* Reflet glossy sur le cœur */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: '15%',
          left: '20%',
          width: '35%',
          height: '30%',
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: `rotate(${-rotation}deg)`,
        }}
      />
    </div>
  );

  return (
    <div 
      className="flex flex-col items-center cursor-pointer select-none w-full px-2"
      onClick={() => navigate('/journey-steps')}
      data-testid="journey-steps-link"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        contain: 'layout paint',
        background: 'transparent',
      }}
    >
      {/* Cœurs flottants + texte — SANS bulle blanche */}
      <div className="relative flex items-center justify-center w-full max-w-sm" style={{ background: 'transparent' }}>
        
        {/* Cœurs gauche */}
        <div className="relative w-12 h-16 mr-2 flex-shrink-0" style={{ background: 'transparent', animation: 'heartBreath 3s ease-in-out infinite' }}>
          <GlossyHeart size={12} color="#f472b6" rotation={-25} top={2} left={8} />
          <GlossyHeart size={20} color="#ec4899" rotation={-10} top={18} left={0} />
          <GlossyHeart size={14} color="#a855f7" rotation={15} top={38} left={14} />
          <GlossyHeart size={10} color="#d946ef" rotation={-35} top={28} left={26} />
        </div>

        {/* Texte seul, fond transparent */}
        <div className="relative px-2 py-2 flex-1">
          <div className="flex items-center justify-center">
            <span 
              className="text-sm font-bold text-center"
              style={{ 
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
                background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
            </span>
          </div>
        </div>

        {/* Cœurs droit — animation respiration décalée */}
        <div className="relative w-12 h-16 ml-2 flex-shrink-0" style={{ background: 'transparent', animation: 'heartBreath 3s ease-in-out infinite' }}>
          <GlossyHeart size={14} color="#818cf8" rotation={25} top={4} left={16} />
          <GlossyHeart size={20} color="#38bdf8" rotation={10} top={20} left={20} />
          <GlossyHeart size={12} color="#2dd4bf" rotation={-20} top={40} left={8} />
          <GlossyHeart size={10} color="#60a5fa" rotation={35} top={12} left={2} />
        </div>
      </div>
      
      <span 
        className="text-[10px] mt-1"
        style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif", color: '#9ca3af' }}
      >
        Cliquez ici
      </span>
    </div>
  );
}

// Logo MamanDouce + Bienvenue pour la première page utilisateur
export function UserWelcomeHeader({ userName, t }) {
  return (
    <div className="text-center mt-2 mb-4">
      {/* Logo MamanDouce - ROSE CORAIL #FF8C9F */}
      <div 
        className="text-4xl sm:text-5xl font-bold whitespace-nowrap mamandouce-title"
        style={{
          fontFamily: "'Dancing Script', cursive",
          color: '#FF8C9F',
          WebkitTextFillColor: '#FF8C9F',
          textShadow: '0 2px 8px rgba(255, 140, 159, 0.3)',
          lineHeight: '1.2',
        }}
        data-testid="mamandouce-logo"
      >
        MamanDouce
      </div>
      
      {/* Bienvenue, User - Prénom en ROSE CORAIL #FF8C9F */}
      <p className="text-base mt-2" style={{ color: '#4A4A4A' }}>
        <span style={{ fontFamily: "'Quicksand', sans-serif", color: '#64748b' }}>
          {t('home.welcome', 'Bonjour')},{' '}
        </span>
        <span 
          className="text-lg font-semibold user-name-display"
          style={{
            fontFamily: "'Caveat', cursive",
            color: '#FF8C9F',
            WebkitTextFillColor: '#FF8C9F',
          }}
          data-testid="user-name"
        >
          {userName}
        </span>
        <span style={{ color: '#f472b6', marginLeft: '4px', display: 'inline-block', animation: 'heartBreath 3s ease-in-out infinite' }}>❤️</span>
      </p>
    </div>
  );
}

/**
 * TirelireWidget - Affichage compact de la tirelire sur le dashboard
 */
export function TirelireWidget({ navigate }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWallet();
  }, []);
  
  const loadWallet = async () => {
    try {
      const api = (await import('../../utils/api')).default;
      const response = await api.get('/api/solidarity/wallet');
      setBalance(response.data?.balance || 0);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const goal = 30;
  const progress = Math.min((balance / goal) * 100, 100);
  const isUnlocked = balance >= goal;
  
  return (
    <div 
      className="relative overflow-hidden rounded-3xl px-4 py-3 h-full flex flex-col justify-center cursor-pointer active:scale-[0.98]"
      style={{
        height: '96px',
        minHeight: '96px',
        background: isUnlocked 
          ? 'linear-gradient(145deg, rgba(254,249,195,0.95) 0%, rgba(253,224,71,0.8) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(252,231,243,0.9) 45%, rgba(249,168,212,0.7) 100%)',
        boxShadow: `0 10px 28px -6px ${isUnlocked ? 'rgba(234,179,8,0.25)' : 'rgba(236,72,153,0.25)'}, inset 0 2px 6px rgba(255,255,255,0.98)`,
        border: `2px solid ${isUnlocked ? 'rgba(234,179,8,0.3)' : 'rgba(249,168,212,0.3)'}`,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout paint size'
      }}
      onClick={() => navigate && navigate('/referral')}
      data-testid="tirelire-widget"
    >
      {/* Voile blanc supprimé */}
      
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium" style={{ color: '#4A4A4A' }}>
            🐷 Ma Tirelire
          </p>
          <p className={`text-lg font-bold ${isUnlocked ? 'text-yellow-600' : 'text-pink-500'}`}>
            {loading ? '...' : `${balance}€`}
          </p>
        </div>
        
        {/* Mini gauge */}
        <div className="w-16">
          <div className="h-2 rounded-full overflow-hidden bg-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                  : 'bg-gradient-to-r from-pink-400 to-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-center mt-0.5" style={{ color: '#6b7280' }}>
            {balance}/{goal}€
          </p>
        </div>
      </div>
    </div>
  );
}
