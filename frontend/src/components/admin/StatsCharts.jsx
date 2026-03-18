import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, RefreshCw } from 'lucide-react';
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
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
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

      {/* Répartition des utilisateurs */}
      <Card className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-700">Répartition des utilisateurs</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.user_distribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
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
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {chartData.user_distribution.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1 text-xs">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-slate-600">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Utilisation des fonctionnalités */}
      <Card className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-teal-500" />
          <h3 className="text-sm font-bold text-slate-700">Utilisation des fonctionnalités</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.feature_usage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default StatsCharts;
