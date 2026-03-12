import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CalendarHeart, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

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
                <p className="text-sm text-slate-500 font-semibold">Date d'ovulation estimée</p>
                <p className="text-lg font-bold text-sky-600">{formatDate(results.ovulation_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date de conception estimée</p>
                <p className="text-lg font-bold text-pink-600">{formatDate(results.conception_date)}</p>
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
      </div>
    </div>
  );
}

export default PregnancyCalculator;
