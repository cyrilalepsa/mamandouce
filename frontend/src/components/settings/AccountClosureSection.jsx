import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Archive, Download } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import AccountArchiveModal from '../solidarity/AccountArchiveModal';

/**
 * Clôture de compte avec passage de relais solidaire (N2O) et option Ambassadrice.
 */
export function AccountClosureSection() {
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.postpartum.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mamandouce_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleArchived = (result) => {
    if (result?.become_ambassador) {
      toast.success(result.message || 'Vous êtes Ambassadrice MamanDouce !');
      return;
    }
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  return (
    <>
      <Card className="rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Archive className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-700">Archiver / clôturer mon compte</h3>
            <p className="text-sm text-slate-500">
              Passez le relais : donnez vos N2O ou devenez Ambassadrice
            </p>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          variant="outline"
          className="w-full rounded-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Export…' : 'Exporter mes données (RGPD)'}
        </Button>

        <Button
          onClick={() => setShowArchiveModal(true)}
          className="w-full rounded-full bg-slate-700 text-white"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archiver mon compte
        </Button>
      </Card>

      <AccountArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchived}
      />
    </>
  );
}

export default AccountClosureSection;
