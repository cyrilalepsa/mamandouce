import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2,
  Bot,
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await api.chatbot.getSuggestions();
      setSuggestions(response.data.suggestions?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
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
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de communication');
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

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  // Ne pas afficher si pas connecté
  const token = localStorage.getItem('token');
  if (!token) return null;

  return (
    <>
      {/* Bulle flottante - Discrète et transparente */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="chat-bubble-button"
          className="fixed bottom-32 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full shadow-sm hover:shadow-md hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-5 h-5 text-pink-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="absolute right-full mr-2 bg-slate-700/90 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Aide
          </span>
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div 
          className={`fixed bottom-20 right-6 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
          }`}
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 flex items-center justify-between cursor-pointer"
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">MamanDouce AI</h3>
                {!isMinimized && (
                  <p className="text-white/70 text-xs">Votre assistante</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-pink-500" />
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      Comment puis-je vous aider ?
                    </p>
                    
                    {/* Quick suggestions */}
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(suggestion)}
                          className="w-full text-left text-xs bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded-xl p-3 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user'
                            ? 'bg-sky-500'
                            : 'bg-gradient-to-br from-pink-500 to-purple-500'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Votre question..."
                    disabled={loading}
                    className="flex-1 text-sm rounded-full border-slate-200 px-4 py-2"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={loading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full p-2 w-10 h-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Ne remplace pas un avis médical
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatBubble;
