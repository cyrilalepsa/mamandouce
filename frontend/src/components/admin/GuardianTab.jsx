/**
 * GuardianTab - Onglet "Santé du Système" pour le Dashboard Admin
 * Version 3.0 - Journal de Bord & Stratégie Zéro Bruit
 * 
 * Fonctionnalités:
 * - Journal de Bord: 10 derniers rapports de santé
 * - Codes couleurs: Vert (OK), Orange (Dégradé), Rouge (Down)
 * - Zéro emails pour les routines
 */
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Shield, Activity, Database, CreditCard, Camera, CalendarHeart, Mail,
  CheckCircle2, AlertTriangle, XCircle, Download, RefreshCw, Clock,
  Server, Cpu, HardDrive, Bell, BellOff, FileText
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

// Mapping des composants vers icônes et labels
const COMPONENT_CONFIG = {
  api_server: { icon: Server, label: 'Serveur API', color: 'sky' },
  database: { icon: Database, label: 'Base de données', color: 'purple' },
  stripe: { icon: CreditCard, label: 'Paiements Stripe', color: 'green' },
  food_scanner: { icon: Camera, label: 'Scanner Aliments', color: 'orange' },
  cycle_tracking: { icon: CalendarHeart, label: 'Suivi de Cycle', color: 'pink' },
  email_service: { icon: Mail, label: 'Service Email', color: 'indigo' },
};

