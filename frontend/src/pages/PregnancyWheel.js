import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

function PregnancyWheel() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [results, setResults] = useState(null);

  const calculateFromWheel = () => {
    const lastPeriodDate = selectedDate.toISOString().split('T')[0];
    
    api.pregnancy.calculate({ last_period_date: lastPeriodDate })
      .then(response => {
        setResults(response.data);
        toast.success('Dates calculées avec le disque de grossesse!');
      })
      .catch(() => {
        toast.error('Erreur lors du calcul');
      });
  };

  const handleWheelRotate = (degrees) => {
    const newRotation = (rotation + degrees) % 360;
    setRotation(newRotation);
    
    // Calculer la date basée sur la rotation (1 degré = 1 jour environ)
    const daysToAdd = Math.floor(newRotation / 3.6);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysToAdd);
    setSelectedDate(newDate);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/journey-steps')}
            data-testid="back-button"
            className="bg-white text-sky-500 border border-sky-100 rounded-full p-2 hover:bg-sky-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>Disque de grossesse</h1>
        </div>

        <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Roue de calcul interactive</h2>
            <p className="text-slate-500">Tournez la roue pour sélectionner la date de vos dernières règles</p>
          </div>

          {/* Disque interactif */}
          <div className="relative w-64 h-64 mx-auto mb-6" data-testid="pregnancy-wheel">
            <div
              className="absolute inset-0 rounded-full shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: 'conic-gradient(from 0deg, #BFDBFE, #FED7E2, #DDD6FE, #FDE68A, #BFDBFE)'
              }}
            >
              {/* Marqueurs sur la roue */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-4 bg-slate-700"
                  style={{
                    left: '50%',
                    top: '10px',
                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                    transformOrigin: `center ${128}px`
                  }}
                />
              ))}
            </div>

            {/* Centre du disque */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                <RotateCw className="w-8 h-8 text-sky-500" />
              </div>
            </div>

            {/* Indicateur en haut */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-sky-500"></div>
            </div>
          </div>

          {/* Contrôles de rotation */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => handleWheelRotate(-36)}
              data-testid="rotate-left"
              className="bg-slate-100 text-slate-700 rounded-full px-6 py-2 hover:bg-slate-200"
            >
              ← -10 jours
            </Button>
            <Button
              onClick={() => handleWheelRotate(36)}
              data-testid="rotate-right"
              className="bg-slate-100 text-slate-700 rounded-full px-6 py-2 hover:bg-slate-200"
            >
              +10 jours →
            </Button>
          </div>

          {/* Date sélectionnée */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-2">Date sélectionnée des dernières règles</p>
            <p className="text-2xl font-bold text-sky-600" data-testid="selected-date">
              {selectedDate.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          <Button
            onClick={calculateFromWheel}
            data-testid="calculate-wheel-button"
            className="w-full bg-gradient-to-r from-sky-400 to-sky-300 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-sky-200/50 hover:-translate-y-0.5"
          >
            Calculer avec le disque
          </Button>
        </Card>

        {results && (
          <Card className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in" data-testid="wheel-results">
            <h3 className="text-2xl font-bold text-slate-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>Résultats du disque</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date d'ovulation estimée</p>
                <p className="text-lg font-bold text-sky-600">{formatDate(results.ovulation_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date de conception estimée</p>
                <p className="text-lg font-bold text-pink-600">{formatDate(results.conception_date)}</p>
              </div>

              <div className="bg-white rounded-2xl p-4">
                <p className="text-sm text-slate-500 font-semibold">Date prévue d'accouchement</p>
                <p className="text-lg font-bold text-rose-600">{formatDate(results.due_date)}</p>
              </div>

              <div className="bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">Semaines de grossesse</p>
                <p className="text-3xl font-bold text-slate-700">{results.weeks_pregnant} semaines</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 border-0">
          <h4 className="font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Comment utiliser le disque ?</h4>
          <ul className="text-sm text-slate-600 space-y-2">
            <li>• Tournez la roue pour sélectionner votre date de dernières règles</li>
            <li>• Utilisez les boutons pour ajuster par périodes de 10 jours</li>
            <li>• Cliquez sur "Calculer" pour obtenir toutes vos dates importantes</li>
            <li>• Le disque est un outil traditionnel utilisé par les sages-femmes</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default PregnancyWheel;
