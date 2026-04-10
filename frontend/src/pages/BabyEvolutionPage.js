import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BabyEvolutionWidget from '../components/pregnancy/BabyEvolutionWidget';

function BabyEvolutionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20" style={{ paddingTop: '1rem' }}>
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-30 px-4 py-4 mb-4" 
        style={{
          background: 'linear-gradient(180deg, rgba(255, 248, 249, 0.98) 0%, rgba(255, 248, 249, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 220, 230, 0.3)',
          boxShadow: '0 2px 12px rgba(255, 183, 197, 0.08)'
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #FFD1DC 0%, #FFB7C5 100%)',
              boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)',
              color: 'white'
            }}
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 
            className="text-2xl font-bold"
            style={{ 
              color: '#4A4A4A',
              fontFamily: "'Nunito', sans-serif"
            }}
          >
            Évolution de votre bébé
          </h1>
        </div>
      </div>

      {/* Widget d'évolution */}
      <BabyEvolutionWidget />
    </div>
  );
}

export default BabyEvolutionPage;
