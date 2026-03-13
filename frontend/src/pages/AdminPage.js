import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Shield, Plus, Copy, Check, Users, Gift, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// Email admin autorisé
const ADMIN_EMAIL = 'cyrilalepsa@gmail.com';

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [stats, setStats] = useState({ total: 0, used: 0, available: 0 });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await api.auth.me();
      if (response.data.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        loadCodes();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadCodes = async () => {
    try {
      const response = await api.admin.getCodes();
      setCodes(response.data.codes || []);
      setStats({
        total: response.data.total || 0,
        used: response.data.used || 0,
        available: response.data.available || 0
      });
    } catch (error) {
      toast.error('Erreur chargement des codes');
    } finally {
      setLoading(false);
    }
  };

  const generateCodes = async () => {
    if (count < 1 || count > 20) {
      toast.error('Nombre entre 1 et 20');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.admin.generateCodes(count, note);
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

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white rounded-3xl p-8 text-center">
            <p className="text-slate-500">Vérification des droits...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white rounded-3xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Accès refusé</h2>
            <p className="text-slate-500 mb-4">Vous n'avez pas les droits d'administration.</p>
            <Button onClick={() => navigate('/')} className="bg-sky-500 text-white rounded-full px-6">
              Retour à l'accueil
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Administration" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white rounded-2xl p-4 text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
            <p className="text-xs text-slate-500">Total codes</p>
          </Card>
          <Card className="bg-white rounded-2xl p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.used}</p>
            <p className="text-xs text-slate-500">Utilisés</p>
          </Card>
          <Card className="bg-white rounded-2xl p-4 text-center">
            <Users className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-sky-600">{stats.available}</p>
            <p className="text-xs text-slate-500">Disponibles</p>
          </Card>
        </div>

        {/* Generate Codes */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Générer des codes
              </h2>
              <p className="text-slate-500 text-sm">Codes promo à usage unique</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Nombre</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="rounded-xl"
                />
              </div>
              <div className="flex-[2]">
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Note (optionnel)</label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Beta testeuse Marie"
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button
              onClick={generateCodes}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-bold"
            >
              {generating ? 'Génération...' : `Générer ${count} code(s)`}
            </Button>
          </div>
        </Card>

        {/* Codes List */}
        <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-xl font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Codes générés
          </h2>

          {codes.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Aucun code généré</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
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
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Utilisé
                        </span>
                      )}
                    </div>
                    {code.note && <p className="text-xs text-slate-500 mt-1">{code.note}</p>}
                    {code.used_by && (
                      <p className="text-xs text-green-600 mt-1">Par: {code.used_by}</p>
                    )}
                  </div>
                  {!code.used && (
                    <Button
                      onClick={() => copyCode(code.code)}
                      className={`rounded-lg px-3 py-1 ${
                        copiedCode === code.code
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
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
    </div>
  );
}

export default AdminPage;
