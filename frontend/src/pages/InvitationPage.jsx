import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, Sparkles } from 'lucide-react';

/**
 * Route /invitation/:code — pré-remplit le parrainage et redirige vers l'inscription.
 */
export default function InvitationPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [sponsorName, setSponsorName] = useState('');
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (!code) {
      setValid(false);
      return;
    }
    localStorage.setItem('mamandouce_referral_code', code.toUpperCase());
    api.referral.validateCode(code)
      .then((res) => setSponsorName(res.data?.sponsor_name || 'Une maman'))
      .catch(() => setValid(false));
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-violet-50">
      <Card className="max-w-md w-full p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
          <Heart className="w-8 h-8 text-white" />
        </div>
        {valid ? (
          <>
            <h1 className="text-2xl font-bold text-slate-800">Invitation Sérénité</h1>
            <p className="text-slate-600">
              <strong>{sponsorName}</strong> vous invite à rejoindre MamanDouce et le portail NeriaCorp.
            </p>
            <p className="text-sm text-violet-600 font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" />
              Code : {code?.toUpperCase()}
            </p>
            <Button
              className="w-full rounded-full py-6 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold"
              onClick={() => navigate('/auth?register=1&ref=' + encodeURIComponent(code || ''))}
            >
              Créer mon compte
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-800">Code invalide</h1>
            <p className="text-slate-600">Ce lien d'invitation n'est plus valide.</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate('/auth')}>
              S'inscrire sans code
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
