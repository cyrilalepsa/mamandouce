import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Megaphone, Mail, Bell, Send, Users, Crown, Gift, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function NewsNotificationsSection() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('both');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    if (history.length > 0) {
      setShowHistory(!showHistory);
      return;
    }
    
    setLoadingHistory(true);
    try {
      const response = await api.admin.getNewsNotifications();
      setHistory(response.data.notifications || []);
      setShowHistory(true);
    } catch (error) {
      toast.error('Erreur chargement historique');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }

    setSending(true);
    try {
      const response = await api.admin.sendNewsNotification({
        title: title.trim(),
        message: message.trim(),
        channel,
        target
      });

      const stats = response.data.stats;
      toast.success(
        `Notification envoyée ! ${stats.email_sent} emails, ${stats.push_sent} push`,
        { duration: 5000 }
      );

      // Reset form
      setTitle('');
      setMessage('');

      // Refresh history
      const historyResponse = await api.admin.getNewsNotifications();
      setHistory(historyResponse.data.notifications || []);
      setShowHistory(true);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-700">Notifier une nouveauté</h3>
          <p className="text-sm text-slate-500">Envoyer une notification à toutes les utilisatrices</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Titre de la nouveauté
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nouvelle fonctionnalité disponible !"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez la nouveauté en quelques lignes..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white resize-none"
          />
        </div>

        {/* Channel selection */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Canal d'envoi
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setChannel('both')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                channel === 'both'
                  ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <Bell className="w-4 h-4" />
              Les deux
            </button>
            <button
              onClick={() => setChannel('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                channel === 'email'
                  ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email seul
            </button>
            <button
              onClick={() => setChannel('push')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                channel === 'push'
                  ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              Push seul
            </button>
          </div>
        </div>

        {/* Target selection */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Destinataires
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTarget('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                target === 'all'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Toutes
            </button>
            <button
              onClick={() => setTarget('premium')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                target === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Crown className="w-4 h-4" />
              Premium
            </button>
            <button
              onClick={() => setTarget('free')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                target === 'free'
                  ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Gift className="w-4 h-4" />
              Gratuites
            </button>
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim()}
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer la notification
            </>
          )}
        </Button>
      </div>

      {/* History toggle */}
      <button
        onClick={loadHistory}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
      >
        <Clock className="w-4 h-4" />
        Historique des notifications
        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* History */}
      {showHistory && (
        <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Aucune notification envoyée</p>
          ) : (
            history.map((notif, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700">{notif.title}</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{notif.message}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {formatDate(notif.sent_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    notif.channel === 'both' ? 'bg-violet-100 text-violet-700' :
                    notif.channel === 'email' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {notif.channel === 'both' ? 'Email + Push' : notif.channel === 'email' ? 'Email' : 'Push'}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    notif.target === 'all' ? 'bg-sky-100 text-sky-700' :
                    notif.target === 'premium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {notif.target === 'all' ? 'Toutes' : notif.target === 'premium' ? 'Premium' : 'Gratuites'}
                  </span>
                  {notif.stats && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3 h-3" />
                      {notif.stats.total_users}
                      <CheckCircle className="w-3 h-3 text-green-500 ml-2" />
                      {(notif.stats.email_sent || 0) + (notif.stats.push_sent || 0)}
                      {(notif.stats.email_failed || 0) + (notif.stats.push_failed || 0) > 0 && (
                        <>
                          <XCircle className="w-3 h-3 text-red-500 ml-1" />
                          {(notif.stats.email_failed || 0) + (notif.stats.push_failed || 0)}
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
