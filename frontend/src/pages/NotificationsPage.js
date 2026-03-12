import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Bell, Plus, Check, Trash2, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import api from '../utils/api';
import { toast } from 'sonner';

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.notifications.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.notifications.create(formData);
      toast.success('Rappel ajouté!');
      setShowDialog(false);
      setFormData({ title: '', description: '', date: '', time: '' });
      loadNotifications();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await api.notifications.update(id, !currentStatus);
      loadNotifications();
      toast.success(!currentStatus ? 'Rappel terminé' : 'Rappel réactivé');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.notifications.delete(id);
      loadNotifications();
      toast.success('Rappel supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await api.email.sendReminder(id);
      toast.success('Email de rappel envoyé!');
    } catch (error) {
      if (error.response?.status === 503) {
        toast.error('Service email non configuré. Ajoutez votre clé API Resend.');
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-slate-700 flex-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Rappels médicaux</h1>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-notification-button"
                className="bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-sky-200/50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-3xl" data-testid="add-notification-dialog">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Nouveau rappel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title" className="text-slate-600 font-semibold">Titre</Label>
                  <Input
                    id="title"
                    data-testid="notification-title-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-slate-600 font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="notification-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-2xl"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-slate-600 font-semibold">Date</Label>
                  <Input
                    id="date"
                    data-testid="notification-date-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="rounded-2xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-slate-600 font-semibold">Heure (optionnel)</Label>
                  <Input
                    id="time"
                    data-testid="notification-time-input"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
                <Button
                  type="submit"
                  data-testid="submit-notification-button"
                  className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold"
                >
                  Ajouter le rappel
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-slate-500">Chargement...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center" data-testid="empty-notifications">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Aucun rappel</h3>
            <p className="text-slate-500">Ajoutez vos rendez-vous médicaux</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <Card
                key={notif.id}
                className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 ${notif.completed ? 'opacity-60' : ''}`}
                data-testid={`notification-item-${index}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(notif.id, notif.completed)}
                    data-testid={`toggle-notification-${index}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.completed ? 'bg-green-100' : 'bg-slate-100'}`}
                  >
                    {notif.completed && <Check className="w-5 h-5 text-green-600" />}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-bold text-slate-700 ${notif.completed ? 'line-through' : ''}`}>{notif.title}</h4>
                    {notif.description && (
                      <p className="text-sm text-slate-500 mt-1">{notif.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">{formatDate(notif.date)}</span>
                      {notif.time && <span className="text-xs text-sky-500 font-semibold">{notif.time}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendEmail(notif.id)}
                      data-testid={`email-notification-${index}`}
                      className="text-sky-400 hover:text-sky-600"
                      title="Envoyer par email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      data-testid={`delete-notification-${index}`}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
