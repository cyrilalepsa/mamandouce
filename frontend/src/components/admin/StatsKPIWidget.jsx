import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Users, Crown, TrendingUp, Award, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export function StatsKPIWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.admin.getKPIStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl p-6 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
        <p className="text-sm text-slate-500 mt-2">Chargement des KPIs...</p>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const kpis = [
    {
      label: 'Total Inscrites',
      value: stats.total_users || 0,
      icon: Users,
      gradient: 'from-sky-400 to-sky-500',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600'
    },
    {
      label: 'Premium',
      value: stats.premium_users || 0,
      icon: Crown,
      gradient: 'from-amber-400 to-amber-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Taux de conversion',
      value: `${stats.conversion_rate || 0}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-400 to-emerald-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Marraines Or',
      value: stats.gold_godmothers || 0,
      icon: Award,
      gradient: 'from-purple-400 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        Indicateurs Clés (KPI)
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, index) => (
          <Card 
            key={index}
            data-testid={`kpi-card-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
            className="bg-gradient-to-br from-white/95 to-white/80 rounded-2xl p-4 relative overflow-hidden border-0"
            style={{
              boxShadow: `
                -4px -4px 12px rgba(255, 255, 255, 0.9),
                4px 4px 16px rgba(148, 163, 184, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.8)
              `
            }}
          >
            {/* Icône en haut à droite */}
            <div className={`absolute top-3 right-3 w-10 h-10 ${kpi.iconBg} rounded-xl flex items-center justify-center`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
            
            {/* Valeur */}
            <p className={`text-3xl font-bold bg-gradient-to-r ${kpi.gradient} bg-clip-text text-transparent`}>
              {kpi.value}
            </p>
            
            {/* Label */}
            <p className="text-xs text-slate-500 font-medium mt-1">{kpi.label}</p>
            
            {/* Barre décorative en bas */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient} opacity-30`} />
          </Card>
        ))}
      </div>
    </div>
  );
}
