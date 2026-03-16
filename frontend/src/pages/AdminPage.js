import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertTriangle, Users, Gift, Apple, MessageSquare, LayoutDashboard, RefreshCw, Eye, Crown, Baby, ChevronDown, Bell, Smartphone } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/PageHeader';
import { toast } from 'sonner';
import {
  DashboardTab,
  UsersTab,
  MessagesTab,
  FoodsTab,
  CodesTab,
  RefundsTab,
  RemindersTab,
  AndroidExportTab
} from '../components/admin';

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
  
  // Refund Requests
  const [refundRequests, setRefundRequests] = useState([]);
  const [refundStats, setRefundStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  
  // Menu "Voir comme"
  const [showViewMenu, setShowViewMenu] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await api.auth.me();
      if (response.data.role === 'admin') {
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
      loadMessages(),
      loadRefundRequests()
    ]);
    setLoading(false);
  };

  const loadGlobalStats = async () => {
    try {
      const response = await api.admin.getStats();
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

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

  const loadPendingFoods = async () => {
    try {
      const response = await api.admin.getPendingFoods();
      setPendingFoods(response.data.foods || []);
      setFoodStats(response.data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error('Erreur chargement aliments:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.admin.getUsers();
      setUsers(response.data.users || []);
      setUserStats(response.data.stats || { total: 0, premium: 0, beta_tester: 0, free: 0 });
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.admin.getMessages();
      setMessages(response.data.messages || []);
      setMessageStats(response.data.stats || { total: 0, unread: 0 });
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };
  
  const loadRefundRequests = async () => {
    try {
      const response = await api.admin.getRefundRequests();
      const requests = response.data.requests || [];
      setRefundRequests(requests);
      
      const pending = requests.filter(r => r.status === 'pending').length;
      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      setRefundStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Erreur chargement remboursements:', error);
    }
  };

  const handleViewAs = async (mode) => {
    setShowViewMenu(false);
    
    if (mode === 'premium') {
      // Activer temporairement premium + postpartum pour l'admin
      try {
        const response = await api.auth.getMe();
        const userId = response.data.id;
        
        // Activer premium et postpartum
        await api.admin.setUserPremium(userId, true);
        await api.admin.setUserPostpartum(userId, true);
        
        toast.success('Mode Premium + Post-partum activé !');
        navigate('/');
      } catch (error) {
        toast.error('Erreur lors de l\'activation');
        console.error(error);
      }
    } else {
      // Mode utilisateur normal
      navigate('/');
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
    { id: 'reminders', label: 'Rappels', icon: Bell, count: null },
    { id: 'foods', label: 'Aliments', icon: Apple, count: foodStats.pending },
    { id: 'codes', label: 'Codes Promo', icon: Gift, count: codeStats.available },
    { id: 'refunds', label: 'Remboursements', icon: RefreshCw, count: refundStats.pending },
    { id: 'android', label: 'Android', icon: Smartphone, count: null },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <PageHeader title="Administration" />
          
          {/* Menu "Voir comme" */}
          <div className="relative">
            <Button
              onClick={() => setShowViewMenu(!showViewMenu)}
              data-testid="view-as-menu-btn"
              className="bg-gradient-to-r from-sky-500 to-purple-500 text-white rounded-full px-4 py-2 hover:opacity-90 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir comme...
              <ChevronDown className={`w-4 h-4 transition-transform ${showViewMenu ? 'rotate-180' : ''}`} />
            </Button>
            
            {showViewMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[220px] animate-fade-in">
                <button
                  onClick={() => handleViewAs('normal')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Utilisateur gratuit</p>
                    <p className="text-xs text-slate-500">Interface de base</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleViewAs('premium')}
                  className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center gap-3 transition-colors border-t border-slate-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Premium complet</p>
                    <p className="text-xs text-slate-500">Premium + Post-partum activés</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

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

        {activeTab === 'dashboard' && (
          <DashboardTab 
            globalStats={globalStats}
            codeStats={codeStats}
            setActiveTab={setActiveTab}
            messageStats={messageStats}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            userStats={userStats}
            loadUsers={loadUsers}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab 
            messages={messages}
            messageStats={messageStats}
            loadMessages={loadMessages}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab />
        )}

        {activeTab === 'foods' && (
          <FoodsTab 
            pendingFoods={pendingFoods}
            foodStats={foodStats}
            loadPendingFoods={loadPendingFoods}
          />
        )}

        {activeTab === 'codes' && (
          <CodesTab 
            codes={codes}
            codeStats={codeStats}
            loadCodes={loadCodes}
          />
        )}

        {activeTab === 'refunds' && (
          <RefundsTab 
            refundRequests={refundRequests}
            refundStats={refundStats}
            loadRefundRequests={loadRefundRequests}
          />
        )}

        {activeTab === 'android' && (
          <AndroidExportTab />
        )}
      </div>
    </div>
  );
}

export default AdminPage;
