import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Users, MessageSquare, Apple, TrendingUp, BarChart3, Euro, RefreshCw, Download, ChevronDown, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { StatsCharts } from './StatsCharts';
import { StatsKPIWidget } from './StatsKPIWidget';
import { CityMapWidget } from './CityMapWidget';
import { EvolutionChart } from './EvolutionChart';

export function DashboardTab({ globalStats, codeStats, setActiveTab, messageStats }) {
  const [advancedStats, setAdvancedStats] = useState(null);
  const [loadingAdvanced, setLoadingAdvanced] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [billingAlerts, setBillingAlerts] = useState({ alerts: [], unresolved_count: 0, has_critical: false });

  useEffect(() => {
    loadAdvancedStats();
    loadBillingAlerts();
  }, []);

  const loadAdvancedStats = async () => {
    try {
      const response = await api.admin.getAdvancedStats();
      setAdvancedStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats avancées:', error);
    } finally {
      setLoadingAdvanced(false);
    }
  };

  const loadBillingAlerts = async () => {
    try {
      const response = await api.admin.getBillingAlerts();
      setBillingAlerts(response.data);
    } catch (error) {
      console.error('Erreur chargement alertes billing:', error);
    }
  };

  const handleResolveBillingAlert = async (index) => {
    try {
      await api.admin.resolveBillingAlert(index);
      toast.success('Alerte résolue');
      loadBillingAlerts();
    } catch (error) {
      toast.error('Erreur lors de la résolution');
    }
  };


  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Create a link and trigger download
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${API_URL}/api/admin/export-stats-csv`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamandouce_stats_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Export CSV téléchargé !');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExportCSV}
          disabled={exporting}
          data-testid="export-csv-button"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {exporting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Export...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>
      
      {/* VOYANT GARAGISTE - Billing Alerts */}
      {billingAlerts.has_critical && (
        <Card className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 border-2 border-red-300 animate-pulse" data-testid="billing-alert-critical">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">ALERTE FACTURATION</h3>
              <p className="text-red-100 text-xs">{billingAlerts.unresolved_count} écart(s) de montant détecté(s)</p>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {billingAlerts.alerts.filter(a => !a.resolved).map((alert, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                <div className="text-white text-xs">
                  <span className="font-mono">{alert.details?.customer_email || '?'}</span>
                  {' — '}
                  Attendu: <strong>{alert.details?.expected_amount}€</strong>,
                  Reçu: <strong>{alert.details?.received_amount}€</strong>
                  {' '}({alert.details?.difference > 0 ? '+' : ''}{alert.details?.difference}€)
                </div>
                <Button
                  onClick={() => handleResolveBillingAlert(i)}
                  data-testid={`resolve-billing-alert-${i}`}
                  className="bg-white/20 text-white text-xs px-2 py-1 rounded-full hover:bg-white/30 h-auto"
                >
                  Résoudre
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Voyant vert si pas d'alerte */}
      {!billingAlerts.has_critical && (
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200" data-testid="billing-status-ok">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" style={{ boxShadow: '0 0 6px #10b981' }} />
            <span className="text-emerald-700 text-xs font-medium">Tunnel d'achat OK — Aucun écart de facturation</span>
          </div>
        </Card>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.visits}</p>
          <p className="text-xs font-medium opacity-90">Visites</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.registrations || globalStats.users.total}</p>
          <p className="text-xs font-medium opacity-90">Inscrits</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.users.premium}</p>
          <p className="text-xs font-medium opacity-90">Premium</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.users.beta_tester}</p>
          <p className="text-xs font-medium opacity-90">Bêta</p>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white rounded-xl p-3 border-l-3 border-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Gratuits</p>
              <p className="text-lg font-bold text-slate-700">{globalStats.users.free}</p>
            </div>
            <Users className="w-4 h-4 text-slate-200" />
          </div>
        </Card>
        
        <Card 
          className="bg-white rounded-xl p-3 border-l-3 border-red-400 cursor-pointer hover:bg-red-50 transition-colors" 
          onClick={() => globalStats.unread_messages > 0 && setActiveTab('messages')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Non lus</p>
              <p className="text-lg font-bold text-red-600">{globalStats.unread_messages}</p>
            </div>
            <MessageSquare className="w-4 h-4 text-red-200" />
          </div>
        </Card>
        
        <Card 
          className="bg-white rounded-xl p-3 border-l-3 border-amber-400 cursor-pointer hover:bg-amber-50 transition-colors" 
          onClick={() => globalStats.pending_foods > 0 && setActiveTab('foods')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">En attente</p>
              <p className="text-lg font-bold text-amber-600">{globalStats.pending_foods}</p>
            </div>
            <Apple className="w-4 h-4 text-amber-200" />
          </div>
        </Card>
      </div>

      {/* Advanced Stats Section */}
      {loadingAdvanced ? (
        <Card className="bg-white rounded-xl p-4 text-center">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
          <p className="text-xs text-slate-500 mt-2">Chargement des statistiques...</p>
        </Card>
      ) : advancedStats && (
        <>
          {/* Conversion & Revenue */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-700">Conversions</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Taux global</span>
                  <span className="text-lg font-bold text-emerald-600">{advancedStats.conversion.overall_rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Essais → Premium</span>
                  <span className="text-sm font-semibold text-slate-700">{advancedStats.conversion.trial_conversions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">En essai</span>
                  <span className="text-sm font-semibold text-blue-600">{advancedStats.users.trial}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Euro className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-700">Revenus estimés</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total (hors admin)</span>
                  <span className="text-xl font-bold text-amber-600">{advancedStats.revenue.estimated_total}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Premium payants</span>
                  <span className="text-sm font-semibold text-slate-700">{advancedStats.users.premium_paid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Post-partum payants</span>
                  <span className="text-sm font-semibold text-slate-700">{advancedStats.users.postpartum_paid || 0}</span>
                </div>
                {advancedStats.users.premium_admin > 0 && (
                  <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                    <span className="text-xs text-slate-400">Déblocages admin</span>
                    <span className="text-sm text-slate-400">{advancedStats.users.premium_admin}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Feature Usage */}
          <Card className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-700">Utilisation des fonctionnalités</h3>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{advancedStats.features.food_scans}</p>
                <p className="text-[10px] text-slate-500">Scans</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-pink-600">{advancedStats.features.favorites}</p>
                <p className="text-[10px] text-slate-500">Favoris</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-sky-600">{advancedStats.features.birth_lists}</p>
                <p className="text-[10px] text-slate-500">Listes naissance</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{advancedStats.features.recipes_shared}</p>
                <p className="text-[10px] text-slate-500">Recettes partagées</p>
              </div>
            </div>
          </Card>

          {/* New Users */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-700">Nouveaux inscrits (30j)</h3>
              </div>
              <span className="text-2xl font-bold text-blue-600">{advancedStats.users.new_30_days}</span>
            </div>
          </Card>
        </>
      )}

      {/* Summary */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Résumé</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-slate-700">{globalStats.users.total}</p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">
              {globalStats.users.total > 0 
                ? Math.round((globalStats.users.premium + globalStats.users.beta_tester) / globalStats.users.total * 100) 
                : 0}%
            </p>
            <p className="text-[10px] text-slate-500">Taux premium</p>
          </div>
          <div>
            <p className="text-xl font-bold text-sky-600">{codeStats.available}</p>
            <p className="text-[10px] text-slate-500">Codes dispo</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">{codeStats.used}</p>
            <p className="text-[10px] text-slate-500">Codes utilisés</p>
          </div>
        </div>
      </Card>

      {/* NEW: KPIs Widget */}
      <StatsKPIWidget />

      {/* NEW: Evolution Chart (30 days) */}
      <EvolutionChart />

      {/* NEW: City Map Widget */}
      <CityMapWidget />

      {/* Charts Section - Collapsible */}
      <Card className="bg-white rounded-xl overflow-hidden border border-slate-100">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-700">Graphiques statistiques</h3>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCharts ? 'rotate-180' : ''}`} />
        </button>
        {showCharts && (
          <div className="p-4 pt-0 animate-fade-in">
            <StatsCharts />
          </div>
        )}
      </Card>
    </div>
  );
}
