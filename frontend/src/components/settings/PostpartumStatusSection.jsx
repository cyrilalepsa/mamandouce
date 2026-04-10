import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Baby, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PostpartumStatusSection({ fullStatus, subscriptionStatus }) {
  const navigate = useNavigate();

  if (!fullStatus || subscriptionStatus !== 'premium') return null;

  return (
    <Card className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${
      fullStatus.postpartum_unlocked
        ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200'
        : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          fullStatus.postpartum_unlocked
            ? 'bg-gradient-to-br from-rose-500 to-pink-500'
            : 'bg-gradient-to-br from-slate-400 to-slate-300'
        }`}>
          <Baby className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Suivi Post-partum
          </h2>
          <p className="text-slate-500 text-sm">
            {fullStatus.postpartum_unlocked 
              ? 'Accès activé !' 
              : 'Disponible à tout moment'}
          </p>
        </div>
      </div>
      
      {fullStatus.postpartum_unlocked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-4 bg-rose-100 rounded-2xl">
            <Check className="w-5 h-5 text-rose-600" />
            <p className="text-rose-800 font-semibold">
              {fullStatus.postpartum_free_via_referral 
                ? 'Offert grâce à vos parrainages !' 
                : 'Suivi post-partum activé !'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/postpartum')}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
          >
            Accéder au suivi post-partum
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Préparez sereinement les 6 premiers mois avec bébé : conseils, rendez-vous, 
            allaitement, soins et bien plus encore.
          </p>
          
          <Button
            onClick={() => navigate('/subscription/checkout?product=postpartum')}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 font-semibold"
          >
            Acheter le suivi post-partum (8€)
          </Button>
          
          <p className="text-xs text-center text-slate-500">
            Ou parrainez 2 amies pour l'obtenir gratuitement !
          </p>
          
          <p className="text-xs text-center text-slate-400 italic">
            Le contenu sera débloqué après avoir déclaré votre accouchement.
          </p>
        </div>
      )}
    </Card>
  );
}
