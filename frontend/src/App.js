import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/App.css';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PregnancyCalculator from './pages/PregnancyCalculator';
import FoodScanner from './pages/FoodScanner';
import EmbryoTracker from './pages/EmbryoTracker';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import WeeklyTipsPage from './pages/WeeklyTipsPage';
import ProfilePage from './pages/ProfilePage';
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
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><PregnancyCalculator /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
          <Route path="/embryo" element={<ProtectedRoute><EmbryoTracker /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/tips" element={<ProtectedRoute><WeeklyTipsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
