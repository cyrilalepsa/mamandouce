/**
 * Modale d'adhésion au portail NeriaCorp (SSO / Noyau B2C).
 * Affichée après parrainage ou au premier N2O gagné.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Sparkles, Shield, ExternalLink, Heart, Gift } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { N20Amount } from '../N20Icon';

export function NeriaCorpPortalModal({ open, onClose, status, onLinked }) {
  const [loading, setLoading] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  const trigger = status?.trigger;
  const portalUrl = status?.portal_url || 'https://app.neriacorp.com';
  const balance = status?.wallet_balance || 0;
  const crossApp = status?.cross_app || {};

  const title = trigger === 'referral'
    ? 'Bienvenue dans la famille NeriaCorp !'
    : 'Félicitations — vous avez gagné des N2O !';

  const subtitle = trigger === 'referral'
    ? 'Votre parrainage ouvre l\'accès au portail NeriaCorp : un seul compte pour MamanDouce et Héritia.'
    : 'Créez ou liez votre compte NeriaCorp pour centraliser vos avantages et vos N2O.';

  const handleLink = async () => {
    if (!gdprConsent) {
      toast.error('Veuillez accepter le traitement des données pour continuer.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.neriacorp.ackOnboarding({ action: 'link', gdpr_consent: true });
      toast.success('Compte NeriaCorp lié avec succès !');
      onLinked?.(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Liaison impossible pour le moment');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await api.neriacorp.ackOnboarding({ action: 'skip', gdpr_consent: false });
      onClose();
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent className="max-w-lg rounded-3xl border-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/90 text-sm mt-2">{subtitle}</p>
          {balance > 0 && (
            <p className="mt-3 text-sm font-medium flex items-center gap-1">
              Solde actuel :
              <N20Amount value={balance} size={14} valueClassName="text-white font-bold" />
            </p>
          )}
        </div>

        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/40 p-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <p className="font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4 text-violet-600" />
              Avantages cross-app
            </p>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              <li>• Héritia : durée restante MamanDouce transférée ({crossApp.heritia?.days_remaining || 0} j.)</li>
              <li>• Un seul compte NeriaCorp pour vos applications B2C</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-600 dark:text-slate-400 flex gap-2">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>
              {status?.gdpr_notice || (
                'Nous partageons uniquement email, nom et statut d\'abonnement avec le Noyau NeriaCorp. '
                + 'Vous pouvez refuser ou gérer vos données sur le portail.'
              )}
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={gdprConsent}
              onCheckedChange={(v) => setGdprConsent(Boolean(v))}
              className="mt-0.5"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              J'accepte la création ou la liaison de mon compte NeriaCorp et le partage limité de mes données (RGPD).
            </span>
          </label>

          <Button
            onClick={handleLink}
            disabled={loading || !gdprConsent}
            className="w-full rounded-full py-6 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold"
          >
            {loading ? 'Liaison en cours…' : 'Créer / lier mon compte NeriaCorp'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(portalUrl, '_blank', 'noopener,noreferrer')}
            className="w-full rounded-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir le portail NeriaCorp
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700 py-2"
          >
            Plus tard
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NeriaCorpPortalModal;
