import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { CalendarDays, Settings, Save, CalendarRange, Egg, Heart, Droplets, Baby, Info } from 'lucide-react';
import { getCurrentLanguage } from '../../i18n';

export function AgendaCard({ 
  agendaData,
  lastPeriodDate,
  setLastPeriodDate,
  cycleLength,
  setCycleLength,
  onSave,
  loading,
  onOpenCalendar,
  rapportDates,
  getNextImplantation
}) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
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

  // Capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDateFull = (date) => {
    if (!date) return '';
    const formatted = new Date(date).toLocaleDateString(getLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    return capitalize(formatted);
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleSave = async () => {
    await onSave();
    setShowForm(false);
  };

  return (
    <Card className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="agenda-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{t('home.myAgenda')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCalendar}
            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full p-2 hover:from-purple-200 hover:to-pink-200"
            title={t('fertility.openCalendar', 'Ouvrir le calendrier')}
            data-testid="open-calendar-btn"
          >
            <CalendarRange className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-100 text-slate-600 rounded-full p-2 hover:bg-slate-200"
            title={t('common.edit')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Formulaire de saisie */}
      {showForm && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">
              {t('home.lastPeriodDate')}
            </label>
            <Input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="rounded-xl border-slate-200"
              data-testid="agenda-period-input"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">
              {t('home.cycleLength')}
            </label>
            <select
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600"
              data-testid="agenda-cycle-select"
            >
              {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                <option key={days} value={days}>{days} {t('home.days')} {days === 28 && `(${t('common.standard')})`}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2"
            data-testid="agenda-save-button"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('common.sending') : t('common.save')}
          </Button>
        </div>
      )}

      {/* Affichage des dates calculées */}
      {agendaData ? (
        <div className="space-y-3">
          {/* Alerte période fertile */}
          {agendaData.inFertileWindow && (
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-4 border-2 border-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-400 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-rose-700">
                      {agendaData.isOvulationDay ? t('fertility.ovulationToday') : t('fertility.inFertileWindow')}
                    </p>
                    <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
                  </div>
                  <p className="text-sm text-rose-600">
                    {agendaData.isOvulationDay 
                      ? t('calculator.ovulationTip', "C'est le moment idéal pour concevoir")
                      : `${t('calculator.ovulationPeak')} ${t('calculator.inDays', { days: agendaData.daysToOvulation })}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pic d'ovulation */}
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-xl flex items-center justify-center">
                <Egg className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.ovulationPeak')}</p>
                <p className="text-lg font-bold text-sky-600">{formatDateFull(agendaData.ovulationDate)}</p>
                {agendaData.daysToOvulation > 0 && !agendaData.isOvulationDay && (
                  <p className="text-xs text-slate-500">{t('calculator.inDays', { days: agendaData.daysToOvulation })}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fenêtre de fertilité */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-semibold">{t('calculator.fertileWindow')}</p>
                <p className="text-base font-bold text-emerald-600">
                  {t('calculator.from')} {formatDateShort(agendaData.fertileStart)} {t('calculator.to')} {formatDateShort(agendaData.fertileEnd)}
                </p>
                <p className="text-xs text-slate-500">{t('calculator.favorableDays')}</p>
              </div>
            </div>
            
            {/* Conseil test d'ovulation */}
            <div className="mt-3 pt-3 border-t border-emerald-100">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-xs text-emerald-700 font-medium">
                    {t('fertility.clearblueAdvice')}
                  </p>
                </div>
                <a 
                  href="https://fr.clearblue.com/tests-ovulation" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow border border-emerald-200"
                  title={t('common.info')}
                >
                  <Info className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Prochaines règles */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 font-semibold">{t('fertility.nextPeriod')}</p>
                <p className="text-lg font-bold text-pink-600">{formatDateFull(agendaData.nextPeriod)}</p>
                {agendaData.daysToNextPeriod > 0 && (
                  <p className="text-xs text-slate-500">{t('calculator.inDays', { days: agendaData.daysToNextPeriod })}</p>
                )}
              </div>
            </div>
          </div>

          {/* Nidation estimée — Version Pédagogique avec Mode Fantôme si pas de rapport */}
          {(() => {
            const implantation = getNextImplantation && getNextImplantation();
            if (!implantation || !agendaData) return null;
            
            const rapportDate = new Date(implantation.rapportDate);
            const fertileStart = new Date(agendaData.fertileStart);
            const fertileEnd = new Date(agendaData.fertileEnd);
            const isInFertileWindow = rapportDate >= fertileStart && rapportDate <= fertileEnd;
            
            if (!isInFertileWindow) {
              return (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-10 h-10 bg-slate-300 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 font-semibold">Nidation estimée</p>
                      <p className="text-xs text-slate-500 leading-normal mt-0.5">
                        Elle s'affichera ici dès qu'un rapport sexuel sera enregistré durant votre fenêtre de fertilité.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                    <Baby className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 font-semibold">Nidation estimée</p>
                    <p className="text-base font-bold text-amber-600">
                      Du {formatDateShort(implantation.early)} au {formatDateShort(implantation.late)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Basé sur le rapport du {formatDateShort(implantation.rapportDate)} (période fertile)
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Rapports enregistrés */}
          {rapportDates && rapportDates.length > 0 && (
            <div className="bg-rose-50 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-rose-700">{t('fertility.recordedIntercourse', 'Rapports enregistrés')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {rapportDates.slice(-5).map((date, index) => (
                  <span key={index} className="bg-white text-rose-600 text-xs px-2 py-1 rounded-full border border-rose-200">
                    {formatDateShort(date)}
                  </span>
                ))}
                {rapportDates.length > 5 && (
                  <span className="text-xs text-rose-500">+{rapportDates.length - 5}</span>
                )}
              </div>
            </div>
          )}

          {/* Info cycle */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              {t('home.cycleLength')}: {agendaData.cycleLength} {t('home.days')} • {t('home.lastPeriodDate')}: {formatDateShort(lastPeriodDate)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">{t('fertility.enterPeriodDate', 'Renseignez la date de vos dernières règles pour voir vos prévisions')}</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2"
          >
            {t('home.configureMyeCycle')}
          </Button>
        </div>
      )}
    </Card>
  );
}