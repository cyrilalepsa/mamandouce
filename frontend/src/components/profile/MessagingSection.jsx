import { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  MessageSquare, ChevronDown, ChevronUp, Send, Clock, CheckCircle, 
  Mail, User, Shield, Inbox, MessageCircle, HelpCircle, Image, X, Camera, Trash2, Check
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB avant compression

export function MessagingSection({ onMessagesRead }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [sending, setSending] = useState(false);
  
  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactImages, setContactImages] = useState([]);
  const [sendingContact, setSendingContact] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('exchanges');
  
  // File input refs
  const contactFileRef = useRef(null);
  const replyFileRef = useRef(null);
  
  // Image viewer
  const [viewingImage, setViewingImage] = useState(null);
  
  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const longPressTimer = useRef(null);

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

  // Image handling functions
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e, target) => {
    const files = Array.from(e.target.files || []);
    const currentImages = target === 'contact' ? contactImages : replyImages;
    const setImages = target === 'contact' ? setContactImages : setReplyImages;
    
    if (currentImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} photos autorisées`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Fichier non supporté');
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error('Image trop grande (max 2MB)');
        continue;
      }
      if (currentImages.length >= MAX_IMAGES) break;

      const compressed = await compressImage(file);
      setImages(prev => [...prev.slice(0, MAX_IMAGES - 1), compressed]);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index, target) => {
    const setImages = target === 'contact' ? setContactImages : setReplyImages;
    setImages(prev => prev.filter((_, i) => i !== index));
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
        setUnreadCount(prev => {
          const newCount = Math.max(0, prev - 1);
          if (newCount === 0 && onMessagesRead) {
            onMessagesRead();
          }
          return newCount;
        });
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim() && replyImages.length === 0) {
      toast.error('Veuillez écrire un message ou ajouter une photo');
      return;
    }
    
    setSending(true);
    try {
      await api.contact.replyToConversation(messageId, replyText, replyImages);
      toast.success('Réponse envoyée !');
      setReplyText('');
      setReplyImages([]);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleSendContact = async () => {
    if (!contactMessage.trim() && contactImages.length === 0) {
      toast.error('Veuillez écrire un message ou ajouter une photo');
      return;
    }
    
    setSendingContact(true);
    try {
      await api.contact.sendMessage({ 
        subject: contactSubject || 'Sans sujet', 
        message: contactMessage,
        images: contactImages
      });
      toast.success('Message envoyé !');
      setContactSubject('');
      setContactMessage('');
      setContactImages([]);
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

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Êtes-vous sûre de vouloir supprimer ce message ?')) {
      return;
    }
    
    try {
      await api.contact.deleteMessage(messageId);
      toast.success('Message supprimé');
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
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
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

  const selectAllMessages = () => {
    setSelectedMessages(messages.map(m => m.id));
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
      await Promise.all(selectedMessages.map(id => api.contact.deleteMessage(id)));
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
          {/* Selection Mode Bar */}
          {selectionMode && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl flex items-center justify-between gap-2">
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
                  onClick={selectAllMessages}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200"
                >
                  Tout
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedMessages.length === 0 || deleting}
                  className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
          )}

          {/* Hint for long press */}
          {!selectionMode && messages.length > 0 && (
            <p className="text-xs text-slate-400 text-center">
              Appui long pour sélectionner plusieurs messages
            </p>
          )}

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
              const isSelected = selectedMessages.includes(msg.id);
              
              return (
                <div 
                  key={msg.id} 
                  className={`rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                      : hasUnreadReply 
                        ? 'border-pink-300 bg-pink-50' 
                        : 'border-slate-100 bg-slate-50'
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
                        handleExpand(msg.id);
                      }
                    }}
                    className="p-4 cursor-pointer hover:bg-white/50 rounded-2xl transition-colors select-none"
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
                          <h4 className="font-semibold text-slate-700 text-sm truncate">{msg.subject || 'Sans sujet'}</h4>
                          {hasUnreadReply && (
                            <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">Nouveau</span>
                          )}
                          {msg.admin_reply && !hasUnreadReply && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{msg.message}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                      
                      {!selectionMode && (
                        isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && !selectionMode && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-3">
                      {/* Delete button */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(msg.id);
                          }}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                      
                      {/* Original Message */}
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 bg-purple-50 rounded-xl p-3">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Vous</p>
                          <p className="text-sm text-slate-700">{msg.message}</p>
                          {/* Images in original message */}
                          {msg.images && msg.images.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {msg.images.map((img, idx) => (
                                <img 
                                  key={idx}
                                  src={img} 
                                  alt={`Photo ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                  onClick={() => setViewingImage(img)}
                                />
                              ))}
                            </div>
                          )}
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
                            {/* Images in conversation */}
                            {item.images && item.images.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {item.images.map((img, imgIdx) => (
                                  <img 
                                    key={imgIdx}
                                    src={img} 
                                    alt={`Photo ${imgIdx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                    onClick={() => setViewingImage(img)}
                                  />
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply Input with Image support */}
                      {msg.admin_reply && (
                        <div className="space-y-2 mt-3">
                          {/* Image preview */}
                          {replyImages.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {replyImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                                  <button
                                    onClick={() => removeImage(idx, 'reply')}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1 flex gap-2">
                              <button
                                onClick={() => replyFileRef.current?.click()}
                                disabled={replyImages.length >= MAX_IMAGES}
                                className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 disabled:opacity-50 flex-shrink-0"
                              >
                                <Camera className="w-5 h-5" />
                              </button>
                              <input
                                ref={replyFileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageSelect(e, 'reply')}
                                className="hidden"
                              />
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Répondre..."
                                className="flex-1 rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-200"
                              />
                            </div>
                            <Button
                              onClick={() => handleReply(msg.id)}
                              disabled={sending || (!replyText.trim() && replyImages.length === 0)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 self-end"
                            >
                              {sending ? '...' : <Send className="w-4 h-4" />}
                            </Button>
                          </div>
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
              <label className="text-sm text-slate-600 font-semibold mb-1 block">Sujet (optionnel)</label>
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
            
            {/* Image upload section */}
            <div>
              <label className="text-sm text-slate-600 font-semibold mb-2 block">
                Photos (optionnel - max {MAX_IMAGES})
              </label>
              
              {/* Image previews */}
              {contactImages.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {contactImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl" />
                      <button
                        onClick={() => removeImage(idx, 'contact')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {contactImages.length < MAX_IMAGES && (
                <button
                  onClick={() => contactFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors w-full justify-center"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm font-medium">Ajouter une photo</span>
                </button>
              )}
              <input
                ref={contactFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageSelect(e, 'contact')}
                className="hidden"
                data-testid="contact-image-input"
              />
            </div>
            
            <Button
              onClick={handleSendContact}
              disabled={sendingContact || (!contactMessage.trim() && contactImages.length === 0)}
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

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            onClick={() => setViewingImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={viewingImage} 
            alt="Photo agrandie" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
