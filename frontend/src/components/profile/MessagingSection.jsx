import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MessageSquare, ChevronDown, ChevronUp, Send, Clock, CheckCircle, 
  Mail, User, Shield, Inbox, MessageCircle, HelpCircle
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function MessagingSection() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('exchanges');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.contact.getMyMessages();
      setMessages(response.data.messages || []);
      setUnreadCount(response.data.unread_replies || 0);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
      return;
    }
    
    setExpandedMessage(messageId);
    setReplyText('');
    
    const msg = messages.find(m => m.id === messageId);
    if (msg?.admin_reply && !msg?.user_read_reply) {
      try {
        await api.contact.markReplyRead(messageId);
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, user_read_reply: true } : m
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Veuillez écrire un message');
      return;
    }
    
    setSending(true);
    try {
      await api.contact.replyToConversation(messageId, replyText);
      toast.success('Réponse envoyée !');
      setReplyText('');
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleSendContact = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setSendingContact(true);
    try {
      await api.contact.sendMessage({ subject: contactSubject, message: contactMessage });
      toast.success('Message envoyé !');
      setContactSubject('');
      setContactMessage('');
      setShowContactForm(false);
      setActiveTab('exchanges');
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSendingContact(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "À l'instant";
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'exchanges', label: 'Mes échanges', icon: MessageCircle, count: messages.length },
    { id: 'contact', label: 'Contacter', icon: HelpCircle, count: null },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'exchanges' && unreadCount > 0 && (
                <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mes échanges Tab */}
      {activeTab === 'exchanges' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Aucun échange pour l'instant</p>
              <Button
                onClick={() => setActiveTab('contact')}
                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2"
              >
                Envoyer un message
              </Button>
            </div>
          ) : (
            messages.map((msg) => {
              const hasUnreadReply = msg.admin_reply && !msg.user_read_reply;
              const isExpanded = expandedMessage === msg.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`rounded-2xl border transition-all ${
                    hasUnreadReply 
                      ? 'border-pink-300 bg-pink-50' 
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  {/* Message Header */}
                  <div 
                    onClick={() => handleExpand(msg.id)}
                    className="p-4 cursor-pointer hover:bg-white/50 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-700 text-sm">{msg.subject || 'Sans sujet'}</h4>
                          {hasUnreadReply && (
                            <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">Nouveau</span>
                          )}
                          {msg.admin_reply && !hasUnreadReply && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{msg.message}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                      {/* Original Message */}
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 bg-purple-50 rounded-xl p-3">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Vous</p>
                          <p className="text-sm text-slate-700">{msg.message}</p>
                          <p className="text-xs text-slate-400 mt-2">{formatDate(msg.created_at)}</p>
                        </div>
                      </div>
                      
                      {/* Admin Reply */}
                      {msg.admin_reply && (
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-pink-600" />
                          </div>
                          <div className="flex-1 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-200">
                            <p className="text-xs text-pink-600 font-semibold mb-1">Équipe MamanDouce</p>
                            <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                            <p className="text-xs text-slate-400 mt-2">{formatDate(msg.replied_at)}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Conversation History */}
                      {msg.conversation?.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            item.from === 'user' ? 'bg-purple-100' : 'bg-pink-100'
                          }`}>
                            {item.from === 'user' ? (
                              <User className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Shield className="w-4 h-4 text-pink-600" />
                            )}
                          </div>
                          <div className={`flex-1 rounded-xl p-3 ${
                            item.from === 'user' 
                              ? 'bg-purple-50' 
                              : 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200'
                          }`}>
                            <p className={`text-xs font-semibold mb-1 ${
                              item.from === 'user' ? 'text-purple-600' : 'text-pink-600'
                            }`}>
                              {item.from === 'user' ? 'Vous' : 'Équipe MamanDouce'}
                            </p>
                            <p className="text-sm text-slate-700">{item.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply Input */}
                      {msg.admin_reply && (
                        <div className="flex gap-2 mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Répondre..."
                            className="flex-1 rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-200"
                          />
                          <Button
                            onClick={() => handleReply(msg.id)}
                            disabled={sending || !replyText.trim()}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 self-end"
                          >
                            {sending ? '...' : <Send className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                      
                      {/* Waiting for reply */}
                      {!msg.admin_reply && (
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                          <p className="text-sm text-amber-700">
                            <Clock className="w-4 h-4 inline mr-1" />
                            En attente de réponse...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-bold text-slate-700 mb-1">Contacter l'équipe</h3>
            <p className="text-sm text-slate-500">Une question ? Une suggestion ? Écrivez-nous !</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600 font-semibold mb-1 block">Sujet</label>
              <Input
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="Ex: Question sur les aliments"
                className="rounded-xl"
                data-testid="contact-subject"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 font-semibold mb-1 block">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Décrivez votre question ou suggestion..."
                className="w-full rounded-xl border border-slate-200 p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-200"
                data-testid="contact-message"
              />
            </div>
            <Button
              onClick={handleSendContact}
              disabled={sendingContact || !contactSubject.trim() || !contactMessage.trim()}
              data-testid="send-contact-btn"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-3 font-semibold hover:opacity-90"
            >
              {sendingContact ? (
                'Envoi en cours...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            Nous répondons généralement sous 24h. Vous recevrez une notification et un email.
          </p>
        </div>
      )}
    </div>
  );
}
