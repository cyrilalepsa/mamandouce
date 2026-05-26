import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CalendarHeart, ChevronDown, Stethoscope, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { getCurrentLanguage } from '../i18n';

// Conseils médicaux par trimestre/semaine
const getMedicalAdvice = (week, t) => {
  if (week < 0) return null;
  
  if (week <= 4) {
    return {
      title: t('calculator.earlyPregnancy'),
      advice: [
        t('medicalAdvice.folicAcid', "Prenez de l'acide folique (400 µg/jour) pour prévenir les malformations du tube neural"),
        t('medicalAdvice.avoidAlcohol', "Évitez l'alcool, le tabac et les médicaments non prescrits"),
        t('medicalAdvice.confirmPregnancy', "Consultez votre médecin pour confirmer la grossesse")
      ],
      urgentSigns: [
        t('medicalAdvice.heavyBleeding', "Saignements abondants"), 
        t('medicalAdvice.intensePain', "Douleurs intenses au ventre")
      ]
    };
  } else if (week <= 12) {
    return {
      title: t('calculator.firstTrimesterAdvice'),
      advice: [
        t('medicalAdvice.firstConsultation', "Première consultation prénatale obligatoire avant la fin du 3ème mois"),
        t('medicalAdvice.datingUltrasound', "Échographie de datation recommandée entre 11 et 13 SA"),
        t('medicalAdvice.bloodTest', "Prise de sang pour dépistage (toxoplasmose, rubéole, VIH...)"),
        t('medicalAdvice.nausea', "Nausées fréquentes : fractionnez vos repas")
      ],
      urgentSigns: [
        t('medicalAdvice.bleeding', "Saignements"), 
        t('medicalAdvice.fever', "Fièvre > 38°C"), 
        t('medicalAdvice.pelvicPain', "Douleurs pelviennes intenses")
      ]
    };
  } else if (week <= 24) {
    return {
      title: t('calculator.secondTrimesterAdvice'),
      advice: [
        t('medicalAdvice.morphologyUltrasound', "Échographie morphologique entre 20 et 24 SA"),
        t('medicalAdvice.monthlyConsultation', "Consultation mensuelle obligatoire"),
        t('medicalAdvice.weightGain', "Surveillez votre prise de poids (environ 1 kg/mois)"),
        t('medicalAdvice.birthPrep', "Commencez les cours de préparation à l'accouchement")
      ],
      urgentSigns: [
        t('medicalAdvice.regularContractions', "Contractions régulières"), 
        t('medicalAdvice.fluidLoss', "Perte de liquide"), 
        t('medicalAdvice.decreasedMovement', "Diminution des mouvements du bébé")
      ]
    };
  } else if (week <= 36) {
    return {
      title: t('calculator.thirdTrimesterAdvice'),
      advice: [
        t('medicalAdvice.frequentConsultations', "Consultations toutes les 3-4 semaines"),
        t('medicalAdvice.thirdUltrasound', "Échographie du 3ème trimestre vers 32 SA"),
        t('medicalAdvice.packBag', "Préparez votre valise de maternité"),
        t('medicalAdvice.monitorMovements', "Surveillez les mouvements du bébé quotidiennement")
      ],
      urgentSigns: [
        t('medicalAdvice.painfulContractions', "Contractions douloureuses et régulières"), 
        t('medicalAdvice.bleeding', "Saignements"), 
        t('medicalAdvice.severeHeadache', "Maux de tête violents"), 
        t('medicalAdvice.suddenSwelling', "Gonflement soudain")
      ]
    };
  } else {
    return {
      title: t('calculator.endOfPregnancy'),
      advice: [
        t('medicalAdvice.weeklyConsultation', "Consultation hebdomadaire"),
        t('medicalAdvice.monitoring', "Monitoring du bébé si dépassement du terme"),
        t('medicalAdvice.laborSigns', "Restez attentive aux signes du travail"),
        t('medicalAdvice.keepDocuments', "Gardez vos documents médicaux à portée de main")
      ],
      urgentSigns: [
        t('medicalAdvice.waterBreak', "Perte des eaux"), 
        t('medicalAdvice.contractions5min', "Contractions toutes les 5 minutes"), 
        t('medicalAdvice.bleeding', "Saignements"), 
        t('medicalAdvice.noMovement', "Absence de mouvements du bébé")
      ]
    };
  }
};

