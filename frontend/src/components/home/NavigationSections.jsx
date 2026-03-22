import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '../ui/card';
import { 
  Sparkles, Baby, Gift, Heart, Library,
  CalendarHeart, BookHeart, ScanBarcode, Apple, 
  History, Stethoscope, Bell, 
  ClipboardList, Briefcase, Video, Youtube, Book, ChevronRight, ChevronDown, LineChart, Lock, Crown, Users
} from 'lucide-react';
import { useSubscription } from '../SubscriptionGate';

// Composant réutilisable pour les sections déroulantes
function CollapsibleSection({ title, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Si title est un composant React, on l'affiche directement
  const isCustomTitle = typeof title !== 'string';
  
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-1 group"
      >
        {isCustomTitle ? (
          <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {title}
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
            {title}
          </h2>
        )}
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

// Catégorie: En route vers la grossesse
export function PreconceptionSection() {
  const navigate = useNavigate();

  return (
    <CollapsibleSection 
      title="En route vers la grossesse" 
      icon={Sparkles} 
      iconColor="text-amber-500"
      defaultOpen={false}
    >
      <div className="grid grid-cols-2 gap-4">
        <Card
          onClick={() => navigate('/calculator')}
          data-testid="calculator-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <CalendarHeart className="w-10 h-10 text-sky-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Calculateur</h3>
          <p className="text-xs text-slate-500 mt-1">Ovulation et dates clés</p>
        </Card>

        <Card
          onClick={() => navigate('/tips')}
          data-testid="preconception-tips-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <BookHeart className="w-10 h-10 text-pink-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Évolution et conseils</h3>
          <p className="text-xs text-slate-500 mt-1">Semaine par semaine</p>
        </Card>
      </div>
      
      {/* Nouvelle carte : Grossesse après 35 ans */}
      <Card
        onClick={() => navigate('/pregnancy-after-35')}
        data-testid="pregnancy-after-35-nav"
        className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Grossesse après 35 ans
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Conseils, examens et accompagnement spécialisé
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </Card>
      
      {/* Avertissement médical */}
      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-700">
          <strong>Information :</strong> Les conseils fournis sont à titre informatif et ne remplacent pas l'avis d'un médecin. 
          Consultez un professionnel de santé avant toute prise de médicaments ou compléments.
        </p>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Grossesse
export function PregnancySection({ hasPregnancyProfile, pregnancyProfile }) {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  
  // Déterminer si on est au 1er trimestre (semaines 1-13)
  const currentWeek = pregnancyProfile?.current_week || 1;
  const isFirstTrimester = currentWeek <= 13;

  return (
    <CollapsibleSection 
      title="Grossesse" 
      icon={Baby} 
      iconColor="text-pink-500"
      defaultOpen={false}
    >

      {/* Scanner, Bibliothèque, Favoris, Historique */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card
          onClick={() => navigate('/scanner')}
          data-testid="scanner-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <ScanBarcode className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Scanner</h3>
          <p className="text-xs text-slate-500">Aliments</p>
        </Card>

        <Card
          onClick={() => navigate('/library')}
          data-testid="library-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Apple className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Bibliothèque</h3>
          <p className="text-xs text-slate-500">Aliments</p>
        </Card>

        <Card
          onClick={() => navigate('/favorites')}
          data-testid="favorites-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Favoris</h3>
          <p className="text-xs text-slate-500">Sauvegardés</p>
        </Card>

        <Card
          onClick={() => navigate('/history')}
          data-testid="history-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <History className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Historique</h3>
          <p className="text-xs text-slate-500">Recherches</p>
        </Card>
      </div>

      {/* Séparateur visuel */}
      <div className="border-t border-slate-100 my-4"></div>

      {/* Liste des prénoms - Partiellement gratuit */}
      <Card
        onClick={() => navigate('/baby-names')}
        data-testid="baby-names-nav"
        className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-violet-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Liste des Prénoms
              </h3>
              {!isPremium && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Crown className="w-3 h-3" /> Partiel
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPremium 
                ? 'Europe & Amérique - Signification et personnalité'
                : '3 pays gratuits, tous avec Premium'
              }
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400" />
        </div>
      </Card>

      {/* RDV (1er trimestre gratuit, Premium après), Suivi de grossesse (Premium), Rappels */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* RDV - Gratuit au 1er trimestre, Premium après */}
        {isPremium || isFirstTrimester ? (
          <Card
            onClick={() => navigate('/medical')}
            data-testid="medical-nav"
            className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
          >
            <Stethoscope className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Rendez-vous</h3>
            <p className="text-xs text-slate-500">{isPremium ? 'Suivi médical' : '1er trimestre'}</p>
          </Card>
        ) : (
          <Card
            onClick={() => navigate('/pricing')}
            data-testid="medical-nav-locked"
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center relative"
          >
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-500">Rendez-vous</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 2e & 3e trimestre
            </p>
          </Card>
        )}

        {/* Suivi grossesse - Premium uniquement */}
        {isPremium ? (
          <Card
            onClick={() => navigate('/tracking')}
            data-testid="tracking-nav"
            className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-pink-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
          >
            <LineChart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Suivi grossesse</h3>
            <p className="text-xs text-slate-500">Maman & Bébé</p>
          </Card>
        ) : (
          <Card
            onClick={() => navigate('/pricing')}
            data-testid="tracking-nav-locked"
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center relative"
          >
            <div className="absolute top-2 right-2">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <LineChart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-500">Suivi grossesse</h3>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </p>
          </Card>
        )}

        <Card
          onClick={() => navigate('/notifications')}
          data-testid="notifications-nav"
          className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Bell className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Rappels</h3>
          <p className="text-xs text-slate-500">Notifications</p>
        </Card>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Préparer l'arrivée de bébé (Premium uniquement avec aperçu attractif)
export function BabyPreparationSection() {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();

  // Header personnalisé pour cette section (avec badge Premium)
  const CustomHeader = () => (
    <div className="flex items-center gap-2">
      <Gift className="w-5 h-5 text-purple-500" />
      <span className="whitespace-nowrap">Préparer l'arrivée de bébé</span>
      {!isPremium && (
        <span className="ml-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
          <Crown className="w-3 h-3 text-white" />
        </span>
      )}
    </div>
  );

  // Si pas premium, afficher un aperçu attractif avec contenu flouté/verrouillé
  if (!isPremium) {
    return (
      <CollapsibleSection 
        title={<CustomHeader />}
        icon={() => null}
        iconColor=""
        defaultOpen={false}
      >
        
        {/* Aperçu des cartes avec effet de flou partiel */}
        <div className="grid grid-cols-2 gap-4 relative">
          {/* Liste de naissance - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <ClipboardList className="w-10 h-10 text-pink-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Liste de naissance</h3>
            <p className="text-xs text-slate-500 mt-1">À partager avec vos proches</p>
          </Card>

          {/* Sac de maternité - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Sac de maternité</h3>
            <p className="text-xs text-slate-500 mt-1">Check-list interactive</p>
          </Card>

          {/* Vidéos - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Video className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Vidéos</h3>
            <p className="text-xs text-slate-500 mt-1">Préparation accouchement</p>
          </Card>

          {/* Les Maternelles - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Youtube className="w-10 h-10 text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Les Maternelles</h3>
            <p className="text-xs text-slate-500 mt-1">Chaîne YouTube</p>
          </Card>

          {/* Livres - aperçu */}
          <Card
            onClick={() => navigate('/pricing')}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer card-hover text-center col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 z-10">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Livres utiles</h3>
            <p className="text-xs text-slate-500 mt-1">Grossesse et bébé</p>
          </Card>
        </div>
        
        {/* Bouton débloquer */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Crown className="w-5 h-5" />
            Débloquer avec Premium
          </button>
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection 
      title="Préparer l'arrivée de bébé" 
      icon={Gift} 
      iconColor="text-purple-500"
      defaultOpen={false}
    >
      <div className="grid grid-cols-2 gap-4">
        <Card
          onClick={() => navigate('/birth-list')}
          data-testid="birthlist-nav"
          className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <ClipboardList className="w-10 h-10 text-pink-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Liste de naissance</h3>
          <p className="text-xs text-slate-500 mt-1">À partager</p>
        </Card>

        <Card
          onClick={() => navigate('/maternity-bag')}
          data-testid="maternity-bag-nav"
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center"
        >
          <Briefcase className="w-10 h-10 text-purple-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Sac de maternité</h3>
          <p className="text-xs text-slate-500 mt-1">Check-list interactive</p>
        </Card>

        <a
          href="https://www.youtube.com/results?search_query=préparation+accouchement"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Card
            data-testid="birth-videos-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Video className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Vidéos</h3>
            <p className="text-xs text-slate-500 mt-1">Préparation accouchement</p>
          </Card>
        </a>

        <a
          href="https://www.youtube.com/c/LaMaisondesMaternelles"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Card
            data-testid="maternelles-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Youtube className="w-10 h-10 text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Les Maternelles</h3>
            <p className="text-xs text-slate-500 mt-1">Chaîne YouTube</p>
          </Card>
        </a>

        <a
          href="https://www.amazon.fr/s?k=livre+grossesse+bébé"
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline col-span-2"
        >
          <Card
            data-testid="books-nav"
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover text-center h-full"
          >
            <Book className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Livres utiles</h3>
            <p className="text-xs text-slate-500 mt-1">Grossesse et bébé</p>
          </Card>
        </a>
      </div>
    </CollapsibleSection>
  );
}

// Catégorie: Suivi Post-partum
export function PostpartumSection() {
  const navigate = useNavigate();

  return (
    <CollapsibleSection 
      title="Suivi post-partum" 
      icon={Heart} 
      iconColor="text-rose-500"
      defaultOpen={false}
    >
      <Card
        onClick={() => navigate('/postpartum')}
        data-testid="postpartum-nav"
        className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer card-hover"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Les 6 premiers mois avec bébé</h3>
            <p className="text-sm text-slate-500 mt-1">Conseils, rendez-vous, allaitement, couches et précautions</p>
          </div>
          <ChevronRight className="w-6 h-6 text-rose-400" />
        </div>
      </Card>
    </CollapsibleSection>
  );
}

// Catégorie: Services et ressources
export function ServicesSection() {
  return (
    <CollapsibleSection 
      title="Services et ressources" 
      icon={Library} 
      iconColor="text-blue-500"
      defaultOpen={false}
    >
      <div className="flex flex-wrap gap-3 justify-center">
        <a
          href="https://www.caf.fr"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="caf-button"
          className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center">
            <Library className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-700">CAF</span>
        </a>

        <a
          href="https://www.ameli.fr"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="ameli-button"
          className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-400 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-700">Ameli</span>
        </a>

        <a
          href="https://www.google.com/maps/search/mairie/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="maps-button"
          className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_15px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] cursor-pointer transition-all hover:-translate-y-0.5 no-underline"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-700">Mairies proches</span>
        </a>
      </div>
    </CollapsibleSection>
  );
}
