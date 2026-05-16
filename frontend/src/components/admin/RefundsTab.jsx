import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, CheckCircle, XCircle, RefreshCw, FileText, Download, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function RefundsTab({ refundRequests, refundStats, loadRefundRequests }) {
  const handleRefundAction = async (userId, approved) => {
    try {
      await api.admin.approveRefund(userId, approved);
      toast.success(approved ? 'Remboursement approuvé' : 'Demande rejetée');
      loadRefundRequests();
    } catch (error) {
      toast.error('Erreur lors du traitement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-700">{refundStats.pending}</p>
          <p className="text-xs text-amber-600">En attente</p>
        </Card>
        <Card className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{refundStats.approved}</p>
          <p className="text-xs text-green-600">Approuvés</p>
        </Card>
        <Card className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{refundStats.rejected}</p>
          <p className="text-xs text-red-600">Rejetés</p>
        </Card>
      </div>
      
      {/* Refund Requests List */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Demandes de remboursement</h3>
        {refundRequests.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune demande de remboursement</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {refundRequests.map((request, index) => (
              <div 
                key={index} 
                className={`rounded-xl border p-4 ${
                  request.status === 'pending' 
                    ? 'bg-amber-50 border-amber-200' 
                    : request.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-700">{request.user_name || request.user_email}</p>
                    <p className="text-sm text-slate-500">{request.user_email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    request.status === 'pending' 
                      ? 'bg-amber-200 text-amber-700' 
                      : request.status === 'approved'
                        ? 'bg-green-200 text-green-700'
                        : 'bg-red-200 text-red-700'
                  }`}>
                    {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-slate-500">Raison</p>
                    <p className="font-semibold text-slate-700">
                      {request.reason === 'miscarriage' ? 'Fausse couche' : request.reason}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-slate-500">Montant estimé</p>
                    <p className="font-bold text-green-600">{request.refund_amount}€</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-slate-500">Jours utilisés</p>
                    <p className="font-semibold text-slate-700">{request.days_used} jours</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2">
                    <p className="text-slate-500">Jours restants</p>
                    <p className="font-semibold text-slate-700">{request.days_remaining} jours</p>
                  </div>
                </div>
                
                {request.details && (
                  <p className="text-sm text-slate-600 mb-3 bg-white/60 rounded-lg p-2">
                    <strong>Détails:</strong> {request.details}
                  </p>
                )}
                
                {/* Document section */}
                {request.document_filename && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Document justificatif</p>
                          <p className="text-xs text-blue-500">{request.document_filename}</p>
                        </div>
                      </div>
                      <a
                        href={api.admin.getRefundDocument(request.user_id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </a>
                    </div>
                  </div>
                )}
                
                {!request.document_filename && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <p className="text-sm text-amber-700">Aucun document joint à cette demande</p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-slate-400 mb-3">
                  Demande du {new Date(request.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRefundAction(request.user_id, true)}
                      data-testid={`approve-refund-${index}`}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver ({request.refund_amount}€)
                    </Button>
                    <Button
                      onClick={() => handleRefundAction(request.user_id, false)}
                      data-testid={`reject-refund-${index}`}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                )}
                
                {request.status !== 'pending' && request.processed_at && (
                  <div className="mt-3 p-3 bg-white/60 rounded-xl">
                    <p className="text-xs text-slate-500">
                      Traité le {new Date(request.processed_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })} par {request.processed_by}
                    </p>
                    {request.stripe_refund_id && (
                      <p className="text-xs text-green-600 mt-1">
                        Remboursement Stripe effectué (ID: {request.stripe_refund_id})
                      </p>
                    )}
                    {request.manual_refund_required && (
                      <p className="text-xs text-amber-600 mt-1">
                        Remboursement manuel requis (pas de paiement Stripe trouvé)
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
