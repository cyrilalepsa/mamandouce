import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Calculator, TrendingUp, AlertTriangle, FileText, Send, 
  MessageCircle, Download, Euro, Percent, CreditCard,
  PieChart, BarChart3, Lightbulb, X, Minimize2, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Mini-Chat IA Expert
const ExpertChatWidget = ({ isOpen, onToggle, onMinimize }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis ton Expert Comptable IA. Pose-moi tes questions sur ta comptabilité, les seuils URSSAF, l'ACRE, ou les tendances de ton activité. 📊" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/admin/accounting/chat', {
        message: userMessage,
        session_id: sessionId
      });

      if (res.data.session_id) {
        setSessionId(res.data.session_id);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, une erreur s'est produite. Réessaie dans quelques instants." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        data-testid="expert-chat-toggle"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 animate-fade-in" data-testid="expert-chat-widget">
      <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Expert Comptable IA</h3>
              <p className="text-white/70 text-xs">GPT-5.2</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onMinimize} className="p-1 hover:bg-white/20 rounded">
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
            <button onClick={onToggle} className="p-1 hover:bg-white/20 rounded">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-indigo-50/50 to-white">
          {messages.map((msg, i) => (
            <div 
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-white shadow-sm border border-indigo-100 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-indigo-100 p-3 rounded-2xl rounded-bl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-indigo-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Pose ta question..."
              className="flex-1 px-4 py-2 rounded-full border border-indigo-200 focus:border-indigo-400 focus:outline-none text-sm"
              data-testid="expert-chat-input"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white disabled:opacity-50"
              data-testid="expert-chat-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

function AccountingDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, evolutionRes, alertsRes] = await Promise.all([
        api.get(`/admin/accounting/kpis?month=${selectedMonth}`),
        api.get('/admin/accounting/monthly-evolution'),
        api.get('/admin/accounting/alerts')
      ]);

      setKpis(kpiRes.data);
      setMonthlyData(evolutionRes.data.monthly_evolution || []);
      setAlerts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Error fetching accounting data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const response = await api.get(`/admin/accounting/export-pdf?month=${selectedMonth}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MamanDouce_Bilan_${selectedMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF exporté avec succès !');
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Expert Comptable IA
            </h2>
            <p className="text-sm text-slate-500">URSSAF 26% • Stripe 2,9%+0,25€</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:outline-none"
            data-testid="month-selector"
          />
          <Button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
            data-testid="export-pdf-btn"
          >
            <Download className="w-4 h-4" />
            {exportingPdf ? 'Export...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Card 
              key={i}
              className={`p-4 rounded-xl border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-l-amber-500 bg-amber-50' :
                alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                'border-l-blue-500 bg-blue-50'
              }`}
              data-testid={`alert-${alert.type}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{alert.icon}</span>
                <div>
                  <h4 className="font-bold text-slate-700">{alert.title}</h4>
                  <p className="text-sm text-slate-600">{alert.message}</p>
                  {alert.action && (
                    <p className="text-xs text-slate-500 mt-1 italic">{alert.action}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-4 rounded-2xl" data-testid="kpi-ca-brut">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">CA Brut</span>
          </div>
          <div className="text-2xl font-bold text-emerald-800">{kpis?.ca_brut || 0}€</div>
          <div className="text-xs text-emerald-600 mt-1">
            {kpis?.total_premium || 0} Premium + {kpis?.total_postpartum || 0} Post-partum
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-2xl" data-testid="kpi-stripe">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700 font-medium">Frais Stripe</span>
          </div>
          <div className="text-2xl font-bold text-red-800">-{kpis?.frais_stripe || 0}€</div>
          <div className="text-xs text-red-600 mt-1">2,9% + 0,25€/transaction</div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-100 to-amber-50 p-4 rounded-2xl" data-testid="kpi-urssaf">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">URSSAF</span>
          </div>
          <div className="text-2xl font-bold text-amber-800">-{kpis?.cotisations_urssaf || 0}€</div>
          <div className="text-xs text-amber-600 mt-1">26% du CA</div>
        </Card>

        <Card className="bg-gradient-to-br from-sky-100 to-sky-50 p-4 rounded-2xl" data-testid="kpi-benefice">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <span className="text-sm text-sky-700 font-medium">Bénéfice Net</span>
          </div>
          <div className="text-2xl font-bold text-sky-800">{kpis?.benefice_net || 0}€</div>
          <div className="text-xs text-sky-600 mt-1">Après charges</div>
        </Card>
      </div>

      {/* Year to Date */}
      <Card className="bg-white/90 p-5 rounded-2xl shadow-sm" data-testid="ytd-card">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          Cumul Annuel
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{kpis?.year_to_date?.ca_total || 0}€</div>
            <div className="text-sm text-slate-500">CA Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-600">{kpis?.year_to_date?.premium_count || 0}</div>
            <div className="text-sm text-slate-500">Premium</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{kpis?.year_to_date?.postpartum_count || 0}</div>
            <div className="text-sm text-slate-500">Post-partum</div>
          </div>
        </div>
        
        {/* TVA Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Seuil TVA</span>
            <span className="text-slate-500">{kpis?.year_to_date?.ca_total || 0}€ / {kpis?.tva_threshold || 36800}€</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                (kpis?.year_to_date?.ca_total || 0) >= (kpis?.tva_threshold || 36800)
                  ? 'bg-red-500'
                  : (kpis?.year_to_date?.ca_total || 0) >= (kpis?.tva_threshold || 36800) * 0.8
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(((kpis?.year_to_date?.ca_total || 0) / (kpis?.tva_threshold || 36800)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Evolution Chart */}
      <Card className="bg-white/90 p-5 rounded-2xl shadow-sm" data-testid="evolution-chart">
        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Évolution sur 12 mois
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
                formatter={(value, name) => [`${value}€`, name === 'ca_brut' ? 'CA Brut' : 'Bénéfice Net']}
              />
              <Legend />
              <Bar dataKey="ca_brut" name="CA Brut" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefice_net" name="Bénéfice Net" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-br from-indigo-100 to-purple-50 p-5 rounded-2xl" data-testid="quick-tips">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-800 mb-1">Conseil Stratégique</h3>
            <p className="text-indigo-700 text-sm">
              {kpis?.tva_alert || 
                (kpis?.benefice_net > 0 
                  ? `Ce mois-ci, pense à mettre de côté ~${Math.round((kpis?.benefice_net || 0) * 0.3)}€ pour tes cotisations trimestrielles.`
                  : "Continue de développer ton activité ! Chaque abonnement compte."
                )
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Expert Chat Widget */}
      <ExpertChatWidget 
        isOpen={chatOpen} 
        onToggle={() => setChatOpen(!chatOpen)}
        onMinimize={() => setChatOpen(false)}
      />
    </div>
  );
}

export default AccountingDashboard;
