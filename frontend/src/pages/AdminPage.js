import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertTriangle, Users, Gift, Apple, MessageSquare, LayoutDashboard, HandCoins, Eye, Crown, Baby, ChevronDown, Bell, Smartphone, Shield, HandHeart, Calculator, CheckCircle } from 'lucide-react';
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
  AndroidExportTab,
  GuardianTab,
  GuardianStatusIndicator,
  SolidarityTab
} from '../components/admin';
import AccountingDashboard from '../components/admin/AccountingDashboard';
import ContributionsManager from '../components/admin/ContributionsManager';

function AdminPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  
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
  const [testUsers, setTestUsers] = useState([]);
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
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      
      const response = await api.auth.me();
      const ADMIN_EMAIL = "cyrilalepsa@gmail.com";
      // Check role OR email for admin access
      if (response.data.role === 'admin' || response.data.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        loadAllData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      // Only redirect if it's a 401 (unauthorized), not network errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      } else {
        // Retry once after a short delay for network errors
        setTimeout(async () => {
          try {
            const response = await api.auth.me();
            const ADMIN_EMAIL = "cyrilalepsa@gmail.com";
            if (response.data.role === 'admin' || response.data.email === ADMIN_EMAIL) {
              setIsAdmin(true);
              loadAllData();
            } else {
              setIsAdmin(false);
              setLoading(false);
            }
          } catch (retryError) {
            navigate('/auth');
          }
        }, 1000);
      }
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
      setTestUsers(response.data.test_users || []);
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
        
        toast.success(t('admin.premiumModeActivated'));
        navigate('/');
      } catch (error) {
        toast.error(t('admin.activationError'));
        console.error(error);
      }
    } else {
      // Mode utilisateur gratuit - désactiver premium et postpartum
      try {
        const response = await api.auth.getMe();
        const userId = response.data.id;
        
        // Désactiver premium et postpartum
        await api.admin.setUserPremium(userId, false);
        await api.admin.setUserPostpartum(userId, false);
        
        toast.success(t('admin.freeModeActivated'));
        navigate('/');
      } catch (error) {
        toast.error(t('admin.deactivationError'));
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">{t('common.loading')}</p>
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
            <h2 className="text-2xl font-bold text-slate-700 mb-2">{t('admin.accessDenied')}</h2>
            <p className="text-slate-500 mb-4">{t('admin.noPermission')}</p>
            <Button onClick={() => navigate('/')} className="bg-sky-500 text-white rounded-full px-6">
              {t('admin.backToHome')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Inscrites', icon: Users, count: userStats.total },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: messageStats.unread },
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, count: null },
    { id: 'refunds', label: 'Remboursements', icon: HandCoins, count: refundStats.pending },
    { id: 'codes', label: 'Codes promo', icon: Gift, count: codeStats.available },
    { id: 'accounting', label: 'Expert IA', icon: Calculator, count: null },
    { id: 'contributions', label: 'Contributions', icon: CheckCircle, count: null },
    { id: 'foods', label: 'Aliments', icon: Apple, count: foodStats.pending },
    { id: 'reminders', label: 'Rappels', icon: Bell, count: null },
    { id: 'guardian', label: 'Santé App', icon: Shield, count: null },
    { id: 'solidarity', label: 'Solidarité', icon: HandHeart, count: null },
    { id: 'android', label: 'Android', icon: Smartphone, count: null },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PageHeader title="Administration" />
            {/* Voyant lumineux Guardian */}
            <GuardianStatusIndicator onClick={() => setActiveTab('guardian')} />
          </div>
          
          {/* Menu "Voir comme" */}
          <div className="relative">
            <Button
              onClick={() => setShowViewMenu(!showViewMenu)}
              data-testid="view-as-menu-btn"
              className="bg-gradient-to-r from-sky-500 to-purple-500 text-white rounded-full px-4 py-2 hover:opacity-90 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {t('admin.viewAs')}
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
                    <p className="font-semibold text-slate-700">{t('admin.freeUser')}</p>
                    <p className="text-xs text-slate-500">{t('admin.basicInterface')}</p>
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
                    <p className="font-semibold text-slate-700">{t('admin.fullPremium')}</p>
                    <p className="text-xs text-slate-500">{t('admin.premiumPostpartumActive')}</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs — 2 boutons principaux + menu déroulant pour le reste */}
        <div className="space-y-2">
          {/* ROW 1 : Inscrites + Messages — toujours visibles */}
          <div className="grid grid-cols-2 gap-3">
            {tabs.slice(0, 2).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`admin-tab-${tab.id}`}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-700'
                }`}
                style={activeTab === tab.id ? {
                  background: tab.id === 'users' 
                    ? 'linear-gradient(135deg, #C084FC, #A855F7)' 
                    : 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                  boxShadow: '0 4px 15px rgba(168,85,247,0.4)'
                } : {
                  background: tab.id === 'users'
                    ? 'linear-gradient(135deg, #F3E8FF, #EDE9FE)'
                    : 'linear-gradient(135deg, #E0F2FE, #DBEAFE)',
                  boxShadow: '6px 6px 14px #D1D9E6, -6px -6px 14px #FFFFFF'
                }}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-white text-purple-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* ROW 2 : Autres onglets — scrollable */}
          <div className="flex gap-2 rounded-2xl p-2 overflow-x-auto" style={{ background: 'linear-gradient(135deg, #FFF5F7, #F0F4FF)', boxShadow: '6px 6px 14px #D1D9E6, -6px -6px 14px #FFFFFF' }}>
            {tabs.slice(2).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`admin-tab-${tab.id}`}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold transition-all min-w-fit whitespace-nowrap text-xs ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardTab 
            globalStats={globalStats}
            codeStats={codeStats}
            setActiveTab={setActiveTab}
            messageStats={messageStats}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingDashboard />
        )}

        {activeTab === 'contributions' && (
          <ContributionsManager />
        )}

        {activeTab === 'guardian' && (
          <GuardianTab />
        )}

        {activeTab === 'solidarity' && (
          <SolidarityTab />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            testUsers={testUsers}
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
