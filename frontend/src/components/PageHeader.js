import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * PageHeader - En-tête de page avec bouton retour et titre calligraphique
 * @param {string} title - Titre de la page
 * @param {string} backPath - Chemin de retour (default: utilise navigate(-1) pour revenir en arrière)
 */
function PageHeader({ title, backPath }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        onClick={handleBack}
        data-testid="back-button"
        className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex-1">
        <h1 
          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-coral-400 bg-clip-text text-transparent"
          style={{ 
            fontFamily: "'Dancing Script', cursive",
            textShadow: '0 1px 2px rgba(244, 114, 182, 0.1)'
          }}
          data-testid="page-title"
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

export default PageHeader;
