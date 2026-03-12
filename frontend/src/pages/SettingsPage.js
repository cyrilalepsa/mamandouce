import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { ArrowLeft, Bell, Mail, BookOpen, Calendar, Check } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function SettingsPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_tips: true,
    appointment_reminders: true,
    email_address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.preferences.get();
      setPreferences(response.data);
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.preferences.update(preferences);
      toast.success('Préférences enregistrées!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Paramètres</h1>
        </div>

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : (
          <>
            <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-300 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Notifications par email</h2>
                  <p className="text-slate-500">Gérez vos préférences de notifications</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-slate-600 font-semibold">Adresse email</Label>
                  <Input
                    id="email"
                    data-testid="email-address-input"
                    type="email"
                    value={preferences.email_address}
                    onChange={(e) => setPreferences({ ...preferences, email_address: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 bg-white px-4 py-3 text-slate-600 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  {/* Notifications générales */}
                  <div
                    onClick={() => handleToggle('email_notifications')}
                    data-testid="toggle-email-notifications"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-sky-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Notifications par email</p>
                        <p className="text-sm text-slate-500">Recevoir des emails de rappel</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.email_notifications ? 'bg-sky-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.email_notifications ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Conseils hebdomadaires */}
                  <div
                    onClick={() => handleToggle('weekly_tips')}
                    data-testid="toggle-weekly-tips"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-teal-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Conseils hebdomadaires</p>
                        <p className="text-sm text-slate-500">Recevoir les conseils chaque semaine</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.weekly_tips ? 'bg-teal-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.weekly_tips ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Rappels rendez-vous */}
                  <div
                    onClick={() => handleToggle('appointment_reminders')}
                    data-testid="toggle-appointment-reminders"
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Rappels de rendez-vous</p>
                        <p className="text-sm text-slate-500">Rappels pour vos rdv médicaux</p>
                      </div>
                    </div>
                    <div
                      className={`w-14 h-8 rounded-full flex items-center transition-colors ${
                        preferences.appointment_reminders ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          preferences.appointment_reminders ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                data-testid="save-preferences-button"
                disabled={saving}
                className="w-full mt-6 bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-teal-50 rounded-3xl p-6 border-0">
              <h4 className="font-bold text-slate-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <Mail className="inline w-5 h-5 mr-2" />
                À propos des notifications email
              </h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Les emails sont envoyés automatiquement selon vos préférences</li>
                <li>• Vous recevrez un conseil hebdomadaire adapté à votre semaine de grossesse</li>
                <li>• Les rappels de rendez-vous sont envoyés la veille</li>
                <li>• Vous pouvez désactiver les notifications à tout moment</li>
                <li>• Configuration requise : Clé API Resend dans le backend</li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
