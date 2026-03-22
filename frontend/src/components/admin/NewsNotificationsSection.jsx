import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Megaphone, Mail, Bell, Send, Users, Crown, Gift, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Palette, Settings, FileText, Plus, Rocket } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

const categoryIcons = {
  feature: Sparkles,
  design: Palette,
  improvement: Rocket,
  admin: Settings,
  content: FileText,
  ux: Users,
};

const categoryColors = {
  feature: 'bg-violet-100 text-violet-700',
  design: 'bg-pink-100 text-pink-700',
  improvement: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-slate-100 text-slate-700',
  content: 'bg-amber-100 text-amber-700',
  ux: 'bg-sky-100 text-sky-700',
};

export function NewsNotificationsSection() {
  const [changelog, setChangelog] = useState({ pending: [], notified: [] });
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [channel, setChannel] = useState('both');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(null);
  const [showNotified, setShowNotified] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState('feature');

  useEffect(() => {
    loadChangelog();
  }, []);

  const loadChangelog = async () => {
    try {
      const response = await api.admin.getChangelog();
      setChangelog({
        pending: response.data.pending || [],
        notified: response.data.notified || []
      });
    } catch (error) {
      console.error('Erreur chargement changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (feature) => {
    setSending(feature.id);
    try {
      const response = await api.admin.sendNewsNotification({
        title: feature.title,
        message: feature.message,
        channel,
        target
      });

      // Mark as notified
      await api.admin.markFeatureNotified(feature.id);

      const stats = response.data.stats;
      toast.success(
        `"${feature.title}" envoyé ! ${stats.email_sent} emails, ${stats.push_sent} push`,
        { duration: 5000 }
      );

      // Refresh
      loadChangelog();
      setSelectedFeature(null);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(null);
    }
  };

  const handleAddFeature = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }

    try {
      await api.admin.addChangelogFeature({
        title: newTitle.trim(),
        message: newMessage.trim(),
        category: newCategory
      });
      
      toast.success('Nouveauté ajoutée !');
      setNewTitle('');
      setNewMessage('');
      setShowAddForm(false);
      loadChangelog();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const FeatureCard = ({ feature, isPending }) => {
    const CategoryIcon = categoryIcons[feature.category] || Sparkles;
    const colorClass = categoryColors[feature.category] || 'bg-slate-100 text-slate-700';
    const isSelected = selectedFeature?.id === feature.id;
    const isSending = sending === feature.id;

    return (
      <div className={`border rounded-xl overflow-hidden transition-all ${
        isSelected ? 'border-violet-400 bg-violet-50/50' : 'border-slate-200 bg-white'
      }`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-700">{feature.title}</h4>
                {!isPending && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{feature.message}</p>
              <p className="text-xs text-slate-400 mt-2">{formatDate(feature.date)}</p>
            </div>
          </div>

          {isPending && (
            <div className="mt-4">
              {isSelected ? (
                <div className="space-y-3">
                  {/* Channel selection */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setChannel('both')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        channel === 'both'
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <Bell className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setChannel('email')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        channel === 'email'
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setChannel('push')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        channel === 'push'
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bell className="w-3 h-3" />
                    </button>
                    <div className="border-l border-slate-200 mx-1" />
                    <button
                      onClick={() => setTarget('all')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        target === 'all'
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setTarget('premium')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        target === 'premium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Crown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSend(feature)}
                      disabled={isSending}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-lg py-2 text-sm font-medium"
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1 inline" />
                          Envoyer
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setSelectedFeature(null)}
                      variant="outline"
                      className="px-4 rounded-lg text-sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setSelectedFeature(feature)}
                  className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-lg py-2 text-sm font-medium"
                >
                  <Send className="w-4 h-4 mr-2 inline" />
                  Notifier cette nouveauté
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-pink-50 border-2 border-violet-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">Notifier une nouveauté</h3>
            <p className="text-sm text-slate-500">
              {changelog.pending.length} nouveauté{changelog.pending.length > 1 ? 's' : ''} à envoyer
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Add new feature form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-violet-200">
          <h4 className="font-semibold text-slate-700 mb-3">Ajouter une nouveauté</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre de la nouveauté"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Description..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
            />
            <div className="flex gap-2 flex-wrap">
              {Object.keys(categoryIcons).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newCategory === cat ? categoryColors[cat] : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddFeature} className="bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm">
                Ajouter
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="rounded-lg text-sm">
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Pending features */}
          {changelog.pending.length === 0 ? (
            <div className="text-center py-8 bg-white/50 rounded-xl">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500">Toutes les nouveautés ont été notifiées !</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {changelog.pending.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} isPending={true} />
              ))}
            </div>
          )}

          {/* Already notified toggle */}
          {changelog.notified.length > 0 && (
            <>
              <button
                onClick={() => setShowNotified(!showNotified)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-violet-600 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Déjà notifiées ({changelog.notified.length})
                {showNotified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showNotified && (
                <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto">
                  {changelog.notified.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} isPending={false} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </Card>
  );
}
