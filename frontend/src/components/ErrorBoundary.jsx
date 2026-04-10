import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Oups ! Une erreur s'est produite
            </h1>
            <p className="text-slate-500 mb-6">
              Ne vous inquiétez pas, cela arrive parfois. Essayez de recharger la page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleGoHome}
                className="bg-slate-200 text-slate-700 rounded-full px-6 py-2 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Button>
              <Button
                onClick={this.handleReload}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-6 py-2 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
