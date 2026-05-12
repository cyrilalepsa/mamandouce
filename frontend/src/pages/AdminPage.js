import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertTriangle, Users, Gift, Apple, MessageSquare, LayoutDashboard, HandCoins, Eye, Crown, Baby, ChevronDown, Bell, Smartphone, Shield, HandHeart, Calculator, CheckCircle, Brain, Image } from 'lucide-react';
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
import NeriaCorpScannerTab from '../components/admin/NeriaCorpScannerTab';
import FlyerGenerator from '../components/FlyerModule/FlyerGenerator';

function AdminPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // kept for sub-component compat
  
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
  
  // Tiroirs accordéon
  const [openDrawers, setOpenDrawers] = useState({ community: true });
  // Sous-accordéons imbriqués
  const [openSubs, setOpenSubs] = useState({});

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

  const toggleDrawer = (id) => {
    setOpenDrawers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const drawerColors = {
    community: '#E9D5FF, #D8B4FE',  // lilas
    messaging: '#FECDD3, #FDA4AF',   // rose
    finances:  '#A7F3D0, #6EE7B7',   // menthe
    tools:     '#BAE6FD, #7DD3FC',   // bleu
    neriacorp: '#FEF3C7, #FCD34D',   // or (Section Spéciale)
    flyer:     '#FBCFE8, #F9A8D4',   // rose pastel (Marketing)
  };

  const toggleSub = (id) => setOpenSubs(prev => ({ ...prev, [id]: !prev[id] }));

  const SubDrawer = ({ id, label, icon: SIcon, children, defaultOpen }) => {
    const isOpen = openSubs[id] ?? defaultOpen ?? false;
    return (
      <div className="rounded-2xl bg-white border border-slate-200 mb-2" style={{ overflow:'hidden' }}>
        <button
          onClick={() => toggleSub(id)}
          data-testid={`sub-${id}`}
          className="w-full px-4 py-3 flex items-center justify-between"
          style={{ background:'transparent' }}
        >
          <div className="flex items-center gap-2">
            {SIcon && <SIcon className="w-4 h-4" style={{ color:'#6B21A8' }} />}
            <span style={{ color:'#000000', fontWeight:700, fontSize:'13px' }}>{label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color:'#64748b' }} />
        </button>
        {isOpen && (
          <div className="px-3 pb-3" style={{ color:'#000000' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const DrawerTile = ({ id, icon: Icon, label, children, count }) => {
    const colors = drawerColors[id] || drawerColors.community;
    return (
      <div className="admin-drawer rounded-3xl" data-testid={`drawer-${id}-wrap`} style={{
        background: `linear-gradient(145deg, ${colors})`,
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: openDrawers[id]
          ? '0 4px 10px rgba(0,0,0,0.1), inset 0 -3px 6px rgba(0,0,0,0.08), inset 0 3px 6px rgba(255,255,255,0.6)'
          : '0 10px 20px rgba(0,0,0,0.15), inset 0 -5px 10px rgba(0,0,0,0.1), inset 0 5px 10px rgba(255,255,255,0.8)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Reflet glossy subtil */}
        <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:'35%', background:'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)', borderRadius:'inherit', pointerEvents:'none', zIndex:1 }} />
        
        <button
          onClick={() => toggleDrawer(id)}
          data-testid={`drawer-${id}`}
          className="w-full px-5 py-5 flex items-center justify-between relative z-10 active:scale-[0.98]"
          style={{ background:'transparent', transition:'transform 0.15s ease' }}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7" style={{ color:'#000000' }} strokeWidth={2.5} />
            <span style={{ color:'#000000', fontWeight:900, fontSize:'15px', letterSpacing:'0.5px' }}>{label}</span>
            {count > 0 && (
              <span className="rounded-full text-xs font-bold px-2.5 py-0.5" style={{ background:'rgba(0,0,0,0.12)', color:'#000000' }}>{count}</span>
            )}
          </div>
          <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${openDrawers[id] ? 'rotate-180' : ''}`} style={{ color:'#000000' }} />
        </button>
        
        {openDrawers[id] && (
          <div className="px-3 pb-4" style={{ color:'#000000' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between pt-2 pb-1">
          <PageHeader title="Administration" />
          <GuardianStatusIndicator onClick={() => toggleDrawer('tools')} />
        </div>

        {/* 1. VIOLET — GESTION COMMUNAUTÉ */}
        <DrawerTile id="community" icon={Users} label="GESTION COMMUNAUTÉ" count={userStats.total}>
          <SubDrawer id="inscrites" label="Liste des Inscrites" icon={Users} defaultOpen={false}>
            <UsersTab users={users} testUsers={testUsers} userStats={userStats} loadUsers={loadUsers} />
          </SubDrawer>
          <SubDrawer id="contributions" label="Contributions à valider" icon={CheckCircle}>
            <ContributionsManager />
          </SubDrawer>
          <SubDrawer id="solidarity" label="Solidarité" icon={HandHeart}>
            <SolidarityTab />
          </SubDrawer>
        </DrawerTile>

        {/* 2. ROSE — MESSAGERIE & SUPPORT */}
        <DrawerTile id="messaging" icon={MessageSquare} label="MESSAGERIE & SUPPORT" count={messageStats.unread}>
          <SubDrawer id="messages" label="Messages reçus" icon={MessageSquare}>
            <MessagesTab messages={messages} messageStats={messageStats} loadMessages={loadMessages} />
          </SubDrawer>
          <SubDrawer id="reminders" label="Rappels & Notifications" icon={Bell}>
            <RemindersTab />
          </SubDrawer>
        </DrawerTile>

        {/* 3. VERT — FINANCES & STRIPE */}
        <DrawerTile id="finances" icon={HandCoins} label="FINANCES & STRIPE" count={refundStats.pending}>
          <SubDrawer id="stats" label="Tableau de bord" icon={LayoutDashboard}>
            <DashboardTab globalStats={globalStats} codeStats={codeStats} setActiveTab={() => {}} messageStats={messageStats} />
          </SubDrawer>
          <SubDrawer id="accounting" label="Expert IA Comptable" icon={Calculator}>
            <AccountingDashboard />
          </SubDrawer>
          <SubDrawer id="codes" label="Codes Promo" icon={Gift}>
            <CodesTab codes={codes} codeStats={codeStats} loadCodes={loadCodes} />
          </SubDrawer>
          <SubDrawer id="refunds" label="Remboursements" icon={HandCoins}>
            <RefundsTab refundRequests={refundRequests} refundStats={refundStats} loadRefundRequests={loadRefundRequests} />
          </SubDrawer>
        </DrawerTile>

        {/* 4. BLEU — OUTILS BUSINESS & BUILDS */}
        <DrawerTile id="tools" icon={Smartphone} label="OUTILS BUSINESS & BUILDS">
          <SubDrawer id="android" label="Kit Business & Play Store" icon={Smartphone}>
            <AndroidExportTab />
          </SubDrawer>
          <SubDrawer id="guardian" label="Santé de l'App" icon={Shield}>
            <GuardianTab />
          </SubDrawer>
          <SubDrawer id="foods" label="Aliments à valider" icon={Apple}>
            <FoodsTab pendingFoods={pendingFoods} foodStats={foodStats} loadPendingFoods={loadPendingFoods} />
          </SubDrawer>
        </DrawerTile>

        {/* 5. OR — SECTION SPÉCIALE NeriaCorp Intelligence (Admin-Only, isolée) */}
        <DrawerTile id="neriacorp" icon={Brain} label="🧠 NeriaCorp Intelligence">
          <SubDrawer id="neriacorp-scanner" label="Scanner IA Admin-Only" icon={Brain} defaultOpen={true}>
            <NeriaCorpScannerTab />
          </SubDrawer>
        </DrawerTile>

        {/* 6. ROSE — FLYER MARKETING (squelette, à compléter) */}
        <DrawerTile id="flyer" icon={Image} label="🖼️ Flyer Marketing">
          <SubDrawer id="flyer-generator" label="Neria Creative" icon={Image} defaultOpen={true}>
            <FlyerGenerator />
          </SubDrawer>
        </DrawerTile>

        <div className="h-20" />
      </div>
    </div>
  );
}

export default AdminPage;
