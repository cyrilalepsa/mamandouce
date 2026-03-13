import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Shield, Plus, Copy, Check, Users, Gift, AlertTriangle, Apple, Mail, MessageSquare, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// Email admin autorisé
const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('codes');
  
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
  const [userStats, setUserStats] = useState({ total: 0, premium: 0, free: 0 });

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
      loadCodes(),
      loadPendingFoods(),
      loadUsers()
    ]);
    setLoading(false);
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
      setUserStats(response.data.stats || { total: 0, premium: 0, free: 0 });
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
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
    { id: 'codes', label: 'Codes Promo', icon: Gift, count: codeStats.available },
    { id: 'foods', label: 'Aliments', icon: Apple, count: foodStats.pending },
    { id: 'users', label: 'Utilisateurs', icon: Users, count: userStats.total },
  ];

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Administration" />

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-pink-100 text-pink-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

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

        {/* ========== TAB UTILISATEURS ========== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Users className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-700">{userStats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Gift className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">{userStats.premium}</p>
                <p className="text-xs text-slate-500">Premium</p>
              </Card>
              <Card className="bg-white rounded-2xl p-4 text-center">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
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
                  {users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.subscription_status === 'premium' 
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.subscription_status === 'premium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {user.subscription_status === 'premium' ? 'Premium' : 'Gratuit'}
                        </span>
                        {user.created_at && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
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
