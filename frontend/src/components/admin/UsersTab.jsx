import { useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Users, Sparkles, Star, Crown, Baby, Shield, ShieldOff, Lock, ChevronDown, ChevronUp, Calendar, Filter, Mail, Send, X } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

// Admin principal permanent
const SUPER_ADMIN_EMAIL = "cyrilalepsa@gmail.com";

const getStatusBadge = (status) => {
  switch (status) {
    case 'beta_tester':
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Bêta testeuse', icon: Sparkles };
    case 'premium':
      return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Premium', icon: Star };
    case 'trial':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Essai', icon: Crown };
    default:
      return { bg: 'bg-slate-200', text: 'text-slate-600', label: 'Gratuit', icon: Users };
  }
};

// Fonction pour grouper les utilisateurs par année et mois
const groupUsersByDate = (users) => {
  const grouped = {};

  users.forEach(user => {
    const parsed = user?.created_at ? new Date(user.created_at) : null;
    const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(0);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }
    grouped[year][month].push(user);
  });

  // Trier les années (plus récentes d'abord)
  const sortedYears = Object.keys(grouped).sort((a, b) => b - a);

  return { grouped, sortedYears };
};

const getMonthName = (monthIndex) => {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[monthIndex];
};

// Composant pour afficher un utilisateur individuel (dépliable)
function UserCard({ user, index, loadUsers }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [internalMessage, setInternalMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const statusBadge = getStatusBadge(user.display_status);
  const StatusIcon = statusBadge.icon;
  const isPremium = user.display_status === 'premium' || user.display_status === 'beta_tester';
  const hasPostpartum = user.postpartum_purchased || user.postpartum_free_via_referral;
  const isAdmin = user.role === 'admin';
  const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    setSendingEmail(true);
    try {
      await api.admin.sendEmailToUser(user.id, emailSubject, emailMessage);
      toast.success(`Email envoyé à ${user.email}`);
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendMessage = async () => {
    if (!internalMessage.trim()) {
      toast.error('Veuillez écrire un message');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await api.admin.sendMessageToUser(user.id, internalMessage);
      const extras = [];
      if (response.data.email_sent) extras.push('email');
      if (response.data.push_sent) extras.push('notification');
      toast.success(`Message envoyé à ${user.email}` + (extras.length ? ` (+ ${extras.join(' & ')})` : ''));
      setShowMessageModal(false);
      setInternalMessage('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <>
    <div className={`border rounded-xl overflow-hidden ${isSuperAdmin ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300' : isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
      {/* Header cliquable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSuperAdmin
              ? 'bg-gradient-to-br from-amber-500 to-red-500'
              : isAdmin
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : user.display_status === 'beta_tester'
              ? 'bg-gradient-to-br from-purple-400 to-purple-500'
              : user.display_status === 'premium'
              ? 'bg-gradient-to-br from-amber-400 to-amber-500'
              : 'bg-slate-300'
          }`}>
            {isSuperAdmin ? (
              <Lock className="w-4 h-4 text-white" />
            ) : isAdmin ? (
              <Shield className="w-4 h-4 text-white" />
            ) : (
              <span className="text-white font-bold text-xs">
                {(user.name || user.email || '?')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-700 text-sm">{user.name || 'Sans nom'}</p>
              {isSuperAdmin && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[10px] rounded-full font-semibold">
                  Super Admin
                </span>
              )}
              {isAdmin && !isSuperAdmin && (
                <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] rounded-full font-semibold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
            <StatusIcon className="w-3 h-3" />
            {statusBadge.label}
          </span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Contenu dépliable */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100">
          {/* Infos supplémentaires */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-500">Inscrit le</p>
              <p className="font-semibold text-slate-700">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Date inconnue'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-500">Post-partum</p>
              <p className={`font-semibold ${hasPostpartum ? 'text-green-600' : 'text-slate-400'}`}>
                {hasPostpartum ? 'Activé' : 'Non activé'}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2">
            {(!isPremium || !hasPostpartum) && (
              <Button
                onClick={async () => {
                  try {
                    if (!isPremium) {
                      await api.admin.setUserPremium(user.id, true);
                    }
                    if (!hasPostpartum) {
                      await api.admin.setUserPostpartum(user.id, true);
                    }
                    toast.success('Premium + Post-partum activés !');
                    loadUsers();
                  } catch (e) {
                    toast.error('Erreur');
                  }
                }}
                data-testid={`grant-full-${index}`}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Sparkles className="w-3 h-3 mr-1 inline" />
                Tout débloquer
              </Button>
            )}

            {isPremium ? (
              <Button
                onClick={async () => {
                  if (window.confirm(`Retirer le premium à ${user.email} ?`)) {
                    try {
                      await api.admin.setUserPremium(user.id, false);
                      toast.success('Premium retiré');
                      loadUsers();
                    } catch (e) {
                      toast.error('Erreur');
                    }
                  }
                }}
                data-testid={`remove-premium-${index}`}
                className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Crown className="w-3 h-3 mr-1 inline" />
                Retirer Premium
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    await api.admin.setUserPremium(user.id, true);
                    toast.success('Premium activé !');
                    loadUsers();
                  } catch (e) {
                    toast.error('Erreur');
                  }
                }}
                data-testid={`grant-premium-${index}`}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Crown className="w-3 h-3 mr-1 inline" />
                Premium
              </Button>
            )}

            {hasPostpartum ? (
              <Button
                onClick={async () => {
                  if (window.confirm(`Retirer le post-partum à ${user.email} ?`)) {
                    try {
                      await api.admin.setUserPostpartum(user.id, false);
                      toast.success('Post-partum retiré');
                      loadUsers();
                    } catch (e) {
                      toast.error('Erreur');
                    }
                  }
                }}
                data-testid={`remove-postpartum-${index}`}
                className="bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Baby className="w-3 h-3 mr-1 inline" />
                Retirer Post-partum
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    await api.admin.setUserPostpartum(user.id, true);
                    toast.success('Post-partum activé !');
                    loadUsers();
                  } catch (e) {
                    toast.error('Erreur');
                  }
                }}
                data-testid={`grant-postpartum-${index}`}
                className="bg-gradient-to-r from-pink-400 to-rose-500 text-white hover:from-pink-500 hover:to-rose-600 rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                <Baby className="w-3 h-3 mr-1 inline" />
                Post-partum
              </Button>
            )}

            {/* Admin toggle - seulement pour le super admin */}
            {!isSuperAdmin && (
              isAdmin ? (
                <Button
                  onClick={async () => {
                    if (window.confirm(`Retirer les droits admin à ${user.email} ?`)) {
                      try {
                        await api.admin.setUserAdmin(user.id, false);
                        toast.success('Droits admin retirés');
                        loadUsers();
                      } catch (e) {
                        toast.error('Erreur');
                      }
                    }
                  }}
                  data-testid={`remove-admin-${index}`}
                  className="bg-red-100 text-red-700 hover:bg-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <ShieldOff className="w-3 h-3 mr-1 inline" />
                  Retirer Admin
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    if (window.confirm(`Donner les droits admin à ${user.email} ?`)) {
                      try {
                        await api.admin.setUserAdmin(user.id, true);
                        toast.success('Droits admin accordés !');
                        loadUsers();
                      } catch (e) {
                        toast.error('Erreur');
                      }
                    }
                  }}
                  data-testid={`grant-admin-${index}`}
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  <Shield className="w-3 h-3 mr-1 inline" />
                  Admin
                </Button>
              )
            )}

            {/* Bouton envoyer email */}
            <Button
              onClick={() => setShowEmailModal(true)}
              data-testid={`send-email-${index}`}
              className="bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Mail className="w-3 h-3 mr-1 inline" />
              Email
            </Button>

            {/* Bouton envoyer message interne */}
            <Button
              onClick={() => setShowMessageModal(true)}
              data-testid={`send-message-${index}`}
              className="bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <Send className="w-3 h-3 mr-1 inline" />
              Message
            </Button>
          </div>

          {/* Bouton fermer en bas */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full mt-4 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all duration-200 text-slate-600"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      )}
    </div>

    {/* Modal d'envoi d'email */}
    {showEmailModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-700">Envoyer un email</h3>
              <p className="text-xs text-slate-500">À : {user.email}</p>
            </div>
            <button
              onClick={() => setShowEmailModal(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sujet</label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Ex: Information importante"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Votre message..."
                rows={5}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2 justify-end">
            <Button
              onClick={() => setShowEmailModal(false)}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-4"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 rounded-xl px-4"
            >
              {sendingEmail ? (
                <>Envoi...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1 inline" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Modal d'envoi de message interne */}
    {showMessageModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-700">Envoyer un message</h3>
              <p className="text-xs text-slate-500">À : {user.name || user.email}</p>
              <p className="text-[10px] text-pink-500">Visible dans "Mes messages" + Email + Notification</p>
            </div>
            <button
              onClick={() => setShowMessageModal(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="p-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Votre message</label>
            <textarea
              value={internalMessage}
              onChange={(e) => setInternalMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2 justify-end">
            <Button
              onClick={() => setShowMessageModal(false)}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-4"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 rounded-xl px-4"
            >
              {sendingMessage ? (
                <>Envoi...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1 inline" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export function UsersTab({
  users = [],
  testUsers = [],
  userStats = {},
  loadUsers = () => {},
}) {
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // all, premium, free, trial
  const [showTestUsers, setShowTestUsers] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTestUsers = Array.isArray(testUsers) ? testUsers : [];
  const safeStats = {
    total: Number(userStats?.total) || 0,
    premium: Number(userStats?.premium) || 0,
    beta_tester: Number(userStats?.beta_tester) || 0,
    trial: Number(userStats?.trial) || 0,
    free: Number(userStats?.free) || 0,
  };

  // Filtrer les utilisateurs selon le statut
  const filteredUsers = useMemo(() => safeUsers.filter(user => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'premium') return user?.display_status === 'premium' || user?.display_status === 'beta_tester';
    if (filterStatus === 'trial') return user?.display_status === 'trial';
    if (filterStatus === 'free') return user?.display_status === 'free' || !user?.display_status;
    return true;
  }), [safeUsers, filterStatus]);

  const { grouped, sortedYears } = useMemo(
    () => groupUsersByDate(filteredUsers),
    [filteredUsers],
  );

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (year, month) => {
    const key = `${year}-${month}`;
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Stats - uniquement les vrais utilisateurs */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Users className="w-7 h-7 text-sky-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-700">{safeStats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Sparkles className="w-7 h-7 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{safeStats.beta_tester}</p>
          <p className="text-xs text-slate-500">Bêta</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Star className="w-7 h-7 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-600">{safeStats.premium}</p>
          <p className="text-xs text-slate-500">Premium</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Users className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-600">{safeStats.free}</p>
          <p className="text-xs text-slate-500">Gratuit</p>
        </Card>
      </div>

      {/* Carte des utilisateurs de test - toujours visible pour l'admin */}
      {safeTestUsers.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-dashed border-orange-300 rounded-3xl p-4">
          <button
            onClick={() => setShowTestUsers(!showTestUsers)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🧪</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-orange-700">Utilisateurs de test</p>
                <p className="text-xs text-orange-500">
                  {safeTestUsers.length} compte{safeTestUsers.length > 1 ? 's' : ''} test (non comptés dans les stats)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full font-medium">
                Comptes internes
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showTestUsers ? 'bg-orange-200 text-orange-700' : 'bg-orange-100 text-orange-400'}`}>
                {showTestUsers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </button>

          {showTestUsers && (
            <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
              {safeTestUsers.map((user, idx) => (
                <div
                  key={user.id || idx}
                  className="bg-white/80 border border-orange-200 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xs">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{user.name || 'Sans nom'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Test
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Users List with filters */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Utilisateurs inscrits
          </h3>

          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">Tous ({safeUsers.length})</option>
              <option value="premium">Premium</option>
              <option value="trial">En essai</option>
              <option value="free">Gratuit</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {sortedYears.map((year) => {
              const isYearExpanded = expandedYears[year] === true;
              const monthsInYear = Object.keys(grouped[year]).sort((a, b) => b - a);
              const totalUsersInYear = monthsInYear.reduce((sum, month) => sum + grouped[year][month].length, 0);

              return (
                <div key={year} className="border-2 border-slate-300 rounded-xl overflow-hidden">
                  {/* Header Année — fond coloré, texte foncé */}
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                    style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 100%)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">{year.slice(-2)}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-base">{year}</p>
                        <p className="text-xs text-slate-600 font-medium">{totalUsersInYear} utilisateur{totalUsersInYear > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isYearExpanded ? 'bg-sky-200 text-sky-700' : 'bg-slate-100 text-slate-400'}`}>
                      {isYearExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Contenu Année (mois) */}
                  {isYearExpanded && (
                    <div className="p-2 space-y-2">
                      {monthsInYear.map((month) => {
                        const monthKey = `${year}-${month}`;
                        const isMonthExpanded = expandedMonths[monthKey] === true;
                        const usersInMonth = grouped[year][month];

                        return (
                          <div key={monthKey} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Header Mois — fond rose, texte foncé */}
                            <button
                              onClick={() => toggleMonth(year, month)}
                              className="w-full px-3 py-2 flex items-center justify-between transition-colors"
                              style={{ background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)' }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center">
                                  <span className="font-semibold text-xs">{getMonthName(parseInt(month)).slice(0, 3)}</span>
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-slate-800 text-sm">{getMonthName(parseInt(month))}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                  {usersInMonth.length}
                                </span>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isMonthExpanded ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'}`}>
                                  {isMonthExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </button>

                            {/* Liste des utilisateurs du mois */}
                            {isMonthExpanded && (
                              <div className="p-2 space-y-2 bg-white">
                                {usersInMonth.map((user, idx) => (
                                  <UserCard
                                    key={user.id || idx}
                                    user={user}
                                    index={idx}
                                    loadUsers={loadUsers}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