function PregnancyCalculator() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleDuration, setCycleDuration] = useState(28);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentLang = getCurrentLanguage();

  // Get locale for date formatting
  const getLocale = () => {
    const localeMap = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'es': 'es-ES',
      'pt': 'pt-PT',
      'it': 'it-IT',
      'de': 'de-DE'
    };
    return localeMap[currentLang] || 'fr-FR';
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.pregnancy.calculate({ 
        last_period_date: lastPeriodDate,
        cycle_length: cycleDuration
      });
      setResults(response.data);
      toast.success(t('calculator.calculationSuccess'));
    } catch (error) {
      toast.error(t('calculator.calculationError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(getLocale(), {
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
        <PageHeader title={t('calculator.title')} />

        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl flex items-center justify-center">
              <CalendarHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('calculator.calculateYourDates')}</h2>
              <p className="text-slate-500">{t('calculator.ovulationConceptionDelivery')}</p>
            </div>
          </div>

          <form onSubmit={handleCalculate} className="space-y-5">
            <div>
              <Label htmlFor="lastPeriod" className="text-slate-600 font-semibold">{t('calculator.lastPeriodLabel')}</Label>
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
              <Label htmlFor="cycleDuration" className="text-slate-600 font-semibold">{t('calculator.cycleLengthLabel')}</Label>
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
                      {days} {t('calculator.daysUnit')} {days === 28 && `(${t('common.standard')})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {t('calculator.cycleLengthHelp')}
              </p>
            </div>

            <Button
              type="submit"
              data-testid="calculate-button"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
            >
              {loading ? t('common.calculating') : t('calculator.calculate')}
            </Button>
          </form>
        </Card>

        {results && (
          <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="results-card">
            <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('calculator.results')}</h3>
            
            <div className="space-y-4">
              {/* Âge gestationnel */}
              <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">{t('calculator.gestationalAge')}</p>
                <p className="text-3xl font-bold text-slate-700">{results.gestational_age || `${results.weeks_pregnant} SA`}</p>
                <p className="text-sm text-slate-500 mt-1">{t('calculator.trimester')} {results.trimester}</p>
              </div>

              {/* Ovulation - Pic de fertilité */}
              <div className="bg-white rounded-2xl p-4 border-l-4 border-sky-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-500 font-semibold">{t('calculator.ovulationPeak')}</span>
                  <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">{t('calculator.keyDate')}</span>
                </div>
                <p className="text-2xl font-bold text-sky-600">{formatDate(results.ovulation_date)}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {results.explanations?.ovulation || `${t('calculator.dayOf')} ${results.days_to_ovulation} ${t('calculator.ofCycle')}`}
                </p>
                <div className="mt-3 bg-sky-50 rounded-xl p-3">
                  <p className="text-xs text-sky-700">
                    <strong>{t('calculator.tip')} :</strong> {t('calculator.ovulationTip')}
                  </p>
                </div>
              </div>

              {/* Fenêtre de fertilité */}
              <div className="bg-white rounded-2xl p-4 border-l-4 border-emerald-400">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.fertileWindow')}</p>
                <p className="text-lg font-bold text-emerald-600">
                  {t('calculator.from')} {formatDate(results.fertile_window_start)} {t('calculator.to')} {formatDate(results.fertile_window_end)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {results.fertile_days} {t('calculator.favorableDays')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                    {t('calculator.fertileDays')}
                  </span>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-semibold">
                    {t('calculator.peak')} : {formatDate(results.ovulation_date)}
                  </span>
                </div>
              </div>

              {/* Conception */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.conceptionDate')}</p>
                <p className="text-lg font-bold text-pink-600">{formatDate(results.conception_date)}</p>
              </div>

              {/* Nidation avec plage */}
              <div className="bg-white rounded-2xl p-4 border-l-4 border-amber-400">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.implantationWindow')}</p>
                <p className="text-lg font-bold text-amber-600">
                  {t('calculator.from')} {formatDate(results.implantation_window_start)} {t('calculator.to')} {formatDate(results.implantation_window_end)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t('calculator.mostProbableDate')} : {formatDate(results.implantation_date)}
                </p>
              </div>

              {/* Prochaines règles */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.nextPeriod')}</p>
                <p className="text-lg font-bold text-purple-600">{formatDate(results.next_period_date)}</p>
              </div>

              {/* Date d'accouchement avec plage */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-4 border-2 border-rose-200">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.dueDate')}</p>
                <p className="text-2xl font-bold text-rose-600">{formatDate(results.due_date)}</p>
                <p className="text-sm text-slate-500 mt-2">
                  {t('calculator.dueDateRange')} : {t('calculator.from')} {formatDate(results.due_date_earliest)} {t('calculator.to')} {formatDate(results.due_date_latest)}
                </p>
                {results.days_until_due > 0 && (
                  <p className="text-xs text-rose-500 font-semibold mt-2">
                    {t('calculator.inDays', { days: results.days_until_due })}
                  </p>
                )}
              </div>

              {/* Explications */}
              {results.explanations && (
                <div className="bg-slate-50 rounded-2xl p-4 mt-4">
                  <p className="text-sm font-semibold text-slate-600 mb-2">{t('calculator.understandCalculations')}</p>
                  <div className="space-y-2 text-xs text-slate-500">
                    <p>{results.explanations.due_date}</p>
                    <p>{results.explanations.implantation}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Conseils médicaux */}
        {results && results.weeks_pregnant >= 0 && getMedicalAdvice(results.weeks_pregnant, t) && (
          <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="medical-advice-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-400 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {getMedicalAdvice(results.weeks_pregnant, t).title}
                </h3>
                <p className="text-sm text-slate-500">{t('calculator.medicalAdvice')}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {getMedicalAdvice(results.weeks_pregnant, t).advice.map((tip, index) => (
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
                <h4 className="font-bold text-red-700 text-sm">{t('calculator.consultUrgently')}</h4>
              </div>
              <ul className="space-y-1">
                {getMedicalAdvice(results.weeks_pregnant, t).urgentSigns.map((sign, index) => (
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
                <strong>{t('calculator.important')} :</strong> {t('calculator.medicalDisclaimer')}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PregnancyCalculator;
