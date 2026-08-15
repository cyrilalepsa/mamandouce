import React from 'react';
import { hideBootLoader } from '../utils/backendUrl';

function shouldShowErrorDetails() {
  if (typeof window === 'undefined') return false;
  try {
    if (import.meta.env && import.meta.env.DEV) return true;
    if (import.meta.env && import.meta.env.MODE && import.meta.env.MODE !== 'production') {
      return true;
    }
  } catch {
    /* ignore */
  }
  const host = window.location.hostname || '';
  return (
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('staging') ||
    host.includes('preview') ||
    host.includes('neriacorp.com') ||
    host.includes('cycafamily.com') ||
    host.includes('railway.app')
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    hideBootLoader();
  }

  componentDidMount() {
    if (this.state.hasError) hideBootLoader();
  }

  componentDidUpdate() {
    if (this.state.hasError) hideBootLoader();
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const showDetails = shouldShowErrorDetails();
      const message = this.state.error?.message || String(this.state.error || 'Erreur inconnue');
      const stack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl" aria-hidden>⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Oups ! Une erreur s'est produite
            </h1>
            <p className="text-slate-500 mb-4">
              Ne vous inquiétez pas, cela arrive parfois. Essayez de recharger la page.
            </p>
            {showDetails && (
              <pre
                data-testid="boot-error-details"
                className="text-left text-xs bg-slate-900 text-red-100 rounded-xl p-4 mb-6 overflow-auto max-h-56 whitespace-pre-wrap"
              >
                {message}
                {stack ? `\n\n${stack}` : ''}
                {componentStack ? `\n${componentStack}` : ''}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleGoHome}
                className="bg-slate-200 text-slate-700 rounded-full px-6 py-2"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-6 py-2"
              >
                Recharger
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
