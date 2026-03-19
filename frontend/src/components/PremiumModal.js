import { Crown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

function PremiumModal({ isOpen, onClose, feature }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgb(0,0,0,0.3)] relative">
        <button
          onClick={onClose}
          data-testid="close-modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>Fonctionnalité Premium</h2>
          
          <p className="text-lg text-slate-600 mb-6">
            {feature || "Cette fonctionnalité est réservée aux membres Premium"}
          </p>

          <div className="bg-gradient-to-br from-sky-50 to-pink-50 rounded-2xl p-6 mb-6 text-left">
            <p className="font-bold text-slate-700 mb-3">Avec Premium, débloquez :</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Scanner illimité de produits
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                41 semaines de conseils complets
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Suivi de grossesse complet
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Préparer l'arrivée de bébé
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Notifications email
              </li>
            </ul>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-bold text-sky-600">27€</span>
              <span className="text-xl text-slate-500">/an</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">soit 2,25€/mois</p>
            <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mt-2">
              Sans renouvellement auto
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            data-testid="upgrade-button"
            className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full py-4 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Passer à Premium 💎
          </Button>

          <button
            onClick={onClose}
            className="w-full mt-3 text-slate-500 hover:text-slate-700 py-2"
          >
            Peut-être plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumModal;