import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Users, Send, Check } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function ReferralSection({ referralStatus, onReloadStatus }) {
  const [referral1Email, setReferral1Email] = useState('');
  const [referral1Name, setReferral1Name] = useState('');
  const [referral2Email, setReferral2Email] = useState('');
  const [referral2Name, setReferral2Name] = useState('');
  const [submittingReferral, setSubmittingReferral] = useState(false);

  const handleSubmitReferral = async () => {
    if (!referral1Email.trim() || !referral1Name.trim()) {
      toast.error('Veuillez remplir au moins le premier parrainage');
      return;
    }
    
    setSubmittingReferral(true);
    try {
      await api.referral.submit({
        referral1_email: referral1Email,
        referral1_name: referral1Name,
        referral2_email: referral2Email || null,
        referral2_name: referral2Name || null
      });
      toast.success('Parrainages enregistrés !');
      setReferral1Email('');
      setReferral1Name('');
      setReferral2Email('');
      setReferral2Name('');
      onReloadStatus?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setSubmittingReferral(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Parrainage
          </h2>
          <p className="text-slate-500 text-sm">
            Parrainez 2 amies et obtenez le suivi post-partum gratuit !
          </p>
        </div>
      </div>
      
      {/* Statut actuel */}
      {referralStatus && (
        <div className="mb-4 p-4 bg-white/60 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Parrainages complétés</span>
            <span className="text-lg font-bold text-purple-600">
              {referralStatus.completed_count}/2
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${(referralStatus.completed_count / 2) * 100}%` }}
            />
          </div>
          {referralStatus.postpartum_unlocked && (
            <div className="mt-3 flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Suivi post-partum débloqué !</span>
            </div>
          )}
        </div>
      )}
      
      {/* Liste des parrainages existants */}
      {referralStatus?.referrals?.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-semibold text-slate-600">Vos parrainages :</p>
          {referralStatus.referrals.map((ref, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
              <div>
                <p className="font-medium text-slate-700">{ref.referral_name}</p>
                <p className="text-xs text-slate-500">{ref.referral_email}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                ref.status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {ref.status === 'completed' ? 'Inscrit(e)' : 'En attente'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Formulaire de parrainage */}
      {(!referralStatus?.postpartum_unlocked) && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Ajoutez les coordonnées de vos filleules :</p>
          
          {/* Parrainage 1 */}
          <div className="p-4 bg-white/60 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-purple-600">Filleule 1</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={referral1Name}
                onChange={(e) => setReferral1Name(e.target.value)}
                placeholder="Prénom"
                className="rounded-xl border-purple-200"
                data-testid="referral1-name"
              />
              <Input
                value={referral1Email}
                onChange={(e) => setReferral1Email(e.target.value)}
                placeholder="Email"
                type="email"
                className="rounded-xl border-purple-200"
                data-testid="referral1-email"
              />
            </div>
          </div>
          
          {/* Parrainage 2 */}
          <div className="p-4 bg-white/60 rounded-2xl space-y-3">
            <p className="text-sm font-semibold text-purple-600">Filleule 2</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={referral2Name}
                onChange={(e) => setReferral2Name(e.target.value)}
                placeholder="Prénom"
                className="rounded-xl border-purple-200"
                data-testid="referral2-name"
              />
              <Input
                value={referral2Email}
                onChange={(e) => setReferral2Email(e.target.value)}
                placeholder="Email"
                type="email"
                className="rounded-xl border-purple-200"
                data-testid="referral2-email"
              />
            </div>
          </div>
          
          <Button
            onClick={handleSubmitReferral}
            disabled={submittingReferral}
            data-testid="submit-referral-button"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            {submittingReferral ? 'Envoi...' : 'Enregistrer mes parrainages'}
          </Button>
        </div>
      )}
    </Card>
  );
}
