import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Shield, Plus, Copy, Check, Users, Gift, AlertTriangle, Apple, Mail, MessageSquare, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Star, Sparkles, Send, Reply, LayoutDashboard, Eye, TrendingUp, UserPlus, Crown } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// Email admin autorisé
const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

// Composant Messages Tab avec fonctionnalité de réponse
function MessagesTab({ messages, messageStats, loadMessages }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.admin.replyToMessage(messageId, replyText);
      toast.success(response.data.message);
      setReplyText('');
      setExpandedMessage(null);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.admin.markMessageRead(messageId);
      loadMessages();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <MessageSquare className="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-700">{messageStats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Mail className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{messageStats.unread}</p>
          <p className="text-xs text-slate-500">Non lus</p>
        </Card>
      </div>

      {/* Messages List */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Messages reçus</h3>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun message reçu</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`rounded-xl border overflow-hidden ${
                msg.is_read 
                  ? 'bg-slate-50 border-slate-200' 
                  : 'bg-pink-50 border-pink-200'
              }`}>
                {/* Message Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        <h4 className="font-bold text-slate-700">{msg.subject}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{msg.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>De: {msg.user_name || 'Anonyme'} ({msg.user_email})</span>
                        <span>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      {/* Existing Reply Display */}
                      {msg.admin_reply && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Votre réponse :</p>
                          <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Envoyée le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!msg.is_read && (
                        <Button
                          onClick={() => markAsRead(msg.id)}
                          className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {!msg.admin_reply && (
                        <Button
                          onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                          className={`rounded-lg px-3 py-2 ${
                            expandedMessage === msg.id 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                          title="Répondre"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {expandedMessage === msg.id && !msg.admin_reply && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200 animate-fade-in">
                    <p className="text-sm font-semibold text-purple-700 mb-2">Répondre à {msg.user_name || msg.user_email}</p>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      className="w-full rounded-xl border border-purple-200 p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                      data-testid="reply-textarea"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        onClick={() => {
                          setExpandedMessage(null);
                          setReplyText('');
                        }}
                        className="bg-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-300"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={() => handleReply(msg.id)}
                        disabled={sending || !replyText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50"
                        data-testid="send-reply-btn"
                      >
                        {sending ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Un email sera envoyé à {msg.user_email} avec votre réponse.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Global Stats
  const [globalStats, setGlobalStats] = useState({
    users: { total: 0, premium: 0, beta_tester: 0, free: 0 },
    visits: 0,
    registrations: 0,
    unread_messages: 0,
    pending_foods: 0
  });
  
  // Codes promo
  const [codes, setCodes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [codeStats, setCodeStats] = useState({ total: 0, used: 0, available: 0 });
  
  // Aliments proposés
  const [pendingFoods, setPendingFoods] = useState([]);
  const [foodStats, setFoodStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  
  // Utilisateurs
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, premium: 0, beta_tester: 0, free: 0 });

  // Messages
  const [messages, setMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await api.auth.me();
      if (response.data.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        loadAllData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadGlobalStats(),
      loadCodes(),
      loadPendingFoods(),
      loadUsers(),
      loadMessages()
    ]);
    setLoading(false);
  };

  // ========== GLOBAL STATS ==========
  const loadGlobalStats = async () => {
    try {
      const response = await api.admin.getStats();
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // ========== CODES PROMO ==========
  const loadCodes = async () => {
    try {
      const response = await api.admin.getCodes();
      setCodes(response.data.codes || []);
      setCodeStats({
        total: response.data.total || 0,
        used: response.data.used || 0,
        available: response.data.available || 0
      });
    } catch (error) {
      console.error('Erreur chargement codes:', error);
    }
  };

  const generateCodes = async () => {
    if (count < 1 || count > 20) {
      toast.error('Nombre entre 1 et 20');
      return;
    }
    setGenerating(true);
    try {
      await api.admin.generateCodes(count, note);
      toast.success(`${count} code(s) généré(s) !`);
      setNote('');
      loadCodes();
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copié !');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ========== ALIMENTS PROPOSÉS ==========
  const loadPendingFoods = async () => {
    try {
      const response = await api.admin.getPendingFoods();
      setPendingFoods(response.data.foods || []);
      setFoodStats(response.data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('Erreur chargement aliments:', error);
    }
  };

  const handleFoodAction = async (foodId, action) => {
    try {
      await api.admin.updateFoodStatus(foodId, action);
      toast.success(action === 'approved' ? 'Aliment approuvé !' : 'Aliment rejeté');
      loadPendingFoods();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // ========== UTILISATEURS ==========
  const loadUsers = async () => {
    try {
      const response = await api.admin.getUsers();
      setUsers(response.data.users || []);
      setUserStats(response.data.stats || { total: 0, premium: 0, beta_tester: 0, free: 0 });
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  // ========== MESSAGES ==========
  const loadMessages = async () => {
    try {
      const response = await api.admin.getMessages();
      setMessages(response.data.messages || []);
      setMessageStats(response.data.stats || { total: 0, unread: 0 });
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'beta_tester':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Bêta testeuse', icon: Sparkles };
      case 'premium':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Premium', icon: Star };
      default:
        return { bg: 'bg-slate-200', text: 'text-slate-600', label: 'Gratuit', icon: Users };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white rounded-3xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Accès refusé</h2>
            <p className="text-slate-500 mb-4">Vous n'avez pas les droits d'administration.</p>
            <Button onClick={() => navigate('/')} className="bg-sky-500 text-white rounded-full px-6">
              Retour à l'accueil
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: userStats.total },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: messageStats.unread },
    { id: 'foods', label: 'Aliments', icon: Apple, count: foodStats.pending },
    { id: 'codes', label: 'Codes Promo', icon: Gift, count: codeStats.available },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Administration" />

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all min-w-[80px] ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : tab.id === 'messages' && messageStats.unread > 0 ? 'bg-red-100 text-red-600' : 'bg-pink-100 text-pink-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========== TAB DASHBOARD ========== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl p-3 text-white">
                <Eye className="w-3.5 h-3.5 opacity-70 mb-1" />
                <p className="text-xl font-bold">{globalStats.visits}</p>
                <p className="text-[10px] opacity-70">Visites</p>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-3 text-white">
                <UserPlus className="w-3.5 h-3.5 opacity-70 mb-1" />
                <p className="text-xl font-bold">{globalStats.registrations || globalStats.users.total}</p>
                <p className="text-[10px] opacity-70">Inscrits</p>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-3 text-white">
                <Crown className="w-3.5 h-3.5 opacity-70 mb-1" />
                <p className="text-xl font-bold">{globalStats.users.premium}</p>
                <p className="text-[10px] opacity-70">Premium</p>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-3 text-white">
                <Sparkles className="w-3.5 h-3.5 opacity-70 mb-1" />
                <p className="text-xl font-bold">{globalStats.users.beta_tester}</p>
                <p className="text-[10px] opacity-70">Bêta</p>
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
                  <Users className="w-4 h-4 text-slate-300" />
                </div>
              </Card>
              
              <Card className="bg-white rounded-xl p-3 border-l-3 border-red-400 cursor-pointer hover:bg-red-50 transition-colors" onClick={() => globalStats.unread_messages > 0 && setActiveTab('messages')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">Non lus</p>
                    <p className="text-lg font-bold text-red-600">{globalStats.unread_messages}</p>
                  </div>
                  <MessageSquare className="w-4 h-4 text-red-300" />
                </div>
              </Card>
              
              <Card className="bg-white rounded-xl p-3 border-l-3 border-amber-400 cursor-pointer hover:bg-amber-50 transition-colors" onClick={() => globalStats.pending_foods > 0 && setActiveTab('foods')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">En attente</p>
                    <p className="text-lg font-bold text-amber-600">{globalStats.pending_foods}</p>
                  </div>
                  <Apple className="w-4 h-4 text-amber-300" />
                </div>
              </Card>
            </div>

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
          </div>
        )}

        {/* ========== TAB UTILISATEURS ========== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Users className="w-7 h-7 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-700">{userStats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Sparkles className="w-7 h-7 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{userStats.beta_tester}</p>
                <p className="text-xs text-slate-500">Bêta</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Star className="w-7 h-7 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">{userStats.premium}</p>
                <p className="text-xs text-slate-500">Premium</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Users className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-600">{userStats.free}</p>
                <p className="text-xs text-slate-500">Gratuit</p>
              </Card>
            </div>

            {/* Users List */}
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Utilisateurs inscrits</h3>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun utilisateur inscrit</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user, index) => {
                    const statusBadge = getStatusBadge(user.display_status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.display_status === 'beta_tester' 
                              ? 'bg-gradient-to-br from-purple-400 to-purple-500' 
                              : user.display_status === 'premium'
                              ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                              : 'bg-slate-300'
                          }`}>
                            <span className="text-white font-bold text-sm">
                              {(user.name || user.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">{user.name || 'Sans nom'}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                          {user.created_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========== TAB MESSAGES ========== */}
        {activeTab === 'messages' && (
          <MessagesTab 
            messages={messages} 
            messageStats={messageStats} 
            loadMessages={loadMessages}
          />
        )}

        {/* ========== TAB ALIMENTS ========== */}
        {activeTab === 'foods' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">{foodStats.pending}</p>
                <p className="text-xs text-slate-500">En attente</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{foodStats.approved}</p>
                <p className="text-xs text-slate-500">Approuvés</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{foodStats.rejected}</p>
                <p className="text-xs text-slate-500">Rejetés</p>
              </Card>
            </div>

            {/* Pending Foods */}
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Aliments proposés</h3>
              {pendingFoods.length === 0 ? (
                <div className="text-center py-8">
                  <Apple className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun aliment en attente de validation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-700">{food.name}</h4>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                          {food.category && <span>📁 {food.category}</span>}
                          {food.barcode && <span>📊 {food.barcode}</span>}
                        </div>
                        {food.notes && <p className="text-xs text-slate-400 mt-1 italic">{food.notes}</p>}
                        <p className="text-xs text-slate-400 mt-1">Proposé par: {food.user_email || 'Anonyme'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleFoodAction(food.id, 'approved')}
                          className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleFoodAction(food.id, 'rejected')}
                          className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========== TAB CODES PROMO ========== */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-700">{codeStats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{codeStats.used}</p>
                <p className="text-xs text-slate-500">Utilisés</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Clock className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-sky-600">{codeStats.available}</p>
                <p className="text-xs text-slate-500">Disponibles</p>
              </Card>
            </div>

            {/* Generate */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Générer des codes</h3>
              <div className="flex gap-4 flex-wrap">
                <div className="w-24">
                  <label className="text-sm text-slate-600 mb-1 block">Nombre</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-slate-600 mb-1 block">Note (optionnel)</label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: Beta testeuse Marie"
                    className="rounded-xl"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={generateCodes}
                    disabled={generating}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 h-10"
                  >
                    {generating ? '...' : 'Générer'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Codes List */}
            <Card className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Codes générés</h3>
              {codes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Aucun code</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {codes.map((code, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        code.used ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${code.used ? 'text-green-700' : 'text-slate-700'}`}>
                            {code.code}
                          </span>
                          {code.used && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Utilisé</span>
                          )}
                        </div>
                        {code.note && <p className="text-xs text-slate-500">{code.note}</p>}
                        {code.used_by && <p className="text-xs text-green-600">Par: {code.used_by}</p>}
                      </div>
                      {!code.used && (
                        <Button
                          onClick={() => copyCode(code.code)}
                          className={`rounded-lg px-3 py-1 ${
                            copiedCode === code.code ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {copiedCode === code.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
