import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import { SubscriptionGate } from './components/SubscriptionGate';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import { ThemeProvider } from './contexts/ThemeContext';
import { AutoRefreshProvider } from './contexts/AutoRefreshContext';
import { checkFirstVisitLanguage } from './i18n';
import { toast } from 'sonner';
import InvitationPage from './pages/InvitationPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PregnancyCalculator from './pages/PregnancyCalculator';
import PregnancyWheel from './pages/PregnancyWheel';
import FoodScanner from './pages/FoodScanner';
import FoodLibraryPage from './pages/FoodLibraryPage';
import BirthListPage from './pages/BirthListPage';
import SharedBirthListPage from './pages/SharedBirthListPage';
import HistoryPage from './pages/HistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import MedicalAppointmentsPage from './pages/MedicalAppointmentsPage';
import NotificationsPage from './pages/NotificationsPage';
import WeeklyTipsPage from './pages/WeeklyTipsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import SubscriptionCheckout from './pages/SubscriptionCheckout';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import SubscriptionManage from './pages/SubscriptionManage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MaternityBagPage from './pages/MaternityBagPage';
import BabyVideosPage from './pages/BabyVideosPage';
import BabyPrepTipsPage from './pages/BabyPrepTipsPage';
import PostpartumPage from './pages/PostpartumPage';
// Nouvelles pages postpartum
import PostpartumRdvPage from './pages/PostpartumRdvPage';
import PostpartumAlimentationPage from './pages/PostpartumAlimentationPage';
import PostpartumSoinsPage from './pages/PostpartumSoinsPage';
import PostpartumSecuritePage from './pages/PostpartumSecuritePage';
import PostpartumAllaitementPage from './pages/PostpartumAllaitementPage';
import PostpartumBiberonsPage from './pages/PostpartumBiberonsPage';
import PostpartumDiversificationPage from './pages/PostpartumDiversificationPage';
import PostpartumRecettesPage from './pages/PostpartumRecettesPage';
import PostpartumCoucherChangePage from './pages/PostpartumCoucherChangePage';
import PostpartumPortagePage from './pages/PostpartumPortagePage';
import PostpartumDifficultesPage from './pages/PostpartumDifficultesPage';
import PostpartumPrecautionsPage from './pages/PostpartumPrecautionsPage';
import SharedRecipesPage from './pages/SharedRecipesPage';
import GuidePage from './pages/GuidePage';
import ChatbotPage from './pages/ChatbotPage';
import TrackingPage from './pages/TrackingPage';
import PregnancyAfter35Page from './pages/PregnancyAfter35Page';
import BabyNamesPage from './pages/BabyNamesPage';
import UpdatesHistoryPage from './pages/UpdatesHistoryPage';
import CarteVisitePage from './pages/CarteVisitePage';
import CycleTrackingPage from './pages/CycleTrackingPage';
import CalendarPage from './pages/CalendarPage';
import FertilityCalculatorPage from './pages/FertilityCalculatorPage';
import GrossessePage from './pages/GrossessePage';
import RemindersPage from './pages/RemindersPage';
import JourneyStepsPage from './pages/JourneyStepsPage';
import SectionDetailPage from './pages/SectionDetailPage';
import PreconceptionTipsPage from './pages/PreconceptionTipsPage';
import ParentalLeavePage from './pages/ParentalLeavePage';
import ReferralPage from './pages/ReferralPage';
import TrophiesPage from './pages/TrophiesPage';
import TireliirePage from './pages/TireliirePage';
import ModerationPage from './pages/ModerationPage';
import BabyEvolutionPage from './pages/BabyEvolutionPage';
import FaqBabyPage from './pages/FaqBabyPage';
import BabySleepPage from './pages/outils/BabySleepPage';
import PediatricianNotesPage from './pages/outils/PediatricianNotesPage';
import EmergencyInfoPage from './pages/outils/EmergencyInfoPage';
import CockpitPage from './pages/CockpitPage';
import ChatBubble from './components/ChatBubble';
import ScannerFab from './components/ScannerFab';
import { ScannerOverlayProvider } from './contexts/ScannerOverlayContext';
import { EmotionalIntelligenceProvider } from './components/EmotionalIntelligence';
// WhatsNewModal remplacé par NewsBubble dans HomePage
import { NewBadgeProvider } from './components/NewBadge';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Toaster } from './components/ui/sonner';
import { hydrateCloudinaryFromApi } from './utils/fetusAssets';
import MaintenanceBanner from './components/MaintenanceBanner';
import { HomeLayoutProvider } from './contexts/HomeLayoutContext';
import { destinationAfterAuth } from './utils/postLogin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AUTH_LOGIN_PATH } from './utils/superadmin';

function AuthBootLoader() {
  return (
    <div
      className="min-h-screen gradient-bg flex items-center justify-center"
      data-testid="auth-boot-loader"
    >
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * Must stay at module scope.
 *
 * Defining this component inside AppInner creates a new React component type
 * every time AuthContext updates. React then unmounts/remounts the active
 * page, so every mount-only data effect fires again (profile, messages,
 * appointments, progress, reminders).
 */
function ProtectedRoute({ children, requireSubscription = true }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthBootLoader />;
  if (!isAuthenticated) return <Navigate to={AUTH_LOGIN_PATH} replace />;

  return requireSubscription ? (
    <SubscriptionGate>{children}</SubscriptionGate>
  ) : (
    children
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { isAuthenticated, loading, setAuthenticated } = useAuth();

useEffect(() => {
    hydrateCloudinaryFromApi();
    
    // Vérifier si c'est la première visite et afficher la langue détectée
    const detectedLang = checkFirstVisitLanguage();
    if (detectedLang) {
      setTimeout(() => {
        toast.info(`${detectedLang.flag} ${detectedLang.name}`, {
          description: detectedLang.code === 'fr' 
            ? 'Langue détectée automatiquement' 
            : 'Language detected automatically',
          duration: 4000
        });
      }, 1500);
    }

    // Force Service Worker update check on app load
    const onSwMessage = (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('New version available:', event.data.version);
        
        toast.info("Mise à jour disponible ! ✨", {
          description: `La version ${event.data.version} de MamanDouce est prête.`,
          duration: Infinity,
          position: 'top-center',
          action: {
            label: "Actualiser",
            onClick: () => {
              window.location.reload();
            }
          }
        });
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().catch(err => console.log('SW update check failed:', err));
      });
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AutoRefreshProvider>
        <HomeLayoutProvider>
          <NewBadgeProvider>
            <MaintenanceBanner />
            <div className="App">
              <BrowserRouter>
                <ScannerOverlayProvider>
                <Routes>
                <Route path="/invitation/:code" element={<InvitationPage />} />
                <Route
                  path="/auth"
                  element={
                    loading ? (
                      <AuthBootLoader />
                    ) : isAuthenticated ? (
                      <Navigate to={destinationAfterAuth(null)} replace />
                    ) : (
                      <AuthPage setIsAuthenticated={setAuthenticated} />
                    )
                  }
                />
                <Route
                  path="/login"
                  element={
                    loading ? (
                      <AuthBootLoader />
                    ) : isAuthenticated ? (
                      <Navigate to={destinationAfterAuth(null)} replace />
                    ) : (
                      <AuthPage setIsAuthenticated={setAuthenticated} />
                    )
                  }
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/app" element={<Navigate to="/" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/calculator" element={<ProtectedRoute><PregnancyCalculator /></ProtectedRoute>} />
                <Route path="/wheel" element={<ProtectedRoute><PregnancyWheel /></ProtectedRoute>} />
                <Route path="/scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><FoodLibraryPage /></ProtectedRoute>} />
                <Route path="/birth-list" element={<ProtectedRoute><BirthListPage /></ProtectedRoute>} />
                <Route path="/birth-list/shared/:shareId" element={<SharedBirthListPage />} />
                <Route path="/baby-videos" element={<ProtectedRoute><BabyVideosPage /></ProtectedRoute>} />
                <Route path="/baby-prep-tips" element={<ProtectedRoute><BabyPrepTipsPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/medical" element={<ProtectedRoute><MedicalAppointmentsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/tips" element={<ProtectedRoute><WeeklyTipsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute requireSubscription={false}><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute requireSubscription={false}><SettingsPage /></ProtectedRoute>} />
                <Route path="/subscription/checkout" element={<ProtectedRoute requireSubscription={false}><SubscriptionCheckout /></ProtectedRoute>} />
                <Route path="/subscription/success" element={<ProtectedRoute requireSubscription={false}><SubscriptionSuccess /></ProtectedRoute>} />
                <Route path="/subscription/cancel" element={<ProtectedRoute requireSubscription={false}><SubscriptionCancel /></ProtectedRoute>} />
                <Route path="/subscription/manage" element={<ProtectedRoute requireSubscription={false}><SubscriptionManage /></ProtectedRoute>} />
                <Route path="/maternity-bag" element={<ProtectedRoute><MaternityBagPage /></ProtectedRoute>} />
                <Route path="/postpartum" element={<ProtectedRoute><PostpartumPage /></ProtectedRoute>} />
                {/* Routes post-partum niveau 2 */}
                <Route path="/postpartum/rdv" element={<ProtectedRoute><PostpartumRdvPage /></ProtectedRoute>} />
                <Route path="/postpartum/alimentation" element={<ProtectedRoute><PostpartumAlimentationPage /></ProtectedRoute>} />
                <Route path="/postpartum/soins" element={<ProtectedRoute><PostpartumSoinsPage /></ProtectedRoute>} />
                <Route path="/postpartum/securite" element={<ProtectedRoute><PostpartumSecuritePage /></ProtectedRoute>} />
                {/* Routes post-partum niveau 3 - Alimentation */}
                <Route path="/postpartum/alimentation/allaitement" element={<ProtectedRoute><PostpartumAllaitementPage /></ProtectedRoute>} />
                <Route path="/postpartum/alimentation/biberons" element={<ProtectedRoute><PostpartumBiberonsPage /></ProtectedRoute>} />
                <Route path="/postpartum/alimentation/diversification" element={<ProtectedRoute><PostpartumDiversificationPage /></ProtectedRoute>} />
                <Route path="/postpartum/alimentation/recettes" element={<ProtectedRoute><PostpartumRecettesPage /></ProtectedRoute>} />
                {/* Routes post-partum niveau 3 - Soins */}
                <Route path="/postpartum/soins/coucher-change" element={<ProtectedRoute><PostpartumCoucherChangePage /></ProtectedRoute>} />
                <Route path="/postpartum/soins/portage" element={<ProtectedRoute><PostpartumPortagePage /></ProtectedRoute>} />
                {/* Routes post-partum niveau 3 - Sécurité */}
                <Route path="/postpartum/securite/difficultes" element={<ProtectedRoute><PostpartumDifficultesPage /></ProtectedRoute>} />
                <Route path="/postpartum/securite/precautions" element={<ProtectedRoute><PostpartumPrecautionsPage /></ProtectedRoute>} />
                <Route path="/recipes/shared/:shareCode" element={<SharedRecipesPage />} />
                <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
                <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
                <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
                <Route path="/pregnancy-after-35" element={<ProtectedRoute><PregnancyAfter35Page /></ProtectedRoute>} />
                <Route path="/baby-names" element={<ProtectedRoute><BabyNamesPage /></ProtectedRoute>} />
                <Route path="/updates" element={<ProtectedRoute requireSubscription={false}><UpdatesHistoryPage /></ProtectedRoute>} />
                <Route path="/carte-visite" element={<ProtectedRoute><CarteVisitePage /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/dashboard/calendar" element={<Navigate to="/calendar" replace />} />
                <Route path="/cycle-tracking" element={<ProtectedRoute><CycleTrackingPage /></ProtectedRoute>} />
                <Route path="/fertility-calculator" element={<ProtectedRoute><FertilityCalculatorPage /></ProtectedRoute>} />
                <Route path="/grossesse" element={<ProtectedRoute><GrossessePage /></ProtectedRoute>} />
                <Route path="/pregnancy-fertility" element={<Navigate to="/grossesse" replace />} />
                <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
                <Route path="/journey-steps" element={<ProtectedRoute><JourneyStepsPage /></ProtectedRoute>} />
                <Route path="/section/:sectionId" element={<ProtectedRoute><SectionDetailPage /></ProtectedRoute>} />
                <Route path="/preconception-tips" element={<ProtectedRoute><PreconceptionTipsPage /></ProtectedRoute>} />
                <Route path="/parental-leave" element={<ProtectedRoute><ParentalLeavePage /></ProtectedRoute>} />
                <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
                <Route path="/trophies" element={<ProtectedRoute><TrophiesPage /></ProtectedRoute>} />
                <Route path="/tirelire" element={<ProtectedRoute><TireliirePage /></ProtectedRoute>} />
                <Route path="/moderation" element={<ProtectedRoute><ModerationPage /></ProtectedRoute>} />
                <Route path="/cockpit" element={<ProtectedRoute requireSubscription={false}><CockpitPage /></ProtectedRoute>} />
                <Route path="/baby-evolution" element={<ProtectedRoute><BabyEvolutionPage /></ProtectedRoute>} />
                <Route path="/faq-baby" element={<ProtectedRoute><FaqBabyPage /></ProtectedRoute>} />
                <Route path="/outils/bonne-nuit-bebe" element={<ProtectedRoute><BabySleepPage /></ProtectedRoute>} />
                <Route path="/outils/cher-pediatre" element={<ProtectedRoute><PediatricianNotesPage /></ProtectedRoute>} />
                <Route path="/outils/fiche-urgence" element={<ProtectedRoute><EmergencyInfoPage /></ProtectedRoute>} />
              </Routes>
              <Toaster />
              <ScannerFab />
              <ChatBubble />
              <PWAInstallBanner />
              <OfflineSyncIndicator />
              <EmotionalIntelligenceProvider />
              {/* WhatsNewModal supprimé - remplacé par NewsBubble dans HomePage */}
                </ScannerOverlayProvider>
            </BrowserRouter>
          </div>
        </NewBadgeProvider>
      </HomeLayoutProvider>
        </AutoRefreshProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;
