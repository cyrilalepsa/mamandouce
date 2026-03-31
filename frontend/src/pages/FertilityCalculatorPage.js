import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calculator, CalendarDays, Droplets, Egg } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';

function FertilityCalculatorPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [results, setResults] = useState(null);

  const calculate = () => {
    if (!lastPeriodDate) return;
    
    const lastPeriod = new Date(lastPeriodDate);
    const cycleLen = parseInt(cycleLength) || 28;
    
    // Prochaine ovulation (14 jours avant les prochaines règles)
    const nextOvulation = new Date(lastPeriod);
    nextOvulation.setDate(nextOvulation.getDate() + cycleLen - 14);
    
    // Prochaines règles
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    
    // Jours restants
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysToOvulation = Math.ceil((nextOvulation - today) / (1000 * 60 * 60 * 24));
    const daysToPeriod = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    
    setResults({
      nextOvulation,
      nextPeriod,
      daysToOvulation,
      daysToPeriod,
      cycleLength: cycleLen
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/section/preconception')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-purple-600 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {t('fertility.calculator', 'Calculateur fertilité')}
            </h1>
            <p className="text-sm text-slate-500">
              {t('fertility.calculatorDesc', 'Prochaines règles & ovulation')}
            </p>
          </div>
        </div>

        {/* Formulaire direct */}
        <Card className="p-5 mb-6 bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-purple-100">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">
                {t('fertility.lastPeriodDate', 'Date des dernières règles')}
              </label>
              <Input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">
                {t('fertility.cycleLength', 'Durée du cycle (jours)')}
              </label>
              <select
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600"
              >
                {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map(days => (
                  <option key={days} value={days}>
                    {days} jours {days === 28 && '(standard)'}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={calculate}
              disabled={!lastPeriodDate}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl disabled:opacity-50"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              {t('fertility.calculate', 'Calculer')}
            </Button>
          </div>
        </Card>

        {/* Résultats */}
        {results && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Prochaine Ovulation */}
            <Card className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-4 border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-md">
                  <Egg className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-medium">{t('fertility.nextOvulation', 'Prochaine ovulation')}</p>
                  <p className="text-xl font-bold text-sky-600 capitalize">{formatDate(results.nextOvulation)}</p>
                  {results.daysToOvulation > 0 ? (
                    <p className="text-sm text-sky-500">
                      Dans <span className="font-bold">{results.daysToOvulation}</span> jour{results.daysToOvulation > 1 ? 's' : ''}
                    </p>
                  ) : results.daysToOvulation === 0 ? (
                    <p className="text-sm text-sky-500 font-bold">C'est aujourd'hui !</p>
                  ) : (
                    <p className="text-sm text-slate-400">Passée</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Prochaines Règles */}
            <Card className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center shadow-md">
                  <Droplets className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-medium">{t('fertility.nextPeriod', 'Prochaines règles')}</p>
                  <p className="text-xl font-bold text-pink-600 capitalize">{formatDate(results.nextPeriod)}</p>
                  {results.daysToPeriod > 0 ? (
                    <p className="text-sm text-pink-500">
                      Dans <span className="font-bold">{results.daysToPeriod}</span> jour{results.daysToPeriod > 1 ? 's' : ''}
                    </p>
                  ) : results.daysToPeriod === 0 ? (
                    <p className="text-sm text-pink-500 font-bold">C'est aujourd'hui !</p>
                  ) : (
                    <p className="text-sm text-slate-400">Passées</p>
                  )}
                </div>
              </div>
            </Card>

            <p className="text-xs text-slate-400 text-center pt-2">
              Estimations basées sur un cycle de {results.cycleLength} jours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FertilityCalculatorPage;
