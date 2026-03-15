import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { CalendarDays, Settings, Save, CalendarRange, Egg, Heart, Droplets, Baby } from 'lucide-react';

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
  const [showForm, setShowForm] = useState(false);

  const formatDateFull = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
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
          <h2 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Mon agenda</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenCalendar}
            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 rounded-full p-2 hover:from-purple-200 hover:to-pink-200"
            title="Ouvrir le calendrier"
            data-testid="open-calendar-btn"
          >
            <CalendarRange className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-100 text-slate-600 rounded-full p-2 hover:bg-slate-200"
            title="Modifier"
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
              Date de vos dernières règles
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
              Durée de votre cycle
            </label>
            <select
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600"
              data-testid="agenda-cycle-select"
            >
              {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                <option key={days} value={days}>{days} jours {days === 28 && '(standard)'}</option>
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
            {loading ? 'Enregistrement...' : 'Enregistrer'}
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
                      {agendaData.isOvulationDay ? "Jour d'ovulation !" : "Période fertile en cours"}
                    </p>
                    <span className="animate-pulse w-2 h-2 bg-rose-500 rounded-full"></span>
                  </div>
                  <p className="text-sm text-rose-600">
                    {agendaData.isOvulationDay 
                      ? "C'est le moment idéal pour concevoir"
                      : `Pic d'ovulation dans ${agendaData.daysToOvulation} jour(s)`}
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
                <p className="text-sm text-slate-500 font-semibold">Pic d'ovulation</p>
                <p className="text-lg font-bold text-sky-600">{formatDateFull(agendaData.ovulationDate)}</p>
                {agendaData.daysToOvulation > 0 && !agendaData.isOvulationDay && (
                  <p className="text-xs text-slate-500">Dans {agendaData.daysToOvulation} jour(s)</p>
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
                <p className="text-sm text-slate-500 font-semibold">Fenêtre de fertilité</p>
                <p className="text-base font-bold text-emerald-600">
                  Du {formatDateShort(agendaData.fertileStart)} au {formatDateShort(agendaData.fertileEnd)}
                </p>
                <p className="text-xs text-slate-500">Période la plus favorable à la conception</p>
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
                <p className="text-sm text-slate-500 font-semibold">Prochaines règles</p>
                <p className="text-lg font-bold text-pink-600">{formatDateFull(agendaData.nextPeriod)}</p>
                {agendaData.daysToNextPeriod > 0 && (
                  <p className="text-xs text-slate-500">Dans {agendaData.daysToNextPeriod} jour(s)</p>
                )}
              </div>
            </div>
          </div>

          {/* Nidation estimée si rapports enregistrés */}
          {getNextImplantation && getNextImplantation() && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-semibold">Nidation estimée</p>
                  <p className="text-base font-bold text-amber-600">
                    Du {formatDateShort(getNextImplantation().early)} au {formatDateShort(getNextImplantation().late)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Basé sur le rapport du {formatDateShort(getNextImplantation().rapportDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rapports enregistrés */}
          {rapportDates && rapportDates.length > 0 && (
            <div className="bg-rose-50 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-semibold text-rose-700">Rapports enregistrés</span>
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
              Cycle de {agendaData.cycleLength} jours • Dernières règles : {formatDateShort(lastPeriodDate)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">Renseignez la date de vos dernières règles pour voir vos prévisions</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2"
          >
            Configurer mon cycle
          </Button>
        </div>
      )}
    </Card>
  );
}
