import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  MessageSquare, ChevronDown, ChevronUp, Send, Clock, CheckCircle, 
  Mail, ArrowLeft, User, Shield
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function MyMessagesCard() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showAll, setShowAll] = useState(false);

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
    
    // Mark as read if there's an unread reply
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

  if (loading) {
    return (
      <Card className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
        </div>
      </Card>
    );
  }

  if (messages.length === 0) {
    return null; // Don't show if no messages
  }

  const displayedMessages = showAll ? messages : messages.slice(0, 3);

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100" data-testid="my-messages-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">Mes messages</h3>
            <p className="text-xs text-slate-400">{messages.length} conversation(s)</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            {unreadCount} nouvelle(s) réponse(s)
          </span>
        )}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {displayedMessages.map((msg) => {
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
                        <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">Nouveau</span>
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
                        data-testid="reply-textarea"
                      />
                      <Button
                        onClick={() => handleReply(msg.id)}
                        disabled={sending || !replyText.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 self-end"
                        data-testid="send-reply-btn"
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
        })}
      </div>
      
      {/* Show More */}
      {messages.length > 3 && !showAll && (
        <Button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
        >
          Voir les {messages.length - 3} autres messages
        </Button>
      )}
    </Card>
  );
}
