import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/App.css';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PregnancyCalculator from './pages/PregnancyCalculator';
import PregnancyWheel from './pages/PregnancyWheel';
import FoodScanner from './pages/FoodScanner';
import FoodLibraryPage from './pages/FoodLibraryPage';
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

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Chargement...</div>;
    return isAuthenticated ? children : <Navigate to="/auth" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><PregnancyCalculator /></ProtectedRoute>} />
          <Route path="/wheel" element={<ProtectedRoute><PregnancyWheel /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><FoodLibraryPage /></ProtectedRoute>} />
          <Route path="/embryo" element={<ProtectedRoute><EmbryoTracker /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/medical" element={<ProtectedRoute><MedicalAppointmentsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><WeeklyTipsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/subscription/checkout" element={<ProtectedRoute><SubscriptionCheckout /></ProtectedRoute>} />
          <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
          <Route path="/subscription/cancel" element={<ProtectedRoute><SubscriptionCancel /></ProtectedRoute>} />
          <Route path="/subscription/manage" element={<ProtectedRoute><SubscriptionManage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
