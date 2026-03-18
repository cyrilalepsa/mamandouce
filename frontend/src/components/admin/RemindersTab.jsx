import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Bell, Clock, Mail, Smartphone, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2, Play, Users, Download, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function RemindersTab() {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadDashboard();
    loadAlerts();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.admin.getRemindersDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await api.admin.getSchedulerAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const handleSendNow = async () => {
    setSending(true);
    try {
      await api.admin.sendDueReminders();
      toast.success('Rappels dus envoyés !');
      loadDashboard();
      loadAlerts();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = api.admin.exportRemindersCSV(true);
    // Open in new tab with auth
    window.open(`${url}&token=${token}`, '_blank');
    toast.success('Export CSV en cours...');
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!confirm('Supprimer ce rappel ?')) return;
    try {
      await api.admin.deleteReminder(reminderId);
      toast.success('Rappel supprimé');
      loadDashboard();
      loadAlerts();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'push': return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'both': return (
        <div className="flex gap-1">
          <Smartphone className="w-4 h-4 text-blue-500" />
          <Mail className="w-4 h-4 text-purple-500" />
        </div>
      );
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-3xl p-8 shadow-sm text-center">
        <div className="animate-spin w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-500 mt-3">Chargement...</p>
      </Card>
    );
  }

  const stats = dashboard?.stats || {};
  const scheduler = dashboard?.scheduler || {};
  const history = dashboard?.history || [];
  const recentReminders = dashboard?.recent_reminders || [];
  const usersWithReminders = dashboard?.users_with_reminders || {};

  const filteredReminders = activeFilter === 'all' 
    ? recentReminders 
    : recentReminders.filter(r => activeFilter === 'pending' ? !r.sent : r.sent);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.total || 0}</div>
          <div className="text-blue-100 text-sm">Total rappels</div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.pending || 0}</div>
          <div className="text-amber-100 text-sm">En attente</div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.sent || 0}</div>
          <div className="text-green-100 text-sm">Envoyés</div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.due_now || 0}</div>
          <div className="text-red-100 text-sm">Dus maintenant</div>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.alerts && alerts.alerts.length > 0 && (
        <Card className={`rounded-3xl p-4 shadow-sm border-2 ${
          alerts.health === 'critical' ? 'bg-red-50 border-red-300' :
          alerts.health === 'warning' ? 'bg-amber-50 border-amber-300' :
          'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className={`w-6 h-6 ${
              alerts.health === 'critical' ? 'text-red-500' :
              alerts.health === 'warning' ? 'text-amber-500' :
              'text-green-500'
            }`} />
            <h3 className="font-bold text-slate-700">Alertes Scheduler</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              alerts.health === 'critical' ? 'bg-red-200 text-red-700' :
              alerts.health === 'warning' ? 'bg-amber-200 text-amber-700' :
              'bg-green-200 text-green-700'
            }`}>
              {alerts.health === 'critical' ? 'Critique' :
               alerts.health === 'warning' ? 'Attention' : 'OK'}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.alerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`flex items-start gap-2 p-3 rounded-xl ${
                  alert.level === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                }`}
              >
                {alert.level === 'critical' ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    alert.level === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(alert.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Scheduler Status & Actions */}
      <Card className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Planificateur
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              scheduler.running ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {scheduler.running ? 'Actif' : 'Arrêté'}
            </span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportCSV}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4 py-2 text-sm flex items-center gap-2"
              data-testid="export-csv-btn"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleSendNow}
              disabled={sending || stats.due_now === 0}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-4 py-2 text-sm flex items-center gap-2"
              data-testid="send-reminders-now"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Envoyer
            </Button>
            <Button
              onClick={() => { loadDashboard(); loadAlerts(); }}
              className="bg-slate-100 text-slate-600 rounded-full px-3 py-2"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {scheduler.jobs?.length > 0 && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Prochaine exécution:</span>{' '}
            {formatDate(scheduler.jobs[0]?.next_run)}
          </div>
        )}

        {/* Type Distribution */}
        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600">Push: {stats.by_type?.push || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-purple-500" />
            <span className="text-slate-600">Email: {stats.by_type?.email || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-pink-500" />
            <span className="text-slate-600">Both: {stats.by_type?.both || 0}</span>
          </div>
        </div>
      </Card>

      {/* Users with Reminders */}
      {Object.keys(usersWithReminders).length > 0 && (
        <Card className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-sky-500" />
            Utilisateurs avec rappels
          </h3>
          <div className="space-y-2">
            {Object.entries(usersWithReminders).map(([email, counts]) => (
              <div key={email} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-600 text-sm truncate max-w-[200px]">{email}</span>
                <div className="flex gap-3 text-sm">
                  <span className="text-amber-600">{counts.pending} en attente</span>
                  <span className="text-green-600">{counts.sent} envoyés</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reminders List */}
      <Card className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Rappels récents
          </h3>
          <div className="flex gap-2">
            {['all', 'pending', 'sent'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === filter 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'Tous' : filter === 'pending' ? 'En attente' : 'Envoyés'}
              </button>
            ))}
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Aucun rappel</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredReminders.map(reminder => (
              <div 
                key={reminder.id} 
                className={`p-4 rounded-xl border ${
                  reminder.sent ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-700">{reminder.appointment_title}</div>
                    <div className="text-sm text-slate-500">{reminder.user_email}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(reminder.reminder_datetime)}
                      </span>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(reminder.reminder_type)}
                        {reminder.reminder_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.sent ? (
                      <span className="px-2 py-1 bg-green-200 text-green-700 rounded-full text-xs">Envoyé</span>
                    ) : (
                      <>
                        <span className="px-2 py-1 bg-amber-200 text-amber-700 rounded-full text-xs">En attente</span>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-1 hover:bg-red-100 rounded-full text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* History */}
      <Card className="bg-white rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-500" />
          Historique d'envoi
        </h3>

        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Aucun historique</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.map(entry => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(entry.status)}
                  <div>
                    <div className="font-medium text-slate-700 text-sm">{entry.appointment_title}</div>
                    <div className="text-xs text-slate-500">{entry.user_email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {entry.push_status && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        entry.push_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Push
                      </span>
                    )}
                    {entry.email_status && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        entry.email_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Email
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(entry.sent_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
