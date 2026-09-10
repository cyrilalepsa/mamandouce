import { useState } from 'react';
import { BookMarked, Gift, Heart, Loader2, Send } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../utils/api';
import { toast } from 'sonner';
import { normalizeScannedFood } from '../../utils/foodSafety';

/**
 * Options A (bibliothèque personnelle) et B (contribution communautaire + badges).
 */
export function ScannedProductActions({
  food,
  className = '',
  onPersonalSaved,
  onContributionSubmitted,
}) {
  const product = normalizeScannedFood(food);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [personalSaved, setPersonalSaved] = useState(false);
  const [communitySubmitted, setCommunitySubmitted] = useState(false);

  if (!product?.can_contribute && !product?.is_unknown) return null;
  if (personalSaved && communitySubmitted) {
    return (
      <div className="mt-4 p-4 rounded-2xl border-2 border-green-200 bg-green-50">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">
            Merci ! L&apos;aliment est dans votre bibliothèque et votre proposition est en cours de validation.
          </p>
        </div>
      </div>
    );
  }

  const handlePersonalSave = async () => {
    if (!product?.name || savingPersonal) return;
    setSavingPersonal(true);
    try {
      const response = await api.scan.save({
        name: product.name,
        safety_level: product.safe_for_pregnancy,
        category: product.category,
        barcode: product.barcode,
        notes: product.reason,
        contribute_to_community: false,
      });
      setPersonalSaved(true);
      toast.success(response.data?.message || 'Ajouté à votre bibliothèque personnelle');
      onPersonalSaved?.(product);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Impossible d\'ajouter à votre bibliothèque');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleCommunityContribute = async () => {
    if (!product?.name || savingCommunity) return;
    setSavingCommunity(true);
    try {
      const response = await api.scan.save({
        name: product.name,
        safety_level: product.safe_for_pregnancy,
        category: product.category,
        barcode: product.barcode,
        notes: [
          product.reason,
          product.ingredients ? `Composition : ${product.ingredients}` : '',
        ].filter(Boolean).join(' '),
        contribute_to_community: true,
      });
      setCommunitySubmitted(true);
      setPersonalSaved(true);
      toast.custom((t) => (
        <div className="flex items-center gap-3 p-4 rounded-2xl shadow-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-pink-600 text-sm">Merci pour votre contribution !</p>
            <p className="text-xs text-purple-600 mt-1">
              Votre proposition fait progresser vos badges et aide toutes les mamans.
            </p>
          </div>
          <button type="button" onClick={() => toast.dismiss(t)} className="text-pink-400">×</button>
        </div>
      ), { duration: 5000 });
      onContributionSubmitted?.(product, response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi de la proposition');
    } finally {
      setSavingCommunity(false);
    }
  };

  return (
    <div
      className={`mt-4 p-4 rounded-2xl border-2 border-dashed border-pink-200 bg-gradient-to-br from-pink-50/80 to-purple-50/50 ${className}`}
      data-testid="scanned-product-actions"
    >
      <p className="text-sm text-slate-600 mb-1 font-medium">
        Pas encore dans la bibliothèque globale
      </p>
      <p className="text-xs text-slate-500 mb-4">
        Vous pouvez l&apos;enregistrer pour vous ou proposer sa fiche à la communauté.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePersonalSave}
          disabled={savingPersonal || personalSaved}
          className="w-full rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          data-testid="save-personal-food"
        >
          {savingPersonal ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BookMarked className="w-4 h-4 mr-2" />
          )}
          {personalSaved ? 'Dans ma bibliothèque' : 'Ajouter à ma bibliothèque personnelle'}
        </Button>
        <Button
          type="button"
          onClick={handleCommunityContribute}
          disabled={savingCommunity || communitySubmitted}
          className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          data-testid="submit-community-food"
        >
          {savingCommunity ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {communitySubmitted
            ? 'Proposition envoyée'
            : 'Proposer à la communauté (+ badges)'}
        </Button>
      </div>
      <p className="text-[10px] text-purple-500 mt-3 text-center">
        La contribution validée par l&apos;équipe fait progresser vos badges Bronze, Argent et Or.
      </p>
    </div>
  );
}
