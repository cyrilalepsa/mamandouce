import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { 
  ArrowLeft, Weight, Baby, Heart, Activity, Plus, TrendingUp, 
  Calendar, Scale, Ruler
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { cardSoftClayClasses } from '../utils/accentTokens';
import { ListItemCard } from '../components/ui/SoftClayCards';
import { IconWell } from '../components/ui/IconWell';

function TrackingPage() {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pregnancyProfile, setPregnancyProfile] = useState(null);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBabyWeight, setNewBabyWeight] = useState('');
  const [newBabySize, setNewBabySize] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [healthRes, profileRes] = await Promise.all([
        api.medical.getHealthSummary(),
        api.pregnancy.getProfile()
      ]);
      setHealthData(healthRes.data);
      setPregnancyProfile(profileRes.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      toast.error('Veuillez entrer un poids valide');
      return;
    }

    try {
      // Créer une note avec le poids pour le rendez-vous le plus récent ou créer une entrée générique
      const today = new Date().toISOString().split('T')[0];
      const appointmentId = `weight_${today}`;
      
      await api.medical.saveNotes(appointmentId, {
        weight: parseFloat(newWeight),
        notes: 'Entrée de poids manuelle'
      });
      
      toast.success('Poids enregistré !');
      setNewWeight('');
      setShowAddWeight(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleAddBabyMeasures = async () => {
    if (!newBabyWeight && !newBabySize) {
      toast.error('Veuillez entrer au moins une mesure');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const appointmentId = `baby_${today}`;
      
      await api.medical.saveNotes(appointmentId, {
        baby_weight: newBabyWeight ? parseFloat(newBabyWeight) : null,
        baby_size: newBabySize ? parseFloat(newBabySize) : null,
        notes: 'Mesures bébé manuelles'
      });
      
      toast.success('Mesures enregistrées !');
      setNewBabyWeight('');
      setNewBabySize('');
      setShowAddBaby(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // Formater les données pour les graphiques
  const formatWeightData = () => {
    if (!healthData?.weight_history?.length) return [];
    
    return healthData.weight_history.map((item, index) => ({
      name: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      poids: item.value,
      semaine: index + 1
    }));
  };

  const formatBabyData = () => {
    if (!healthData?.baby_growth_history?.length) return [];
    
    return healthData.baby_growth_history.map((item, index) => ({
      name: new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      poids: item.weight,
      taille: item.size,
      semaine: index + 1
    }));
  };

  // Données de référence pour la courbe de poids (IMC normal)
  const getWeightReferenceData = () => {
    // Gains de poids recommandés par semaine pour IMC normal
    const baseWeight = healthData?.weight_history?.[0]?.value || 60;
    const weeks = Array.from({ length: 40 }, (_, i) => i + 1);
    
    return weeks.map(week => {
      let gain = 0;
      if (week <= 12) gain = week * 0.1; // Premier trimestre: faible gain
      else if (week <= 28) gain = 1.2 + (week - 12) * 0.35; // Deuxième trimestre
      else gain = 6.8 + (week - 28) * 0.45; // Troisième trimestre
      
      return {
        semaine: week,
        min: baseWeight + gain * 0.8,
        max: baseWeight + gain * 1.2,
        reference: baseWeight + gain
      };
    });
  };

  // Calcul des statistiques
  const getStats = () => {
    const weightData = healthData?.weight_history || [];
    const babyData = healthData?.baby_growth_history || [];
    
    const lastWeight = weightData[weightData.length - 1]?.value;
    const firstWeight = weightData[0]?.value;
    const weightGain = lastWeight && firstWeight ? (lastWeight - firstWeight).toFixed(1) : null;
    
    const lastBabyWeight = babyData[babyData.length - 1]?.weight;
    const lastBabySize = babyData[babyData.length - 1]?.size;
    
    return {
      currentWeight: lastWeight,
      weightGain,
      totalEntries: weightData.length,
      lastBabyWeight,
      lastBabySize,
      babyEntries: babyData.length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            className="bg-white/80 text-slate-600 rounded-full p-2 hover:bg-white"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Suivi de grossesse
            </h1>
            <p className="text-slate-500 text-sm">
              {pregnancyProfile?.current_week 
                ? `Semaine ${pregnancyProfile.current_week}` 
                : 'Graphiques et mesures'}
            </p>
          </div>
        </div>

        {/* ========== CATÉGORIE MAMAN ========== */}
        <div>
          <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Heart className="w-5 h-5 text-pink-500" />
            Maman
          </h2>

          {/* Container unique Maman : Stats + Graphique + bouton + intégré */}
          <Card className={`${cardSoftClayClasses('pink')} p-5 border-0`} data-testid="weight-chart">
            {/* Stats Poids actuel + Prise de poids (intégrées) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ListItemCard accent="pink" className="flex items-center gap-3">
                <IconWell accent="pink" size="md">
                  <Scale className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <p className="text-xs text-slate-600">Poids actuel</p>
                  <p className="text-lg font-bold text-slate-800">
                    {stats.currentWeight ? `${stats.currentWeight} kg` : '-- kg'}
                  </p>
                </div>
              </ListItemCard>
              <ListItemCard accent="green" className="flex items-center gap-3">
                <IconWell accent="green" size="md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <p className="text-xs text-slate-600">Prise de poids</p>
                  <p className="text-lg font-bold text-slate-800">
                    {stats.weightGain ? `+${stats.weightGain} kg` : '-- kg'}
                  </p>
                </div>
              </ListItemCard>
            </div>

            {/* Header Courbe de poids + bouton + intégré */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconWell accent="pink" size="md">
                  <Weight className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Courbe de poids
                  </h2>
                  <p className="text-xs text-slate-500">{stats.totalEntries} mesure(s) enregistrée(s)</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddWeight(!showAddWeight)}
                className="btn-rose-bonbon rounded-full px-4 py-2"
                data-testid="add-weight-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

          {/* Formulaire ajout poids */}
          {showAddWeight && (
            <div className="card-inner-cream rounded-2xl p-4 mb-4 space-y-3">
              <div>
                <Label className="text-slate-600 text-sm">Votre poids (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Ex: 65.5"
                  className="rounded-xl"
                  data-testid="weight-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddWeight}
                  className="flex-1 btn-rose-bonbon rounded-xl"
                >
                  Enregistrer
                </Button>
                <Button
                  onClick={() => setShowAddWeight(false)}
                  className="btn-rose-bonbon-outline rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {formatWeightData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatWeightData()}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  unit=" kg"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} kg`, 'Poids']}
                />
                <Area 
                  type="monotone" 
                  dataKey="poids" 
                  stroke="#EC4899" 
                  strokeWidth={3}
                  fill="url(#colorWeight)" 
                  dot={{ fill: '#EC4899', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#BE185D' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune donnée de poids enregistrée</p>
              <p className="text-slate-400 text-sm mt-1">
                Ajoutez votre poids après chaque rendez-vous médical
              </p>
            </div>
          )}
        </Card>
        </div>

        {/* ========== CATÉGORIE BÉBÉ ========== */}
        <div>
          <h2 className="text-xl font-bold text-slate-600 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Baby className="w-5 h-5 text-sky-500" />
            Bébé
          </h2>

          {/* Container unique Bébé : Stats + Graphique + bouton + intégré */}
          <Card className={`${cardSoftClayClasses('sky')} p-5 border-0`} data-testid="baby-chart">
            {/* Stats Poids estimé + Taille (intégrées) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ListItemCard accent="sky" className="flex items-center gap-3">
                <IconWell accent="sky" size="md">
                  <Scale className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <p className="text-xs text-slate-600">Poids estimé</p>
                  <p className="text-lg font-bold text-slate-800">
                    {stats.lastBabyWeight ? `${stats.lastBabyWeight} g` : '-- g'}
                  </p>
                </div>
              </ListItemCard>
              <ListItemCard accent="violet" className="flex items-center gap-3">
                <IconWell accent="violet" size="md">
                  <Ruler className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <p className="text-xs text-slate-600">Taille</p>
                  <p className="text-lg font-bold text-slate-800">
                    {stats.lastBabySize ? `${stats.lastBabySize} cm` : '-- cm'}
                  </p>
                </div>
              </ListItemCard>
            </div>

            {/* Header Croissance + bouton + intégré */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <IconWell accent="sky" size="md">
                  <Baby className="w-5 h-5 text-white" />
                </IconWell>
                <div>
                  <h2 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Croissance du bébé
                  </h2>
                  <p className="text-xs text-slate-500">{stats.babyEntries} mesure(s) enregistrée(s)</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddBaby(!showAddBaby)}
                className="btn-rose-bonbon rounded-full px-4 py-2"
                data-testid="add-baby-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

          {/* Formulaire ajout mesures bébé */}
          {showAddBaby && (
            <div className="card-inner-cream rounded-2xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-600 text-sm">Poids estimé (g)</Label>
                  <Input
                    type="number"
                    value={newBabyWeight}
                    onChange={(e) => setNewBabyWeight(e.target.value)}
                    placeholder="Ex: 2500"
                    className="rounded-xl"
                    data-testid="baby-weight-input"
                  />
                </div>
                <div>
                  <Label className="text-slate-600 text-sm">Taille (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newBabySize}
                    onChange={(e) => setNewBabySize(e.target.value)}
                    placeholder="Ex: 35"
                    className="rounded-xl"
                    data-testid="baby-size-input"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddBabyMeasures}
                  className="flex-1 btn-rose-bonbon rounded-xl"
                >
                  Enregistrer
                </Button>
                <Button
                  onClick={() => setShowAddBaby(false)}
                  className="btn-rose-bonbon-outline rounded-xl"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {formatBabyData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatBabyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                  domain={['dataMin - 100', 'dataMax + 100']}
                  unit=" g"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#64748B' }} 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  unit=" cm"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="poids" 
                  name="Poids (g)"
                  stroke="#0EA5E9" 
                  strokeWidth={3}
                  dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#0284C7' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="taille" 
                  name="Taille (cm)"
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: '#7C3AED' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Baby className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune donnée de croissance enregistrée</p>
              <p className="text-slate-400 text-sm mt-1">
                Ajoutez les mesures après chaque échographie
              </p>
            </div>
          )}
        </Card>
        </div>

        {/* Info sur les mesures */}
        <Card className={`${cardSoftClayClasses('yellow')} p-4 border-0`}>
          <div className="flex items-start gap-3">
            <IconWell accent="yellow" size="sm" className="flex-shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </IconWell>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Conseil</p>
              <p className="text-slate-600 text-xs mt-1">
                Pesez-vous toujours dans les mêmes conditions (le matin, à jeun) pour des mesures cohérentes.
                Les mesures du bébé proviennent des échographies et sont des estimations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TrackingPage;
