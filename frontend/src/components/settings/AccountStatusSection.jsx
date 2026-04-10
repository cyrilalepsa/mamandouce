import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Clock, Download, Archive, AlertTriangle, Check, Baby } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function AccountStatusSection() {
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    loadAccountStatus();
  }, []);

  const loadAccountStatus = async () => {
    try {
      const response = await api.postpartum.getAccountStatus();
      setAccountStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await api.postpartum.exportData();
      const data = response.data;
      
      // Créer un fichier JSON téléchargeable
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamandouce_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Vos données ont été téléchargées !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleArchiveAccount = async () => {
    setArchiving(true);
    try {
      await api.postpartum.archiveAccount();
      toast.success('Votre compte a été archivé. Merci d\'avoir utilisé MamanDouce !');
      // Déconnecter l'utilisateur
      localStorage.removeItem('token');
      window.location.href = '/auth';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'archivage');
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  };

  const handleEarlyArchive = async () => {
    setArchiving(true);
    try {
      await api.postpartum.requestEarlyArchive();
      toast.success('Votre compte a été archivé. Merci d\'avoir utilisé MamanDouce !');
      localStorage.removeItem('token');
      window.location.href = '/auth';
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'archivage');
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  };

  if (loading) {
    return null;
  }

  // Ne pas afficher si pas de post-partum actif
  if (!accountStatus?.has_postpartum) {
    return null;
  }

  // Compte déjà archivé
  if (accountStatus?.account_archived) {
    return (
      <Card className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5 text-slate-500" />
          <p className="text-slate-600 text-sm">Compte archivé</p>
        </div>
      </Card>
    );
  }

  const daysRemaining = accountStatus?.days_remaining || 0;
  const isExpiringSoon = daysRemaining <= 30;
  const isExpired = daysRemaining <= 0;

  return (
    <>
      <Card className={`rounded-3xl p-6 shadow-sm border ${
        isExpired 
          ? 'bg-red-50 border-red-200' 
          : isExpiringSoon 
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExpired 
              ? 'bg-red-500' 
              : isExpiringSoon 
                ? 'bg-amber-500'
                : 'bg-sky-500'
          }`}>
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-700">Suivi Post-partum</h3>
            {isExpired ? (
              <p className="text-sm text-red-600">Période terminée</p>
            ) : (
              <p className="text-sm text-slate-500">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {accountStatus?.baby_name && (
            <div className="flex items-center gap-1 bg-pink-100 px-3 py-1 rounded-full">
              <Baby className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-semibold text-pink-600">{accountStatus.baby_name}</span>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, ((180 - daysRemaining) / 180) * 100))}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">
            {180 - daysRemaining} / 180 jours écoulés
          </p>
        </div>

        {/* Message selon l'état */}
        {isExpired && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Votre période post-partum est terminée</p>
                <p className="text-xs text-red-600 mt-1">
                  Téléchargez vos données avant d'archiver votre compte.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpiringSoon && !isExpired && (
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Bientôt la fin du suivi</p>
                <p className="text-xs text-amber-600 mt-1">
                  Pensez à télécharger vos données avant la fin de la période.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full bg-sky-500 text-white rounded-full py-2.5 font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Export en cours...' : 'Télécharger mes données'}
          </Button>
          
          {isExpired ? (
            <Button
              onClick={() => setShowArchiveConfirm(true)}
              className="w-full bg-slate-600 text-white rounded-full py-2.5 font-semibold"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archiver mon compte
            </Button>
          ) : (
            <Button
              onClick={() => setShowArchiveConfirm(true)}
              variant="outline"
              className="w-full rounded-full py-2.5 text-slate-600 border-slate-300"
            >
              Archiver mon compte maintenant
            </Button>
          )}
        </div>
      </Card>

      {/* Modal de confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Archiver votre compte ?</h3>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Attention :</strong> Cette action est irréversible. Vos données seront conservées mais vous ne pourrez plus accéder à l'application.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-green-800">
                <Check className="w-4 h-4 inline mr-1" />
                N'oubliez pas de télécharger vos données avant d'archiver !
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 bg-slate-100 text-slate-600 rounded-full py-3"
              >
                Annuler
              </Button>
              <Button
                onClick={isExpired ? handleArchiveAccount : handleEarlyArchive}
                disabled={archiving}
                className="flex-1 bg-slate-600 text-white rounded-full py-3"
              >
                {archiving ? 'Archivage...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
