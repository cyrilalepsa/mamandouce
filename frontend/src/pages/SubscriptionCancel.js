import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { XCircle } from 'lucide-react';

function SubscriptionCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-slate-100 text-center animate-fade-in">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Paiement annulé</h2>
        <p className="text-lg text-slate-600 mb-6">Vous avez annulé le processus de paiement.</p>
        
        <div className="bg-sky-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-slate-700 font-semibold mb-2">Besoin d'aide ?</p>
          <p className="text-sm text-slate-600">
            Si vous avez rencontré un problème ou si vous avez des questions, n'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/pricing')}
            data-testid="retry-button"
            className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full py-3 font-bold"
          >
            Réessayer
          </Button>
          <Button
            onClick={() => navigate('/')}
            data-testid="go-home-button"
            className="w-full bg-slate-100 text-slate-700 rounded-full py-3 font-bold hover:bg-slate-200"
          >
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SubscriptionCancel;