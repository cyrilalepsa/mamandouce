import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/App.css';
import ErrorBoundary from './components/ErrorBoundary';
import { SubscriptionGate } from './components/SubscriptionGate';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PregnancyCalculator from './pages/PregnancyCalculator';
import PregnancyWheel from './pages/PregnancyWheel';
import FoodScanner from './pages/FoodScanner';
import FoodLibraryPage from './pages/FoodLibraryPage';
import BirthListPage from './pages/BirthListPage';
import SharedBirthListPage from './pages/SharedBirthListPage';
import EmbryoTracker from './pages/EmbryoTracker';
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
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MaternityBagPage from './pages/MaternityBagPage';
import PostpartumPage from './pages/PostpartumPage';
import SharedRecipesPage from './pages/SharedRecipesPage';
import GuidePage from './pages/GuidePage';
import ChatbotPage from './pages/ChatbotPage';
import TrackingPage from './pages/TrackingPage';
import ChatBubble from './components/ChatBubble';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Toaster } from './components/ui/sonner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children, requireSubscription = true }) => {
    if (loading) return <div>Chargement...</div>;
    if (!isAuthenticated) return <Navigate to="/auth" />;
    
    // Si l'abonnement est requis, encapsuler avec SubscriptionGate
    if (requireSubscription) {
      return <SubscriptionGate>{children}</SubscriptionGate>;
    }
    
    return children;
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><PregnancyCalculator /></ProtectedRoute>} />
            <Route path="/wheel" element={<ProtectedRoute><PregnancyWheel /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><FoodLibraryPage /></ProtectedRoute>} />
            <Route path="/birth-list" element={<ProtectedRoute><BirthListPage /></ProtectedRoute>} />
            <Route path="/birth-list/shared/:shareId" element={<SharedBirthListPage />} />
            <Route path="/embryo" element={<ProtectedRoute><EmbryoTracker /></ProtectedRoute>} />
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
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/maternity-bag" element={<ProtectedRoute><MaternityBagPage /></ProtectedRoute>} />
            <Route path="/postpartum" element={<ProtectedRoute><PostpartumPage /></ProtectedRoute>} />
            <Route path="/recipes/shared/:shareCode" element={<SharedRecipesPage />} />
            <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <ChatBubble />
        <PWAInstallBanner />
        <OfflineSyncIndicator />
      </div>
    </ErrorBoundary>
  );
}

export default App;
