import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';

export function EvolutionChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const response = await api.admin.getChartStats();
      setChartData(response.data.registrations_30d || []);
    } catch (error) {
      console.error('Erreur chargement graphique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-sky-100">
          <p className="text-xs text-slate-500 mb-1">{formatDate(label)}</p>
          <p className="text-lg font-bold text-sky-600">{payload[0].value} inscription(s)</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl p-6 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400" />
        <p className="text-sm text-slate-500 mt-2">Chargement du graphique...</p>
      </Card>
    );
  }

  const totalLast30Days = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="bg-white rounded-2xl overflow-hidden border-0" style={{
      boxShadow: `
        -4px -4px 12px rgba(255, 255, 255, 0.9),
        4px 4px 16px rgba(148, 163, 184, 0.25),
        inset 0 2px 4px rgba(255, 255, 255, 0.6)
      `
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">Évolution des inscriptions</h3>
            <p className="text-xs text-slate-500">
              {totalLast30Days} nouvelle(s) inscription(s) sur 30 jours
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-500">+{totalLast30Days}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Chart */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-100" data-testid="evolution-chart">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorInscriptions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}
