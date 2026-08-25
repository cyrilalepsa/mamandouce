/**
 * AccountArchiveModal - Modal de clôture de compte solidaire
 * Permet de donner le solde de la cagnotte au Relais Maman ou à une amie
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Heart, Gift, Users, X, AlertTriangle, CheckCircle2, 
  Mail, Sparkles, HandHeart, UserPlus
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { N20Amount } from '../N20Icon';

export default function AccountArchiveModal({ isOpen, onClose, onConfirm }) {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1); // 1: info, 2: choix, 3: email amie, 4: confirmation
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [donationChoice, setDonationChoice] = useState(null); // 'friend', 'relay', 'none'
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [reason, setReason] = useState('');
  const [becomeAmbassador, setBecomeAmbassador] = useState(false);
  
  // Charger les données de preview
  useEffect(() => {
    if (isOpen) {
      loadPreview();
    }
  }, [isOpen]);
  
  const loadPreview = async () => {
    try {
      const response = await api.solidarity.archivePreview();
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error loading archive preview:', error);
    }
  };
  
  const handleChoiceSelect = (choice) => {
    setDonationChoice(choice);
    if (choice === 'friend') {
      setStep(3);
    } else {
      setStep(4);
    }
  };
  
  const handleConfirmArchive = async () => {
    setLoading(true);
    try {
      const response = await api.solidarity.archiveAccount({
        donation_choice: donationChoice,
        friend_email: friendEmail || null,
        friend_name: friendName || null,
        reason: reason || null,
        become_ambassador: becomeAmbassador,
      });
      
      toast.success(response.data.message);
      onConfirm && onConfirm(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'archivage');
    } finally {
      setLoading(false);
    }
  };
  
  const balance = previewData?.wallet_balance || 0;
  
  // Styles Dark Mode
  const cardBg = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const inputBg = isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800';
  
  const textShadow = isDarkMode ? { textShadow: '1px 1px 3px rgba(0,0,0,1)' } : {};
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${cardBg} max-w-lg rounded-3xl border-0 p-0 overflow-hidden`}>
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold flex items-center gap-3" style={textShadow}>
              <Heart className="w-6 h-6" />
              Clôture de compte solidaire
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-6">
          {/* Step 1: Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className={`text-center ${textColor}`} style={textShadow}>
                <p className="text-lg font-medium mb-2">
                  Nous sommes tristes de vous voir partir
                </p>
                <p className={textMuted}>
                  Avant de clôturer votre compte, saviez-vous que vous pouvez transformer 
                  votre départ en un geste solidaire ?
                </p>
              </div>
              
              {/* Wallet balance */}
              {balance > 0 && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl p-5 text-center border border-pink-200 dark:border-pink-800">
                  <p className={`text-sm ${textMuted}`} style={textShadow}>Solde de votre cagnotte</p>
                  <p className="text-4xl font-bold text-pink-600 my-2">
                    <N20Amount value={balance} size={32} valueClassName="text-4xl font-bold text-pink-600" />
                  </p>
                  <p className={`text-sm ${textMuted}`} style={textShadow}>
                    Ce montant peut être offert à une future maman
                  </p>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-4 text-center`}>
                  <p className="text-2xl font-bold text-purple-500">{previewData?.contributions_count || 0}</p>
                  <p className={`text-xs ${textMuted}`} style={textShadow}>Contributions</p>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-xl p-4 text-center`}>
                  <p className="text-2xl font-bold text-indigo-500">{previewData?.referrals_count || 0}</p>
                  <p className={`text-xs ${textMuted}`} style={textShadow}>Parrainages</p>
                </div>
              </div>
              
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-6 text-lg font-semibold"
              >
                Continuer
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className={`w-full ${textMuted}`}
              >
                Annuler
              </Button>
            </div>
          )}
          
          {/* Step 2: Choix de transmission */}
          {step === 2 && (
            <div className="space-y-4">
              <p className={`text-center ${textColor} font-medium mb-6`} style={textShadow}>
                Envie de passer le relais ? Que faire de vos{' '}
                <N20Amount value={balance} size={14} valueClassName="text-pink-500 font-bold" className="inline-flex" /> ?
              </p>
              
              {/* Option 1: Offrir à une amie */}
              <button
                onClick={() => handleChoiceSelect('friend')}
                className={`w-full p-5 rounded-2xl border-2 ${borderColor} hover:border-pink-400 transition-all text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className={`font-bold ${textColor} group-hover:text-pink-500 transition-colors`} style={textShadow}>
                      Offrir à une amie
                    </p>
                    <p className={`text-sm ${textMuted}`} style={textShadow}>
                      Transmettez vos{' '}
                      <N20Amount value={balance} size={12} className="inline-flex" /> à une personne de votre choix
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Option 2: Relais Maman */}
              <button
                onClick={() => handleChoiceSelect('relay')}
                className={`w-full p-5 rounded-2xl border-2 ${borderColor} hover:border-purple-400 transition-all text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <HandHeart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className={`font-bold ${textColor} group-hover:text-purple-500 transition-colors`} style={textShadow}>
                      Transmettre au Relais Maman
                    </p>
                    <p className={`text-sm ${textMuted}`} style={textShadow}>
                      Vos{' '}
                      <N20Amount value={balance} size={12} className="inline-flex" /> rejoignent le pot commun pour une autre maman
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Option Ambassadrice */}
              <button
                type="button"
                onClick={() => setBecomeAmbassador(!becomeAmbassador)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  becomeAmbassador
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className={`font-bold ${textColor}`} style={textShadow}>
                  Devenir Ambassadrice MamanDouce
                </p>
                <p className={`text-sm ${textMuted} mt-1`} style={textShadow}>
                  Continuez à parrainer et contribuer après votre parcours maternité
                </p>
              </button>

              {/* Option 3: Sans transmission */}
              <button
                onClick={() => handleChoiceSelect('none')}
                className={`w-full p-4 rounded-xl border ${borderColor} hover:border-slate-400 transition-all text-left opacity-70 hover:opacity-100`}
              >
                <div className="flex items-center gap-3">
                  <X className={`w-5 h-5 ${textMuted}`} />
                  <p className={`text-sm ${textMuted}`} style={textShadow}>
                    Clôturer sans transmettre
                  </p>
                </div>
              </button>
              
              <Button
                onClick={() => setStep(1)}
                variant="ghost"
                className={`w-full ${textMuted}`}
              >
                Retour
              </Button>
            </div>
          )}
          
          {/* Step 3: Email de l'amie */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <p className={`font-bold ${textColor} text-lg`} style={textShadow}>
                  Offrir <N20Amount value={balance} size={18} className="inline-flex" /> à une amie
                </p>
                <p className={`text-sm ${textMuted} mt-1`} style={textShadow}>
                  Elle recevra un email avec un code cadeau
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${textColor} block mb-2`} style={textShadow}>
                    Email de votre amie *
                  </label>
                  <Input
                    type="email"
                    placeholder="amie@email.com"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className={`${inputBg} rounded-xl py-5`}
                  />
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${textColor} block mb-2`} style={textShadow}>
                    Son prénom (optionnel)
                  </label>
                  <Input
                    type="text"
                    placeholder="Marie"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className={`${inputBg} rounded-xl py-5`}
                  />
                </div>
              </div>
              
              <Button
                onClick={() => setStep(4)}
                disabled={!friendEmail || !friendEmail.includes('@')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full py-6 font-semibold disabled:opacity-50"
              >
                Continuer
              </Button>
              
              <Button
                onClick={() => setStep(2)}
                variant="ghost"
                className={`w-full ${textMuted}`}
              >
                Retour
              </Button>
            </div>
          )}
          
          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  donationChoice === 'none' 
                    ? 'bg-slate-200 dark:bg-slate-700' 
                    : 'bg-gradient-to-br from-green-400 to-green-600'
                }`}>
                  {donationChoice === 'none' ? (
                    <AlertTriangle className={`w-8 h-8 ${textMuted}`} />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <p className={`font-bold ${textColor} text-lg`} style={textShadow}>
                  {donationChoice === 'friend' && (
                    <>
                      Offrir <N20Amount value={balance} size={16} className="inline-flex" /> à {friendName || friendEmail}
                    </>
                  )}
                  {donationChoice === 'relay' && (
                    <>
                      Transmettre <N20Amount value={balance} size={16} className="inline-flex" /> au Relais Maman
                    </>
                  )}
                  {donationChoice === 'none' && 'Clôturer sans transmission'}
                </p>
                
                <p className={`text-sm ${textMuted} mt-2`} style={textShadow}>
                  {donationChoice === 'friend' && 'Elle recevra un email avec son bon cadeau.'}
                  {donationChoice === 'relay' && 'Vos euros rejoignent le pot commun pour une autre maman.'}
                  {donationChoice === 'none' && 'Le solde de votre cagnotte sera perdu.'}
                </p>
              </div>
              
              {/* Recap card */}
              <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} rounded-2xl p-5`}>
                <p className={`text-sm font-medium ${textColor} mb-3`} style={textShadow}>Récapitulatif</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${textMuted}`} style={textShadow}>Cagnotte</span>
                    <span className={`font-medium ${textColor}`} style={textShadow}>
                      <N20Amount value={balance} size={14} valueClassName={`font-medium ${textColor}`} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${textMuted}`} style={textShadow}>Destination</span>
                    <span className={`font-medium ${textColor}`} style={textShadow}>
                      {donationChoice === 'friend' && 'Amie'}
                      {donationChoice === 'relay' && 'Relais Maman'}
                      {donationChoice === 'none' && 'Non attribué'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Raison optionnelle */}
              <div>
                <label className={`text-sm font-medium ${textColor} block mb-2`} style={textShadow}>
                  Raison du départ (optionnel)
                </label>
                <Input
                  type="text"
                  placeholder="Aidez-nous à nous améliorer..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`${inputBg} rounded-xl py-5`}
                />
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmArchive}
                  disabled={loading}
                  className={`w-full rounded-full py-6 font-semibold ${
                    donationChoice === 'none'
                      ? 'bg-slate-500 hover:bg-slate-600 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traitement...
                    </span>
                  ) : (
                    donationChoice === 'none' ? 'Confirmer la clôture' : 'Confirmer et offrir'
                  )}
                </Button>
                
                <Button
                  onClick={() => setStep(donationChoice === 'friend' ? 3 : 2)}
                  variant="ghost"
                  className={`w-full ${textMuted}`}
                  disabled={loading}
                >
                  Retour
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer info Relais Maman */}
        {step === 2 && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-4 border-t border-purple-100 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className={`text-xs ${textMuted}`} style={textShadow}>
                <span className="font-medium text-purple-600 dark:text-purple-400">Le Relais Maman</span> aide les futures mamans 
                qui n'ont pas les moyens de s'offrir un accompagnement premium. 
                Votre geste peut changer une vie.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
