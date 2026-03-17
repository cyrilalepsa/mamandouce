import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Users, Sparkles, Star, Crown, Baby, Shield, ShieldOff, Lock } from 'lucide-react';
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
    default:
      return { bg: 'bg-slate-200', text: 'text-slate-600', label: 'Gratuit', icon: Users };
  }
};

export function UsersTab({ users, userStats, loadUsers }) {
  return (
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
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {users.map((user, index) => {
              const statusBadge = getStatusBadge(user.display_status);
              const StatusIcon = statusBadge.icon;
              const isPremium = user.display_status === 'premium' || user.display_status === 'beta_tester';
              const hasPostpartum = user.postpartum_purchased || user.postpartum_free_via_referral;
              const isAdmin = user.role === 'admin';
              const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
              
              return (
                <div key={index} className={`p-4 border rounded-xl ${isSuperAdmin ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300' : isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
                          <Lock className="w-5 h-5 text-white" />
                        ) : isAdmin ? (
                          <Shield className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {(user.name || user.email || '?')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-700">{user.name || 'Sans nom'}</p>
                          {isSuperAdmin ? (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Super Admin
                            </span>
                          ) : isAdmin && (
                            <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
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
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                    {/* Bouton combiné Premium + Post-partum */}
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
                        Donner Premium
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
                        className="bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
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
                        className="bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:from-rose-500 hover:to-pink-600 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        <Baby className="w-3 h-3 mr-1 inline" />
                        Donner Post-partum
                      </Button>
                    )}
                    
                    {/* Admin toggle - pas de modification possible pour le super admin */}
                    {isSuperAdmin ? (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-red-100 text-amber-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Admin permanent
                      </div>
                    ) : isAdmin ? (
                      <Button
                        onClick={async () => {
                          if (window.confirm(`Retirer les droits admin à ${user.email} ?`)) {
                            try {
                              await api.admin.setUserRole(user.id, 'user');
                              toast.success('Droits admin retirés');
                              loadUsers();
                            } catch (e) {
                              toast.error(e.response?.data?.detail || 'Erreur');
                            }
                          }
                        }}
                        data-testid={`remove-admin-${index}`}
                        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        <ShieldOff className="w-3 h-3 mr-1 inline" />
                        Retirer Admin
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          if (window.confirm(`Promouvoir ${user.email} en administrateur ?`)) {
                            try {
                              await api.admin.setUserRole(user.id, 'admin');
                              toast.success('Utilisateur promu admin !');
                              loadUsers();
                            } catch (e) {
                              toast.error(e.response?.data?.detail || 'Erreur');
                            }
                          }
                        }}
                        data-testid={`grant-admin-${index}`}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        <Shield className="w-3 h-3 mr-1 inline" />
                        Promouvoir Admin
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
