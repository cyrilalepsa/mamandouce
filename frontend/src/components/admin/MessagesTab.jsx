import { Card } from '../ui/card';
import { MessageSquare, Mail, Check, Reply, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function MessagesTab({ messages, messageStats, loadMessages }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

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
        <h3 className="text-lg font-bold text-slate-700 mb-4">Messages reçus</h3>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun message reçu</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`rounded-xl border overflow-hidden ${
                msg.is_read 
                  ? 'bg-slate-50 border-slate-200' 
                  : 'bg-pink-50 border-pink-200'
              }`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        <h4 className="font-bold text-slate-700">{msg.subject}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{msg.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>De: {msg.user_name || 'Anonyme'} ({msg.user_email})</span>
                        <span>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      {msg.admin_reply && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Votre réponse :</p>
                          <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Envoyée le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!msg.is_read && (
                        <Button
                          onClick={() => markAsRead(msg.id)}
                          className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {!msg.admin_reply && (
                        <Button
                          onClick={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
                          className={`rounded-lg px-3 py-2 ${
                            expandedMessage === msg.id 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                          title="Répondre"
                        >
                          <Reply className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {expandedMessage === msg.id && !msg.admin_reply && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200 animate-fade-in">
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
                        onClick={() => {
                          setExpandedMessage(null);
                          setReplyText('');
                        }}
                        className="bg-slate-200 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-300"
                      >
                        Annuler
                      </Button>
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
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
