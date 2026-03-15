import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Gift, Check, Copy, Clock } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function CodesTab({ codes, codeStats, loadCodes }) {
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const generateCodes = async () => {
    if (count < 1 || count > 20) {
      toast.error('Nombre entre 1 et 20');
      return;
    }
    setGenerating(true);
    try {
      await api.admin.generateCodes(count, note);
      toast.success(`${count} code(s) généré(s) !`);
      setNote('');
      loadCodes();
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copié !');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-700">{codeStats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{codeStats.used}</p>
          <p className="text-xs text-slate-500">Utilisés</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Clock className="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-sky-600">{codeStats.available}</p>
          <p className="text-xs text-slate-500">Disponibles</p>
        </Card>
      </div>

      {/* Generate */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Générer des codes</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="w-24">
            <label className="text-sm text-slate-600 mb-1 block">Nombre</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-slate-600 mb-1 block">Note (optionnel)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Beta testeuse Marie"
              className="rounded-xl"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={generateCodes}
              disabled={generating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 h-10"
            >
              {generating ? '...' : 'Générer'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Codes List */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Codes générés</h3>
        {codes.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Aucun code</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {codes.map((code, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  code.used ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${code.used ? 'text-green-700' : 'text-slate-700'}`}>
                      {code.code}
                    </span>
                    {code.used && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Utilisé</span>
                    )}
                  </div>
                  {code.note && <p className="text-xs text-slate-500">{code.note}</p>}
                  {code.used_by && <p className="text-xs text-green-600">Par: {code.used_by}</p>}
                </div>
                {!code.used && (
                  <Button
                    onClick={() => copyCode(code.code)}
                    className={`rounded-lg px-3 py-1 ${
                      copiedCode === code.code ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {copiedCode === code.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
