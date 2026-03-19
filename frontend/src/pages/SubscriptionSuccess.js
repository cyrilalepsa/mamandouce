import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CheckCircle, Loader } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 secondes

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await api.subscription.checkStatus(sessionId);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        toast.success('🎉 Abonnement Premium activé !');
        setTimeout(() => navigate('/'), 3000);
        return;
      } else if (response.data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continuer le polling
      setAttempts(prev => prev + 1);
      setTimeout(pollPaymentStatus, pollInterval);
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-slate-100 text-center animate-fade-in" data-testid="success-card">
        {status === 'checking' && (
          <>
            <Loader className="w-16 h-16 text-sky-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Vérification du paiement...</h2>
            <p className="text-slate-500">Veuillez patienter quelques instants</p>
            <p className="text-sm text-slate-400 mt-4">Tentative {attempts + 1}/5</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Paiement réussi ! 🎉</h2>
            <p className="text-lg text-slate-600 mb-6">Votre abonnement Premium est maintenant actif</p>
            <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-4 mb-6">
              <p className="text-slate-700 font-semibold">Vous avez maintenant accès à :</p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>✓ Scanner illimité</li>
                <li>✓ 41 semaines de conseils</li>
                <li>✓ Suivi de grossesse complet</li>
                <li>✓ Préparer l'arrivée de bébé</li>
                <li>✓ Notifications email</li>
              </ul>
            </div>
            <Button
              onClick={() => navigate('/')}
              data-testid="go-home-button"
              className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full py-3 font-bold"
            >
              Accéder à l'application
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Erreur de vérification</h2>
            <p className="text-slate-600 mb-6">Nous n'avons pas pu vérifier votre paiement. Vérifiez votre email pour la confirmation.</p>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-slate-600 text-white rounded-full py-3 font-bold"
            >
              Retour à l'accueil
            </Button>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⏱️</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Vérification en cours...</h2>
            <p className="text-slate-600 mb-6">Le paiement est en cours de traitement. Vous recevrez un email de confirmation sous peu.</p>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-slate-600 text-white rounded-full py-3 font-bold"
            >
              Retour à l'accueil
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default SubscriptionSuccess;