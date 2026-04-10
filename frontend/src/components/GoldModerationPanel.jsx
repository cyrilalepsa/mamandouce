import { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Crown, CheckCircle, XCircle, Eye, ThumbsUp, ThumbsDown,
  Apple, ShoppingBag, ChefHat, Sparkles, History
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

function GoldModerationPanel() {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [selectedContrib, setSelectedContrib] = useState(null);
  const [voting, setVoting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [contribRes, votesRes] = await Promise.all([
        api.get('/babynames/moderation/pending'),
        api.get('/babynames/moderation/my-votes')
      ]);
      
      setContributions(contribRes.data.contributions || []);
      setMyVotes(votesRes.data.votes || []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Accès réservé aux Marraines Or');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (contributionId, approve) => {
    setVoting(true);
    try {
      const res = await api.post(`/babynames/moderation/${contributionId}/vote`, null, {
        params: { approve }
      });
      
      toast.success(approve ? 'Vote positif enregistré' : 'Vote négatif enregistré');
      
      if (res.data.finalized) {
        toast.info(`Contribution ${res.data.final_status === 'approved' ? 'validée' : 'refusée'} !`);
      }
      
      setSelectedContrib(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du vote');
    } finally {
      setVoting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'food_scan': return <Apple className="w-5 h-5 text-green-500" />;
      case 'maternity_bag': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      case 'recipe': return <ChefHat className="w-5 h-5 text-amber-500" />;
      default: return <Eye className="w-5 h-5 text-slate-400" />;
    }
  };

  // Check already voted
  const hasVoted = (contribId) => {
    return myVotes.some(v => v.contribution_id === contribId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Modération Marraine Or
            </h2>
            <p className="text-sm text-slate-500">Aide à valider les contributions</p>
          </div>
        </div>

        <Button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Modérer' : 'Historique'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-600">{contributions.length}</div>
          <div className="text-sm text-amber-700">En attente</div>
        </Card>
        <Card className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-600">
            {myVotes.filter(v => v.vote === 'approve').length}
          </div>
          <div className="text-sm text-green-700">Mes approbations</div>
        </Card>
        <Card className="bg-rose-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-rose-600">
            {myVotes.filter(v => v.vote === 'reject').length}
          </div>
          <div className="text-sm text-rose-700">Mes rejets</div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-amber-100 to-yellow-50 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Comment ça marche ?</p>
            <p>• 3 votes positifs = Contribution validée</p>
            <p>• 2 votes négatifs = Contribution refusée</p>
            <p>• Tu ne peux voter qu'une fois par contribution</p>
          </div>
        </div>
      </Card>

      {showHistory ? (
        /* Vote History */
        <div className="space-y-3">
          <h3 className="font-bold text-slate-700">Mon historique de votes</h3>
          {myVotes.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Aucun vote encore</p>
          ) : (
            myVotes.slice(0, 20).map((vote, i) => (
              <Card key={i} className={`p-3 rounded-xl ${vote.vote === 'approve' ? 'bg-green-50' : 'bg-rose-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">Contribution #{vote.contribution_id.slice(0, 8)}</span>
                    <span className="text-slate-400 ml-2">
                      {new Date(vote.timestamp).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${vote.vote === 'approve' ? 'text-green-600' : 'text-rose-600'}`}>
                    {vote.vote === 'approve' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                    {vote.vote === 'approve' ? 'Approuvé' : 'Rejeté'}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Pending Contributions */
        <div className="space-y-3">
          {contributions.length === 0 ? (
            <Card className="bg-white/90 p-8 rounded-2xl text-center">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-600">Aucune contribution en attente</p>
              <p className="text-sm text-slate-400 mt-1">Reviens plus tard !</p>
            </Card>
          ) : (
            contributions.map((contrib) => {
              const alreadyVoted = hasVoted(contrib.id);
              const isSelected = selectedContrib?.id === contrib.id;

              return (
                <Card
                  key={contrib.id}
                  className={`p-4 rounded-xl transition-all cursor-pointer ${
                    alreadyVoted 
                      ? 'bg-slate-50 opacity-60' 
                      : isSelected 
                        ? 'bg-amber-50 ring-2 ring-amber-400'
                        : 'bg-white hover:bg-amber-50/50'
                  }`}
                  onClick={() => !alreadyVoted && setSelectedContrib(isSelected ? null : contrib)}
                  data-testid={`contrib-${contrib.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(contrib.contribution_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-700">{contrib.title}</h4>
                        {alreadyVoted && (
                          <span className="text-xs px-2 py-1 bg-slate-200 text-slate-500 rounded-full">
                            Déjà voté
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{contrib.user_email}</p>
                      {contrib.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{contrib.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Vote Actions */}
                  {isSelected && !alreadyVoted && (
                    <div className="mt-4 pt-4 border-t border-amber-200 flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleVote(contrib.id, true)}
                        disabled={voting}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                        data-testid="approve-vote-btn"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleVote(contrib.id, false)}
                        disabled={voting}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                        data-testid="reject-vote-btn"
                      >
                        <XCircle className="w-5 h-5" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default GoldModerationPanel;
