import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function SubscriptionCancel() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // Couleurs conditionnelles pour le mode sombre
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-700';
  const textSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const infoBg = isDarkMode ? 'bg-sky-900/30 border-sky-800' : 'bg-sky-50';

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <Card className={`w-full max-w-md rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.08)] border text-center animate-fade-in ${cardBg}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-100'}`}>
          <XCircle className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className={`text-3xl font-bold mb-3 ${textPrimary}`} style={{ fontFamily: 'Nunito, sans-serif' }}>Paiement annulé</h2>
        <p className={`text-lg mb-6 ${textSecondary}`}>Vous avez annulé le processus de paiement.</p>
        
        <div className={`rounded-2xl p-4 mb-6 text-left ${infoBg}`}>
          <p className={`font-semibold mb-2 ${textPrimary}`}>Besoin d'aide ?</p>
          <p className={`text-sm ${textSecondary}`}>
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
            className={`w-full rounded-full py-3 font-bold ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SubscriptionCancel;