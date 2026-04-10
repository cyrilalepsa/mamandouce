/**
 * SolidarityTab - Onglet Admin pour gérer la solidarité
 * Contributions, Relais Maman, Bons d'achat
 */
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  HandHeart, Gift, Users, CheckCircle2, XCircle, Clock, 
  FileText, Send, TrendingUp, Heart, RefreshCw, ChevronDown,
  Award, MessageSquare
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export default function SolidarityTab() {
  const [activeSection, setActiveSection] = useState('contributions');
  const [contributions, setContributions] = useState([]);
  const [relaisData, setRelaisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  // Distribution form
  const [distribEmail, setDistribEmail] = useState('');
  const [distribAmount, setDistribAmount] = useState('');
  const [distribReason, setDistribReason] = useState('');
  const [distributing, setDistributing] = useState(false);
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contribRes, relaisRes] = await Promise.all([
        api.get(`/api/solidarity/admin/contributions?status=${filterStatus}`),
        api.get('/api/solidarity/admin/relais-maman')
      ]);
      setContributions(contribRes.data.contributions || []);
      setRelaisData(relaisRes.data);
    } catch (error) {
      console.error('Error loading solidarity data:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleValidateContrib = async (id) => {
    try {
      await api.post(`/api/solidarity/admin/contributions/${id}/validate`);
      toast.success('Contribution validée et 1€ crédité');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };
  
  const handleRejectContrib = async (id) => {
    try {
      await api.post(`/api/solidarity/admin/contributions/${id}/reject?reason=Non conforme`);
      toast.success('Contribution rejetée');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };
  
  const handleDistribute = async () => {
    if (!distribEmail || !distribAmount || !distribReason) {
      toast.error('Tous les champs sont requis');
      return;
    }
    
    setDistributing(true);
    try {
      const response = await api.post('/api/solidarity/admin/relais-maman/distribute', null, {
        params: {
          recipient_email: distribEmail,
          amount: parseFloat(distribAmount),
          reason: distribReason
        }
      });
      toast.success(`Bon de ${distribAmount}€ envoyé! Code: ${response.data.gift_card_code}`);
      setDistribEmail('');
      setDistribAmount('');
      setDistribReason('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setDistributing(false);
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
  
  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <HandHeart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Solidarité</h2>
            <p className="text-slate-500">Gestion des contributions et du Relais Maman</p>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{relaisData?.total_collected || 0}€</p>
            <p className="text-xs text-purple-700">Total collecté</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{relaisData?.available_balance || 0}€</p>
            <p className="text-xs text-green-700">Disponible</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-pink-600">{relaisData?.donations?.length || 0}</p>
            <p className="text-xs text-pink-700">Donations</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{contributions.length}</p>
            <p className="text-xs text-amber-700">Contributions en attente</p>
          </div>
        </div>
      </Card>
      
      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'contributions', label: 'Contributions', icon: MessageSquare },
          { id: 'relais', label: 'Relais Maman', icon: HandHeart },
          { id: 'archives', label: 'Archivages', icon: FileText },
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            variant={activeSection === tab.id ? 'default' : 'outline'}
            className={`rounded-full flex-shrink-0 ${
              activeSection === tab.id 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>
      
      {/* Contributions section */}
      {activeSection === 'contributions' && (
        <Card className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Contributions à valider
            </h3>
            <div className="flex gap-2">
              {['pending', 'validated', 'rejected'].map(status => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  className={`rounded-full text-xs ${
                    filterStatus === status ? 'bg-purple-500 text-white' : ''
                  }`}
                >
                  {status === 'pending' ? 'En attente' : status === 'validated' ? 'Validées' : 'Rejetées'}
                </Button>
              ))}
            </div>
          </div>
          
          {contributions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune contribution {filterStatus === 'pending' ? 'en attente' : ''}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {contributions.map(contrib => (
                <div key={contrib.id} className="border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          contrib.type === 'tip' ? 'bg-blue-100 text-blue-700' :
                          contrib.type === 'recipe' ? 'bg-green-100 text-green-700' :
                          contrib.type === 'advice' ? 'bg-purple-100 text-purple-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {contrib.type}
                        </span>
                        <span className="text-xs text-slate-500">{contrib.user_name}</span>
                      </div>
                      <p className="font-medium text-slate-800">{contrib.title}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{contrib.content}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(contrib.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {filterStatus === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleValidateContrib(contrib.id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRejectContrib(contrib.id)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* Relais Maman section */}
      {activeSection === 'relais' && (
        <div className="space-y-6">
          {/* Distribution form */}
          <Card className="bg-white rounded-3xl p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Distribuer un bon Relais Maman
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="email"
                placeholder="Email bénéficiaire"
                value={distribEmail}
                onChange={(e) => setDistribEmail(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="number"
                placeholder="Montant (€)"
                value={distribAmount}
                onChange={(e) => setDistribAmount(e.target.value)}
                className="rounded-xl"
              />
              <Input
                type="text"
                placeholder="Raison"
                value={distribReason}
                onChange={(e) => setDistribReason(e.target.value)}
                className="rounded-xl"
              />
            </div>
            
            <Button
              onClick={handleDistribute}
              disabled={distributing || !distribEmail || !distribAmount || !distribReason}
              className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {distributing ? 'Envoi...' : 'Envoyer le bon'}
            </Button>
            
            <p className="text-xs text-slate-500 mt-2">
              Solde disponible: <span className="font-bold text-green-600">{relaisData?.available_balance || 0}€</span>
            </p>
          </Card>
          
          {/* Donations list */}
          <Card className="bg-white rounded-3xl p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Dernières donations
            </h3>
            
            {relaisData?.donations?.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Aucune donation pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {relaisData?.donations?.slice(0, 20).map((donation, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800">{donation.donor_name}</p>
                      <p className="text-xs text-slate-500">
                        {donation.source === 'account_closure' ? 'Clôture de compte' : 
                         donation.source === 'voluntary' ? 'Don volontaire' : 'Abonnement'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{donation.amount}€</p>
                      <p className="text-xs text-slate-400">
                        {new Date(donation.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* Archives section */}
      {activeSection === 'archives' && (
        <Card className="bg-white rounded-3xl p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            Demandes d'archivage
          </h3>
          
          {relaisData?.archive_requests?.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune demande d'archivage</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {relaisData?.archive_requests?.map((req, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{req.user_email}</p>
                      <p className="text-sm text-slate-600">
                        Cagnotte: {req.wallet_balance}€ → {
                          req.donation_choice === 'friend' ? `Amie (${req.friend_email})` :
                          req.donation_choice === 'relay' ? 'Relais Maman' :
                          'Non attribué'
                        }
                      </p>
                      {req.reason && (
                        <p className="text-xs text-slate-500 mt-1">Raison: {req.reason}</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(req.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
