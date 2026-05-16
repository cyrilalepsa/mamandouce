import { useState } from 'react';
import { Card } from '../ui/card';
import { Inbox, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';

export function MessageHistoryCard({ myMessages }) {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  if (!myMessages || myMessages.length === 0) return null;

  const messagesWithReplies = myMessages.filter(m => m.admin_reply);
  const pendingMessages = myMessages.filter(m => !m.admin_reply);

  return (
    <Card className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="message-history-card">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-purple-400 rounded-full flex items-center justify-center">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Mes échanges
            </h3>
            <p className="text-sm text-slate-500">
              {messagesWithReplies.length} réponse(s) • {pendingMessages.length} en attente
            </p>
          </div>
        </div>
        {showHistory ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {showHistory && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {myMessages.map((msg, index) => (
            <div 
              key={index} 
              className={`rounded-xl border overflow-hidden ${
                msg.admin_reply ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <button
                onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.admin_reply ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <h4 className="font-bold text-slate-700">{msg.subject}</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Envoyé le {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    msg.admin_reply 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {msg.admin_reply ? 'Répondu' : 'En attente'}
                  </span>
                </div>
              </button>

              {expandedMessageId === msg.id && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  {/* Original message */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Votre message :</p>
                    <p className="text-sm text-slate-700">{msg.message}</p>
                  </div>

                  {/* Admin reply */}
                  {msg.admin_reply ? (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                      <p className="text-xs text-purple-600 font-semibold mb-1">Réponse de l'équipe :</p>
                      <p className="text-sm text-slate-700">{msg.admin_reply}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Répondu le {new Date(msg.replied_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-100/50 rounded-lg text-center">
                      <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-sm text-amber-700">En attente de réponse</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
