import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, Plus, Calendar, Clock, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import api from '../utils/api';
import { toast } from 'sonner';

function RemindersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: '',
    time: '09:00',
    type: 'rdv'
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await api.medical.getScheduledReminders();
      // L'API retourne {reminders: [...]}
      setReminders(response.data?.reminders || []);
    } catch (error) {
      console.error('Erreur chargement rappels:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.date) {
      toast.error('Veuillez remplir le titre et la date');
      return;
    }
    
    try {
      const reminderDatetime = `${newReminder.date}T${newReminder.time}:00`;
      await api.medical.scheduleReminder(null, reminderDatetime, 'push');
      toast.success('Rappel ajouté !');
      setNewReminder({ title: '', date: '', time: '09:00', type: 'rdv' });
      setShowAddForm(false);
      loadReminders();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du rappel');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.medical.deleteReminder(reminderId);
      toast.success('Rappel supprimé');
      loadReminders();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateStr) => {
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-amber-600 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('reminders.title', 'Mes Rappels')}
            </h1>
            <p className="text-sm text-slate-500">
              {t('reminders.subtitle', 'RDV médicaux et événements importants')}
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <Card className="p-4 mb-6 bg-white/90 rounded-2xl shadow-sm border border-amber-100 animate-in slide-in-from-top-2">
            <h3 className="font-semibold text-slate-700 mb-3">Nouveau rappel</h3>
            <div className="space-y-3">
              <Input
                placeholder="Titre du rappel (ex: RDV échographie)"
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                className="rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Heure</label>
                  <Input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddReminder}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Rappels post-partum pré-définis */}
        {reminders.length === 0 && !showAddForm && (
          <div className="mb-6 p-4 rounded-2xl" style={{
            background: 'linear-gradient(160deg, #ffffff 0%, #fefefe 30%, #fafafa 100%)',
            boxShadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}>
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">RDV post-partum recommandés</h3>
            <div className="space-y-2">
              {[
                { title: 'Visite post-natale (6-8 semaines)', weeks: 7, icon: '🩺' },
                { title: 'Rééducation périnéale', weeks: 8, icon: '🏥' },
                { title: 'Visite pédiatrique 1er mois', weeks: 4, icon: '👶' },
                { title: 'Vaccin bébé - 2 mois', weeks: 8, icon: '💉' },
                { title: 'Visite pédiatrique 4 mois', weeks: 16, icon: '👶' },
              ].map((rdv, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + rdv.weeks * 7);
                    const dateStr = date.toISOString().split('T')[0];
                    setNewReminder({ title: rdv.title, date: dateStr, time: '09:00', type: 'rdv' });
                    setShowAddForm(true);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 transition-colors text-left"
                  data-testid={`preset-rdv-${i}`}
                >
                  <span className="text-lg">{rdv.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{rdv.title}</p>
                    <p className="text-xs text-slate-400">Dans ~{rdv.weeks} semaines</p>
                  </div>
                  <Plus className="w-4 h-4 text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des rappels */}
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-2">Chargement...</p>
          </div>
        ) : reminders.length === 0 ? (
          <Card className="p-8 text-center bg-white/80 rounded-2xl">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">Aucun rappel programmé</p>
            <p className="text-xs text-slate-400">
              Ajoutez vos RDV médicaux et événements importants
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder, index) => (
              <Card 
                key={reminder.id || index}
                className={`p-4 rounded-2xl border transition-all ${
                  isUpcoming(reminder.datetime) 
                    ? 'bg-white border-amber-100' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isUpcoming(reminder.datetime) 
                      ? 'bg-gradient-to-br from-amber-100 to-orange-100' 
                      : 'bg-slate-100'
                  }`}>
                    {isUpcoming(reminder.datetime) ? (
                      <Calendar className="w-5 h-5 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700">
                      {reminder.title || 'Rappel'}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(reminder.datetime)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RemindersPage;
