import { Card } from '../ui/card';
import { MessageSquare, Mail, Check, Reply, Send, Trash2, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function MessagesTab({ messages, messageStats, loadMessages }) {
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  
  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const longPressTimer = useRef(null);

  // Clear all messages function
  const handleClearAllMessages = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir vider toute la messagerie ? Cette action est irréversible.')) {
      return;
    }
    
    setClearing(true);
    try {
      // Use the bulk delete API
      const response = await api.admin.deleteAllMessages();
      toast.success(`${response.data.deleted_count || 'Tous les'} message(s) supprimé(s)`);
      loadMessages();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      toast.error('Erreur lors du nettoyage de la messagerie');
    } finally {
      setClearing(false);
    }
  };

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

  // Long press handlers for selection mode
  const handleLongPressStart = (messageId) => {
    longPressTimer.current = setTimeout(() => {
      setSelectionMode(true);
      setSelectedMessages([messageId]);
      // Vibration feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const toggleMessageSelection = (messageId) => {
    if (selectionMode) {
      setSelectedMessages(prev => 
        prev.includes(messageId)
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
    }
  };

  const selectAll = () => {
    setSelectedMessages(filteredMessages.map(m => m.id));
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) return;
    
    if (!window.confirm(`Supprimer ${selectedMessages.length} message(s) ?`)) {
      return;
    }
    
    setDeleting(true);
    try {
      // Delete all selected messages
      await Promise.all(selectedMessages.map(id => api.admin.deleteMessage(id)));
      toast.success(`${selectedMessages.length} message(s) supprimé(s)`);
      setSelectionMode(false);
      setSelectedMessages([]);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
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

      {/* Messages List - Collapsible */}
      <Card className="bg-white rounded-3xl overflow-hidden">
        {/* Header - Click to expand/collapse */}
        <div 
          onClick={() => !selectionMode && setIsMessagesExpanded(!isMessagesExpanded)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-700">Messages reçus</h3>
              <p className="text-xs text-slate-500">{filteredMessages.length} message(s)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messageStats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {messageStats.unread} non lu(s)
              </span>
            )}
            {isMessagesExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Messages Content - Collapsible */}
        {isMessagesExpanded && (
          <div className="border-t border-slate-100">
            {/* Selection Mode Bar */}
            {selectionMode && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between gap-2 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelSelection}
                    className="p-2 rounded-full bg-white hover:bg-slate-100"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-sm font-semibold text-purple-700">
                    {selectedMessages.length} sélectionné(s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200"
                  >
                    Tout sélectionner
                  </button>
                  {/* Bouton Cloud 3D Corail - Supprimer sélection */}
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedMessages.length === 0 || deleting}
                    data-testid="delete-selected-btn"
                    className="btn-cloud-3d-coral text-xs px-4 py-2 rounded-full disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {deleting ? 'Suppression...' : 'Supprimer la sélection'}
                  </button>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            {!selectionMode && (
              <div className="p-3 flex items-center justify-between border-b border-slate-100">
                <p className="text-xs text-slate-500">
                  Appui long pour sélectionner plusieurs messages
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      showUnreadOnly 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {showUnreadOnly ? 'Non lus' : 'Tous'}
                  </button>
                  {/* Bouton Cloud 3D Relief - Vider messagerie */}
                  <button
                    onClick={handleClearAllMessages}
                    disabled={messages.length === 0 || clearing}
                    data-testid="clear-all-messages-btn"
                    className="btn-cloud-3d-relief text-xs px-4 py-2 rounded-full disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {clearing ? 'Nettoyage...' : 'Vider la messagerie'}
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="p-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{showUnreadOnly ? 'Aucun message non lu' : 'Aucun message reçu'}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredMessages.map((msg, index) => {
                    const isExpanded = expandedMessage === msg.id;
                    const isSelected = selectedMessages.includes(msg.id);
                    
                    return (
                      <div 
                        key={index} 
                        className={`rounded-xl border overflow-hidden transition-all ${
                          isSelected
                            ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                            : msg.is_read 
                              ? 'bg-slate-50 border-slate-200' 
                              : 'bg-pink-50 border-pink-200'
                        }`}
                      >
                        {/* Message Header */}
                        <div 
                          onMouseDown={() => handleLongPressStart(msg.id)}
                          onMouseUp={handleLongPressEnd}
                          onMouseLeave={handleLongPressEnd}
                          onTouchStart={() => handleLongPressStart(msg.id)}
                          onTouchEnd={handleLongPressEnd}
                          onClick={() => {
                            if (selectionMode) {
                              toggleMessageSelection(msg.id);
                            } else {
                              setExpandedMessage(isExpanded ? null : msg.id);
                            }
                          }}
                          className="p-4 cursor-pointer hover:bg-white/50 transition-colors select-none"
                        >
                          <div className="flex items-start gap-3">
                            {/* Selection Checkbox */}
                            {selectionMode && (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected 
                                  ? 'bg-purple-500 border-purple-500' 
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {!msg.is_read && !selectionMode && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
                                )}
                                <h4 className="font-bold text-slate-700 truncate">{msg.subject}</h4>
                                {msg.admin_reply && (
                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Répondu</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-1">{msg.message}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="truncate">{msg.user_name || 'Anonyme'}</span>
                                <span className="flex-shrink-0">{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            
                            {!selectionMode && (
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && !selectionMode && (
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
                                  className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600 text-xs"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Marquer lu
                                </Button>
                              )}
                              <Button
                                onClick={() => handleDelete(msg.id)}
                                className="bg-red-100 text-red-600 rounded-lg px-3 py-2 hover:bg-red-200 ml-auto text-xs"
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
                                  className="w-full rounded-xl border border-purple-200 p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-sm"
                                />
                                <div className="flex justify-end mt-3">
                                  <Button
                                    onClick={() => handleReply(msg.id)}
                                    disabled={sending || !replyText.trim()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-2 hover:opacity-90 disabled:opacity-50 text-sm"
                                  >
                                    {sending ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
