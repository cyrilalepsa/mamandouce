import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CalendarHeart, ChevronDown, Stethoscope, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// Conseils médicaux par trimestre/semaine
const getMedicalAdvice = (week) => {
  if (week < 0) return null;
  
  if (week <= 4) {
    return {
      title: "Début de grossesse (Semaines 1-4)",
      advice: [
        "Prenez de l'acide folique (400 µg/jour) pour prévenir les malformations du tube neural",
        "Évitez l'alcool, le tabac et les médicaments non prescrits",
        "Consultez votre médecin pour confirmer la grossesse"
      ],
      urgentSigns: ["Saignements abondants", "Douleurs intenses au ventre"]
    };
  } else if (week <= 12) {
    return {
      title: "Premier trimestre (Semaines 5-12)",
      advice: [
        "Première consultation prénatale obligatoire avant la fin du 3ème mois",
        "Échographie de datation recommandée entre 11 et 13 SA",
        "Prise de sang pour dépistage (toxoplasmose, rubéole, VIH...)",
        "Nausées fréquentes : fractionnez vos repas"
      ],
      urgentSigns: ["Saignements", "Fièvre > 38°C", "Douleurs pelviennes intenses"]
    };
  } else if (week <= 24) {
    return {
      title: "Deuxième trimestre (Semaines 13-24)",
      advice: [
        "Échographie morphologique entre 20 et 24 SA",
        "Consultation mensuelle obligatoire",
        "Surveillez votre prise de poids (environ 1 kg/mois)",
        "Commencez les cours de préparation à l'accouchement"
      ],
      urgentSigns: ["Contractions régulières", "Perte de liquide", "Diminution des mouvements du bébé"]
    };
  } else if (week <= 36) {
    return {
      title: "Troisième trimestre (Semaines 25-36)",
      advice: [
        "Consultations toutes les 3-4 semaines",
        "Échographie du 3ème trimestre vers 32 SA",
        "Préparez votre valise de maternité",
        "Surveillez les mouvements du bébé quotidiennement"
      ],
      urgentSigns: ["Contractions douloureuses et régulières", "Saignements", "Maux de tête violents", "Gonflement soudain"]
    };
  } else {
    return {
      title: "Fin de grossesse (Semaines 37+)",
      advice: [
        "Consultation hebdomadaire",
        "Monitoring du bébé si dépassement du terme",
        "Restez attentive aux signes du travail",
        "Gardez vos documents médicaux à portée de main"
      ],
      urgentSigns: ["Perte des eaux", "Contractions toutes les 5 minutes", "Saignements", "Absence de mouvements du bébé"]
    };
  }
};

function PregnancyCalculator() {
  const navigate = useNavigate();
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleDuration, setCycleDuration] = useState(28);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.pregnancy.calculate({ 
        last_period_date: lastPeriodDate,
        cycle_duration: cycleDuration
      });
      setResults(response.data);
      toast.success('Calcul effectué avec succès!');
    } catch (error) {
      toast.error('Erreur lors du calcul');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate cycle duration options from 24 to 34 days
  const cycleDurations = Array.from({ length: 11 }, (_, i) => 24 + i);

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Calculateur de grossesse" />

        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl flex items-center justify-center">
              <CalendarHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Calculez vos dates</h2>
              <p className="text-slate-500">Ovulation, conception et accouchement</p>
            </div>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <Label htmlFor="lastPeriod" className="text-slate-600 font-semibold">Date de vos dernières règles</Label>
              <Input
                id="lastPeriod"
                data-testid="last-period-input"
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="cycleDuration" className="text-slate-600 font-semibold">Durée de votre cycle menstruel</Label>
              <div className="relative">
                <select
                  id="cycleDuration"
                  data-testid="cycle-duration-select"
                  value={cycleDuration}
                  onChange={(e) => setCycleDuration(parseInt(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 appearance-none cursor-pointer"
                >
                  {cycleDurations.map(days => (
                    <option key={days} value={days}>
                      {days} jours {days === 28 && '(standard)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                La durée moyenne d'un cycle est de 28 jours, mais peut varier de 24 à 34 jours.
              </p>
            </div>

            <Button
              type="submit"
              data-testid="calculate-button"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
            >
              {loading ? 'Calcul en cours...' : 'Calculer'}
            </Button>
          </form>
        </Card>

        {results && (
          <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="results-card">
            <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Résultats</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date des prochaines règles</p>
                <p className="text-lg font-bold text-purple-600">{formatDate(results.next_period_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date d'ovulation estimée</p>
                <p className="text-lg font-bold text-sky-600">{formatDate(results.ovulation_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date de conception estimée</p>
                <p className="text-lg font-bold text-pink-600">{formatDate(results.conception_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date de nidation estimée</p>
                <p className="text-lg font-bold text-amber-600">{formatDate(results.implantation_date)}</p>
                <p className="text-xs text-slate-400 mt-1">Environ 9 jours après l'ovulation</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date prévue d'accouchement</p>
                <p className="text-lg font-bold text-rose-600">{formatDate(results.due_date)}</p>
              </div>

              <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">Semaines de grossesse</p>
                <p className="text-3xl font-bold text-slate-700">{results.weeks_pregnant} semaines</p>
              </div>
            </div>
          </Card>
        )}

        {/* Conseils médicaux */}
        {results && results.weeks_pregnant >= 0 && getMedicalAdvice(results.weeks_pregnant) && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="medical-advice-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-400 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {getMedicalAdvice(results.weeks_pregnant).title}
                </h3>
                <p className="text-sm text-slate-500">Conseils pour cette période</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {getMedicalAdvice(results.weeks_pregnant).advice.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-teal-50 rounded-xl p-3">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-slate-700">{tip}</p>
                </div>
              ))}
            </div>

            {/* Signes d'urgence */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-red-700 text-sm">Consultez en urgence si :</h4>
              </div>
              <ul className="space-y-1">
                {getMedicalAdvice(results.weeks_pregnant).urgentSigns.map((sign, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Important :</strong> Ces informations sont données à titre indicatif et ne remplacent en aucun cas l'avis d'un professionnel de santé. 
                En cas de doute ou de symptômes inhabituels, <strong>consultez immédiatement votre médecin ou votre sage-femme</strong>.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PregnancyCalculator;
