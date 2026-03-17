import { Card } from '../ui/card';
import { MessageSquare, Mail, Check, Reply, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function MessagesTab({ messages, messageStats, loadMessages }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.admin.replyToMessage(messageId, replyText);
      toast.success(response.data.message);
      setReplyText('');
      setExpandedMessage(null);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.admin.markMessageRead(messageId);
      loadMessages();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }
    
    try {
      await api.admin.deleteMessage(messageId);
      toast.success('Message supprimé');
      setExpandedMessage(null);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredMessages = showUnreadOnly 
    ? messages.filter(m => !m.is_read)
    : messages;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <MessageSquare className="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-700">{messageStats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Mail className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{messageStats.unread}</p>
          <p className="text-xs text-slate-500">Non lus</p>
        </Card>
      </div>

      {/* Messages List */}
      <Card className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700">Messages reçus</h3>
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              showUnreadOnly 
                ? 'bg-pink-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showUnreadOnly ? 'Non lus uniquement' : 'Tous les messages'}
          </button>
        </div>
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{showUnreadOnly ? 'Aucun message non lu' : 'Aucun message reçu'}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredMessages.map((msg, index) => {
              const isExpanded = expandedMessage === msg.id;
              
              return (
                <div key={index} className={`rounded-xl border overflow-hidden ${
                  msg.is_read 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-pink-50 border-pink-200'
                }`}>
                  {/* Message Header - Collapsible */}
                  <div 
                    onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                    className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.is_read && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                          <h4 className="font-bold text-slate-700">{msg.subject}</h4>
                          {msg.admin_reply && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Répondu</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">{msg.message}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{msg.user_name || 'Anonyme'}</span>
                          <span>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 space-y-4">
                      {/* Full Message */}
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs text-slate-400 mt-2">De: {msg.user_email}</p>
                      </div>
                      
                      {/* Admin Reply if exists */}
                      {msg.admin_reply && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border-l-4 border-purple-400">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Votre réponse :</p>
                          <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Envoyée le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {!msg.is_read && (
                          <Button
                            onClick={() => markAsRead(msg.id)}
                            className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Marquer lu
                          </Button>
                        )}
                        {!msg.admin_reply && (
                          <Button
                            onClick={() => {}}
                            className="bg-purple-100 text-purple-700 rounded-lg px-3 py-2 hover:bg-purple-200"
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Répondre ci-dessous
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(msg.id)}
                          className="bg-red-100 text-red-600 rounded-lg px-3 py-2 hover:bg-red-200 ml-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>

                      {/* Reply Form */}
                      {!msg.admin_reply && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-purple-700 mb-2">Répondre à {msg.user_name || msg.user_email}</p>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Écrivez votre réponse..."
                            className="w-full rounded-xl border border-purple-200 p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                            data-testid="reply-textarea"
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              onClick={() => handleReply(msg.id)}
                              disabled={sending || !replyText.trim()}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50"
                              data-testid="send-reply-btn"
                            >
                              {sending ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Un email sera envoyé à {msg.user_email} avec votre réponse.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
