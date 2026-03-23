import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import api from '../../utils/api';

const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function StatsCharts() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const response = await api.admin.getChartStats();
      setChartData(response.data);
    } catch (error) {
      console.error('Erreur chargement graphiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-xl p-6 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400" />
        <p className="text-sm text-slate-500 mt-2">Chargement des graphiques...</p>
      </Card>
    );
  }

  if (!chartData) {
    return null;
  }

  // Custom label pour le PieChart - affiche le pourcentage au centre
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#475569" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="11"
        fontWeight="500"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Inscriptions sur 30 jours */}
      <Card className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <h3 className="text-sm font-bold text-slate-700">Inscriptions (30 derniers jours)</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.registrations_30d}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(value) => value.split('-').slice(1).join('/')}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => `Date: ${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }}
                name="Inscriptions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Répartition des utilisateurs - Amélioré */}
      <Card className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-700">Répartition des utilisateurs</h3>
        </div>
        
        {chartData.user_distribution && chartData.user_distribution.length > 0 ? (
          <>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.user_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  >
                    {chartData.user_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [`${value} utilisateur(s)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Légende en dessous */}
            <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
              {chartData.user_distribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  <span className="text-sm text-slate-500">({entry.value})</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            Aucune donnée disponible
          </div>
        )}
      </Card>

      {/* Utilisation des fonctionnalités - Amélioré */}
      <Card className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-teal-500" />
          <h3 className="text-sm font-bold text-slate-700">Utilisation des fonctionnalités</h3>
        </div>
        
        {chartData.feature_usage && chartData.feature_usage.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.feature_usage} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`${value}`, 'Utilisation']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 6, 6, 0]}
                  label={{ position: 'right', fill: '#64748b', fontSize: 11 }}
                >
                  {chartData.feature_usage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            Aucune donnée disponible
          </div>
        )}
      </Card>

      {/* Statistiques par mois */}
      {chartData.monthly_stats && chartData.monthly_stats.length > 0 && (
        <Card className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-700">Inscriptions par mois</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthly_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="inscriptions" fill="#ec4899" radius={[4, 4, 0, 0]} name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

export default StatsCharts;
