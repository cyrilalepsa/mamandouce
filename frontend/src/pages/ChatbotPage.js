import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Trash2, 
  Plus,
  ChevronLeft,
  Bot,
  User,
  Loader2,
  Crown,
  Lock
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Subscription state
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await api.subscription.getFullStatus();
      const isPrem = response.data.is_premium || response.data.subscription_status === 'premium';
      setIsPremium(isPrem);
      if (isPrem) {
        loadSuggestions();
        loadSessions();
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Bloquer l'accès pour les utilisateurs gratuits
  if (!subscriptionLoading && !isPremium) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto">
          <PageHeader title="Assistant IA" />
          
          <Card className="bg-white rounded-3xl p-8 text-center mt-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Fonctionnalité Premium
            </h1>
            <p className="text-slate-500 mb-6">
              L'assistant IA est réservé aux abonnées Premium. Posez toutes vos questions sur la grossesse !
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-3 text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Crown className="w-5 h-5 mr-2" />
              Découvrir Premium
            </Button>
            <p className="text-sm text-slate-400 mt-4">
              Seulement 3€/mois • Annulation à tout moment
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const loadSuggestions = async () => {
    try {
      const response = await api.chatbot.getSuggestions();
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await api.chatbot.getHistory();
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadSession = async (sid) => {
    try {
      const response = await api.chatbot.getHistory(sid);
      setMessages(response.data.messages || []);
      setSessionId(sid);
      setShowSessions(false);
    } catch (error) {
      toast.error('Erreur lors du chargement de la conversation');
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setShowSessions(false);
  };

  const deleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await api.chatbot.deleteSession(sid);
      toast.success('Conversation supprimée');
      loadSessions();
      if (sessionId === sid) {
        startNewChat();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMessage = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.chatbot.sendMessage(text, sessionId);
      
      if (!sessionId) {
        setSessionId(response.data.session_id);
      }

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      loadSessions(); // Refresh sessions list
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de communication avec l\'IA');
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/section/services')}
              variant="ghost"
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                MamanDouce AI
              </h1>
              <p className="text-xs text-slate-500">Votre assistante grossesse</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSessions(!showSessions)}
              className="bg-slate-100 text-slate-600 rounded-full px-4 py-2 text-sm hover:bg-slate-200"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Historique
            </Button>
            <Button
              onClick={startNewChat}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>
      </div>

      {/* Sessions sidebar */}
      {showSessions && (
        <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setShowSessions(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-4 overflow-y-auto animate-slide-in-right"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-700 mb-4">Conversations</h3>
            {sessions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                Aucune conversation
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => loadSession(session.session_id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      sessionId === session.session_id
                        ? 'bg-pink-100 border-2 border-pink-300'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-slate-700 line-clamp-2 flex-1">
                        {session.last_message}
                      </p>
                      <Button
                        onClick={(e) => deleteSession(session.session_id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {session.message_count} messages
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-pink-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Bonjour ! Comment puis-je vous aider ?
              </h2>
              <p className="text-slate-500 mb-6">
                Posez-moi vos questions sur la grossesse, l'alimentation, les démarches...
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    data-testid={`suggestion-${index}`}
                    className="bg-white border border-pink-200 text-slate-600 rounded-2xl p-4 text-left text-sm hover:bg-pink-50 hover:border-pink-300 transition-all"
                  >
                    <span className="line-clamp-2">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-sky-400 to-sky-500'
                      : 'bg-gradient-to-br from-pink-500 to-purple-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white'
                      : 'bg-white border border-slate-100 shadow-sm text-slate-700'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">MamanDouce réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            disabled={loading}
            data-testid="chat-input"
            className="flex-1 rounded-full border-slate-200 px-5 py-3 focus:border-pink-300 focus:ring-pink-100"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            data-testid="send-message-btn"
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-6 py-3 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-slate-400 mt-2">
          MamanDouce AI ne remplace pas un avis médical. Consultez un professionnel de santé pour tout symptôme inquiétant.
        </p>
      </div>
    </div>
  );
}

export default ChatbotPage;
