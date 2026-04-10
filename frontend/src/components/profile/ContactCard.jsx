import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function ContactCard({ onMessageSent }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    setSending(true);
    try {
      await api.contact.sendMessage({ subject, message });
      setMessageSent(true);
      toast.success('Message envoyé !');
      setSubject('');
      setMessage('');
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      setTimeout(() => {
        setShowContactForm(false);
        setMessageSent(false);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100" data-testid="contact-admin-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Contacter l'équipe</h3>
      </div>
      
      {!showContactForm ? (
        <div className="text-center">
          <p className="text-slate-600 mb-4">Une question, une suggestion ou un problème ?</p>
          <Button
            onClick={() => setShowContactForm(true)}
            data-testid="open-contact-form"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-2 hover:opacity-90"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Envoyer un message
          </Button>
        </div>
      ) : messageSent ? (
        <div className="text-center py-4 animate-fade-in">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-green-600 font-semibold">Message envoyé avec succès !</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Sujet</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Question sur les aliments"
              className="rounded-xl"
              data-testid="contact-subject"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 font-semibold mb-1 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre question ou suggestion..."
              className="w-full rounded-xl border border-slate-200 p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-200"
              data-testid="contact-message"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowContactForm(false)}
              className="flex-1 bg-slate-200 text-slate-700 rounded-full py-2 hover:bg-slate-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sending}
              data-testid="send-contact-message"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full py-2 hover:opacity-90"
            >
              {sending ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
