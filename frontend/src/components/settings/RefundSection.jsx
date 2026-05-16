import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Heart, Upload, FileText } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function RefundSection({ subscriptionStatus }) {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundDocument, setRefundDocument] = useState(null);
  const [refundDetails, setRefundDetails] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const handleRefundRequest = async () => {
    if (!refundDocument) {
      toast.error('Veuillez joindre un document justificatif (attestation médicale)');
      return;
    }
    
    setSubmittingRefund(true);
    try {
      const formData = new FormData();
      formData.append('reason', 'miscarriage');
      formData.append('details', refundDetails || 'Demande de remboursement suite à une fausse couche');
      formData.append('document', refundDocument);
      
      const response = await api.postpartum.requestRefundWithDoc(formData);
      toast.success(response.data.message);
      setShowRefundForm(false);
      setRefundDocument(null);
      setRefundDetails('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la demande');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (subscriptionStatus !== 'premium') return null;

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-300 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Situation difficile ?
          </h2>
          <p className="text-slate-500 text-sm">
            En cas de fausse couche, vous pouvez demander un remboursement
          </p>
        </div>
      </div>
      
      {!showRefundForm ? (
        <>
          <p className="text-sm text-slate-600 mb-4">
            Si vous traversez une épreuve difficile (fausse couche), sachez que nous sommes là pour vous. 
            Vous pouvez demander un remboursement au prorata des mois restants sur présentation d'une attestation médicale.
          </p>
          
          <Button
            onClick={() => setShowRefundForm(true)}
            data-testid="show-refund-form-button"
            className="w-full bg-slate-100 text-slate-700 rounded-full py-3 hover:bg-slate-200"
          >
            Demander un remboursement
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Pour traiter votre demande, veuillez joindre une attestation médicale (certificat médical, compte-rendu d'hospitalisation, etc.)
          </p>
          
          {/* Upload zone */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
            {refundDocument ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div className="text-left">
                  <p className="font-semibold text-slate-700">{refundDocument.name}</p>
                  <p className="text-xs text-slate-500">{(refundDocument.size / 1024).toFixed(1)} Ko</p>
                </div>
                <Button
                  onClick={() => setRefundDocument(null)}
                  className="bg-red-100 text-red-600 rounded-full px-3 py-1 text-sm"
                >
                  Supprimer
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG ou PNG (max 5 Mo)</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  data-testid="refund-document-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Fichier trop volumineux (max 5 Mo)');
                        return;
                      }
                      setRefundDocument(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
          
          {/* Optional details */}
          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">
              Informations complémentaires (optionnel)
            </label>
            <textarea
              value={refundDetails}
              onChange={(e) => setRefundDetails(e.target.value)}
              placeholder="Ajoutez des détails si nécessaire..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-none"
              rows={3}
              data-testid="refund-details-input"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowRefundForm(false);
                setRefundDocument(null);
                setRefundDetails('');
              }}
              className="flex-1 bg-slate-100 text-slate-600 rounded-full py-3"
            >
              Annuler
            </Button>
            <Button
              onClick={handleRefundRequest}
              disabled={submittingRefund || !refundDocument}
              data-testid="submit-refund-button"
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full py-3 disabled:opacity-50"
            >
              {submittingRefund ? 'Envoi...' : 'Envoyer ma demande'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