// Composant pour le statut d'un composant (version compacte)
function ComponentStatusBadge({ component, status, responseTime }) {
  const config = COMPONENT_CONFIG[component] || { icon: Activity, label: component, color: 'slate' };
  const Icon = config.icon;
  
  const statusConfig = {
    healthy: { bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-500' },
    degraded: { bgColor: 'bg-amber-100', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
    down: { bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-500' },
  };
  
  const s = statusConfig[status] || statusConfig.healthy;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${s.bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${s.dotColor}`}></div>
      <Icon className={`w-4 h-4 ${s.textColor}`} />
      <span className={`text-sm font-medium ${s.textColor}`}>{config.label}</span>
      {responseTime && (
        <span className="text-xs text-slate-500">({Math.round(responseTime)}ms)</span>
      )}
    </div>
  );
}

// Ligne du Journal de Bord
function HealthReportRow({ report, isLatest }) {
  const date = new Date(report.timestamp);
  
  const colorConfig = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2 },
    orange: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
  };
  
  const c = colorConfig[report.overall_color] || colorConfig.green;
  const StatusIcon = c.icon;
  
  return (
    <div className={`p-4 rounded-xl border ${c.border} ${c.bg} ${isLatest ? 'ring-2 ring-pink-300' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusIcon className={`w-6 h-6 ${c.text}`} />
          <div>
            <p className={`font-bold ${c.text}`}>
              {report.overall_status === 'healthy' ? 'Tous systèmes OK' : 
               report.overall_status === 'degraded' ? 'Performances dégradées' : 
               'Problème détecté'}
            </p>
            <p className="text-xs text-slate-500">
              {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {isLatest && <span className="ml-2 text-pink-500 font-medium">• Dernier rapport</span>}
            </p>
          </div>
        </div>
        
        {/* RAM indicator */}
        {report.memory && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            report.memory.status === 'green' ? 'bg-green-100 text-green-700' :
            report.memory.status === 'orange' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            <Cpu className="w-4 h-4" />
            <span className="text-sm font-medium">{report.memory.ram_mb} MB</span>
          </div>
        )}
      </div>
      
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>{report.summary?.healthy || 0} OK</span>
        </div>
        <div className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{report.summary?.degraded || 0} Dégradé</span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="w-4 h-4" />
          <span>{report.summary?.down || 0} Down</span>
        </div>
      </div>
      
      {/* Components preview */}
      {report.components && (
        <div className="mt-3 flex flex-wrap gap-2">
          {report.components.map((comp, idx) => (
            <ComponentStatusBadge 
              key={idx}
              component={comp.component}
              status={comp.status}
              responseTime={comp.response_time_ms}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Incident Row (simplifié)
function IncidentRow({ incident, onResolve }) {
  const date = new Date(incident.timestamp);
  const config = COMPONENT_CONFIG[incident.component] || { icon: Activity, label: incident.component };
  
  let statusIcon, statusColor, statusLabel;
  if (incident.auto_repair_success) {
    statusIcon = CheckCircle2;
    statusColor = 'text-green-600';
    statusLabel = 'Auto-réparé';
  } else if (incident.alert_sent) {
    statusIcon = XCircle;
    statusColor = 'text-red-600';
    statusLabel = 'Email envoyé';
  } else if (incident.resolved_at) {
    statusIcon = CheckCircle2;
    statusColor = 'text-slate-500';
    statusLabel = 'Résolu';
  } else {
    statusIcon = Clock;
    statusColor = 'text-amber-500';
    statusLabel = 'En cours';
  }
  
  const StatusIcon = statusIcon;
  
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-bold text-slate-700">
            {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </p>
          <p className="text-xs text-slate-500">
            {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-700">{config.label}</p>
          <p className="text-xs text-slate-500 truncate max-w-[250px]">{incident.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1 ${statusColor}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{statusLabel}</span>
        </div>
        {!incident.resolved_at && (
          <Button size="sm" variant="outline" onClick={() => onResolve(incident.id)} className="text-xs">
            Résoudre
          </Button>
        )}
      </div>
    </div>
  );
}

export default function GuardianTab() {
  const [healthReports, setHealthReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Charger les données
  const loadData = useCallback(async () => {
    try {
      const [reportsRes, latestRes, sessionRes, incidentsRes, statsRes] = await Promise.all([
        api.get('/api/guardian/health-reports?limit=10'),
        api.get('/api/guardian/health-reports/latest'),
        api.get('/api/guardian/session-stats'),
        api.get('/api/guardian/incidents?days=7&limit=20'),
        api.get('/api/guardian/stats'),
      ]);
      
      setHealthReports(reportsRes.data.reports || []);
      setLatestReport(latestRes.data);
      setSessionStats(sessionRes.data);
      setIncidents(incidentsRes.data.incidents || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading guardian data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every 1 min
    return () => clearInterval(interval);
  }, [loadData]);
  
  // Forcer une vérification
  const handleForceCheck = async () => {
    setRefreshing(true);
    try {
      await api.post('/api/guardian/test-check');
      toast.success('Vérification effectuée');
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Résoudre un incident
  const handleResolve = async (incidentId) => {
    try {
      await api.post(`/api/guardian/resolve/${incidentId}`);
      toast.success('Incident marqué comme résolu');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la résolution');
    }
  };
  
  // Télécharger le rapport
  const handleDownload = async (format) => {
    try {
      const response = await api.get(`/api/guardian/report/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_guardian_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Rapport ${format.toUpperCase()} téléchargé`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };
  
  if (loading) {
    return (
      <Card className="bg-white rounded-3xl p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-pink-500 animate-spin" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </Card>
    );
  }
  
  // Déterminer le statut global
  const overallColor = latestReport?.overall_color || 'green';
  const statusConfig = {
    green: { color: 'green', icon: CheckCircle2, label: 'Tous les systèmes opérationnels' },
    orange: { color: 'amber', icon: AlertTriangle, label: 'Performances dégradées' },
    red: { color: 'red', icon: XCircle, label: 'Problème détecté' },
  };
  const globalStatus = statusConfig[overallColor] || statusConfig.green;
  const GlobalIcon = globalStatus.icon;
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statut global */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${globalStatus.color}-400 to-${globalStatus.color}-600 flex items-center justify-center shadow-lg`}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Santé du Système</h2>
              <div className={`flex items-center gap-2 text-${globalStatus.color}-600`}>
                <GlobalIcon className="w-5 h-5" />
                <span className="font-medium">{globalStatus.label}</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleForceCheck}
            disabled={refreshing}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Vérifier maintenant
          </Button>
        </div>
        
        {/* Stats rapides avec Zéro Bruit indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats?.uptime_percentage || 100}%</p>
            <p className="text-xs text-green-700">Uptime</p>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-sky-600">{sessionStats?.session_stats?.checks_performed || 0}</p>
            <p className="text-xs text-sky-700">Vérifications</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{sessionStats?.session_stats?.auto_repairs_success || 0}</p>
            <p className="text-xs text-amber-700">Auto-réparés</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{sessionStats?.session_stats?.emails_blocked || 0}</p>
            <p className="text-xs text-purple-700">Emails évités</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{sessionStats?.session_stats?.emails_sent || 0}</p>
            <p className="text-xs text-red-700">Alertes critiques</p>
          </div>
        </div>
      </Card>
      
      {/* Stratégie Zéro Bruit Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-4 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <BellOff className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">Mode Zéro Bruit Actif</p>
            <p className="text-sm text-slate-600">
              Emails uniquement pour pannes critiques (Base de données, Stripe, Serveur). 
              Tous les rapports de routine sont stockés ici, dans le Journal de Bord.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-purple-600">{sessionStats?.session_stats?.emails_blocked || 0}</p>
            <p className="text-xs text-purple-500">emails économisés</p>
          </div>
        </div>
      </Card>
      
      {/* Journal de Bord - 10 derniers rapports */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            Journal de Bord
            <span className="text-sm font-normal text-slate-500">({healthReports.length} derniers rapports)</span>
          </h3>
          <div className="flex gap-2">
            <Button onClick={() => handleDownload('csv')} variant="outline" size="sm" className="rounded-full">
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
            <Button onClick={() => handleDownload('pdf')} variant="outline" size="sm" className="rounded-full">
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
        
        {healthReports.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {healthReports.map((report, index) => (
              <HealthReportRow key={report.id || index} report={report} isLatest={index === 0} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun rapport disponible</p>
            <p className="text-sm text-slate-400">Le premier rapport apparaîtra après la prochaine vérification</p>
          </div>
        )}
      </Card>
      
      {/* Historique des incidents (7 derniers jours) */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Incidents récents
          <span className="text-sm font-normal text-slate-500">(7 derniers jours)</span>
        </h3>
        
        {incidents.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {incidents.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} onResolve={handleResolve} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-700">Aucun incident</p>
            <p className="text-sm text-green-600">Tout fonctionne parfaitement !</p>
          </div>
        )}
      </Card>
      
      {/* Info Stratégie */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Gardien v3.0 - Stratégie Zéro Bruit</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>📊 <strong>Journal de Bord</strong>: Les 10 derniers rapports stockés en base de données</p>
              <p>🔇 <strong>Zéro email</strong> pour les succès, rapports quotidiens et alertes mineures</p>
              <p>🚨 <strong>Alertes ROUGE</strong> uniquement si: Base de données HS, Stripe HS, ou Serveur crashé</p>
              <p>💾 <strong>RAM optimisée</strong>: Nettoyage automatique des vieux rapports</p>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              💡 100% du quota Resend préservé pour les mamans (inscriptions, parrainages)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
