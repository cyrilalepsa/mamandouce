/**
 * GuardianStatusIndicator - Voyant lumineux pour le header Admin
 * Vert: Tout va bien
 * Orange: Bug auto-réparé récemment
 * Rouge: Problème nécessitant intervention
 */
import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import api from '../../utils/api';

export default function GuardianStatusIndicator({ onClick }) {
  const [status, setStatus] = useState({ color: 'green', label: 'Chargement...', count: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/api/guardian/status-indicator');
        setStatus(response.data);
      } catch (error) {
        console.error('Error fetching guardian status:', error);
        setStatus({ color: 'gray', label: 'Indisponible', count: 0 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const colorConfig = {
    green: {
      bg: 'bg-green-500',
      glow: 'shadow-green-400/50',
      pulse: 'bg-green-400',
      text: 'text-green-700',
      bgLight: 'bg-green-100',
    },
    orange: {
      bg: 'bg-amber-500',
      glow: 'shadow-amber-400/50',
      pulse: 'bg-amber-400',
      text: 'text-amber-700',
      bgLight: 'bg-amber-100',
    },
    red: {
      bg: 'bg-red-500',
      glow: 'shadow-red-400/50',
      pulse: 'bg-red-400',
      text: 'text-red-700',
      bgLight: 'bg-red-100',
    },
    gray: {
      bg: 'bg-slate-400',
      glow: 'shadow-slate-400/50',
      pulse: 'bg-slate-300',
      text: 'text-slate-600',
      bgLight: 'bg-slate-100',
    },
  };
  
  const colors = colorConfig[status.color] || colorConfig.gray;
  
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bgLight} transition-all hover:scale-105 active:scale-95`}
      title={status.label}
    >
      {/* Voyant lumineux avec animation */}
      <div className="relative">
        {/* Cercle principal */}
        <div className={`w-3 h-3 rounded-full ${colors.bg} shadow-lg ${colors.glow}`} />
        
        {/* Animation de pulsation pour les états non-verts */}
        {status.color !== 'green' && status.color !== 'gray' && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${colors.pulse} animate-ping opacity-75`} />
        )}
      </div>
      
      {/* Icône bouclier */}
      <Shield className={`w-4 h-4 ${colors.text}`} />
      
      {/* Label court */}
      <span className={`text-xs font-medium ${colors.text} hidden sm:inline`}>
        {status.color === 'green' ? 'OK' : status.color === 'orange' ? 'Auto-réparé' : status.color === 'red' ? 'Alerte' : '...'}
      </span>
      
      {/* Badge compteur si incidents */}
      {status.count > 0 && (
        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${colors.bg} text-white text-[10px] font-bold flex items-center justify-center`}>
          {status.count > 9 ? '9+' : status.count}
        </span>
      )}
    </button>
  );
}
