import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Baby, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import PageHeader from '../components/PageHeader';

// Fetus data by week with images
const FETUS_DATA = {
  4: {
    size: "1-2 mm",
    weight: "< 1 g",
    description: "L'embryon s'implante. Le cœur commence à battre.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/0bbab837f10c9e69484240309928682546f029561264aa36beaa89af2e6b62a2.png",
    comparison: "une graine de pavot"
  },
  8: {
    size: "1.6 cm",
    weight: "1 g",
    description: "Tous les organes majeurs se forment. Les doigts apparaissent.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/1f4a318a55d19ab6d3e8c11a32e65803c1d03c9d489ee66a53c380d83eb5bb5e.png",
    comparison: "un haricot"
  },
  12: {
    size: "5-6 cm",
    weight: "14 g",
    description: "Le fœtus bouge ! Les organes génitaux se différencient.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/999a64924c3cdd97db37f6b69abd53331c5e640c2e5612deeffdea8a9280afe2.png",
    comparison: "un citron vert"
  },
  16: {
    size: "11 cm",
    weight: "100 g",
    description: "Bébé suce son pouce. Il entend les sons.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/999a64924c3cdd97db37f6b69abd53331c5e640c2e5612deeffdea8a9280afe2.png",
    comparison: "un avocat"
  },
  20: {
    size: "16 cm",
    weight: "300 g",
    description: "Mi-parcours ! Bébé alterne sommeil et éveil.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/bb6c725791be0cdea1c4d313eeb9051da166e9141b808cde2ec71a1a7445d448.png",
    comparison: "une banane"
  },
  24: {
    size: "30 cm",
    weight: "600 g",
    description: "Les poumons se développent. Bébé réagit aux sons.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/bb6c725791be0cdea1c4d313eeb9051da166e9141b808cde2ec71a1a7445d448.png",
    comparison: "un épi de maïs"
  },
  28: {
    size: "37 cm",
    weight: "1 kg",
    description: "Les yeux s'ouvrent. Bébé reconnaît votre voix.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/9ab1cd60c07750f17e763f8b1ddfd2609451feb13d9cb4d30fdecb3aca855a43.png",
    comparison: "une aubergine"
  },
  32: {
    size: "42 cm",
    weight: "1.7 kg",
    description: "Bébé se positionne tête en bas. Poumons presque matures.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/9ab1cd60c07750f17e763f8b1ddfd2609451feb13d9cb4d30fdecb3aca855a43.png",
    comparison: "un ananas"
  },
  36: {
    size: "47 cm",
    weight: "2.6 kg",
    description: "Presque prêt ! Les organes sont matures.",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/2f5e522f2b941e79f7625c2a59e5f94956d64f3b2b040a0b37390de680960a89.png",
    comparison: "un melon"
  },
  40: {
    size: "50 cm",
    weight: "3.3 kg",
    description: "Bébé est prêt à naître !",
    image: "https://static.prod-images.emergentagent.com/jobs/5c433531-0d80-423b-a48b-b2f541e390ce/images/b5dbbd61c22245437260356aabfd5b97b03e9c8fc8bad7f582662b0e4475d76e.png",
    comparison: "une pastèque"
  }
};

// Get data for any week by interpolation
const getDataForWeek = (week) => {
  const definedWeeks = Object.keys(FETUS_DATA).map(Number).sort((a, b) => a - b);
  
  // Find closest defined week
  let closestWeek = definedWeeks[0];
  for (const w of definedWeeks) {
    if (w <= week) closestWeek = w;
  }
  
  const baseData = FETUS_DATA[closestWeek];
  
  // Interpolate size and weight
  let size, weight;
  if (week <= 4) {
    size = `${(week * 0.5).toFixed(1)} mm`;
    weight = "< 1 g";
  } else if (week <= 12) {
    size = `${(week * 0.5).toFixed(1)} cm`;
    weight = `${Math.round(week * 1.2)} g`;
  } else if (week <= 20) {
    size = `${week - 4} cm`;
    weight = `${Math.round(week * 15)} g`;
  } else {
    size = `${Math.round(20 + (week - 20) * 1.5)} cm`;
    weight = `${((week - 20) * 0.1 + 0.3).toFixed(1)} kg`;
  }
  
  return {
    ...baseData,
    size: FETUS_DATA[closestWeek]?.size || size,
    weight: FETUS_DATA[closestWeek]?.weight || weight
  };
};

function FetusEvolutionPage() {
  const [currentWeek, setCurrentWeek] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pregnancyWeek, setPregnancyWeek] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load user's pregnancy week
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.pregnancy.getProfile();
        if (response.data?.current_week) {
          setPregnancyWeek(response.data.current_week);
          setCurrentWeek(response.data.current_week);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Auto-play animation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentWeek(prev => {
          if (prev >= 40) {
            setIsPlaying(false);
            return 40;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle week change with transition
  const handleWeekChange = (newWeek) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentWeek(newWeek);
      setIsTransitioning(false);
    }, 150);
  };

  const currentData = getDataForWeek(currentWeek);
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3;

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Évolution 3D" />

        {/* Current Week Display */}
        {pregnancyWeek && (
          <Card className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-4 border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Votre grossesse</p>
                  <p className="text-lg font-bold text-purple-600">Semaine {pregnancyWeek}</p>
                </div>
              </div>
              <Button
                onClick={() => handleWeekChange(pregnancyWeek)}
                className="bg-purple-500 text-white rounded-xl px-4 py-2 text-sm"
              >
                Ma semaine
              </Button>
            </div>
          </Card>
        )}

        {/* 3D Viewer Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 overflow-hidden relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl" />
          
          {/* Week indicator */}
          <div className="relative z-10 text-center mb-4">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-bold">
              Semaine {currentWeek}
            </span>
            <span className="ml-2 text-slate-400 text-sm">
              Trimestre {trimester}
            </span>
          </div>

          {/* 3D Fetus Display */}
          <div className="relative z-10 flex justify-center py-8">
            <div 
              className={`relative transition-all duration-500 ease-out ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
              style={{
                animation: !isTransitioning ? 'float 3s ease-in-out infinite, rotate3d 8s ease-in-out infinite' : 'none',
              }}
            >
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 to-purple-400/30 blur-2xl rounded-full scale-110" />
              
              {/* Fetus image */}
              <img
                src={currentData.image}
                alt={`Fœtus semaine ${currentWeek}`}
                className="relative w-56 h-56 object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.4))',
                  transform: `scale(${0.5 + (currentWeek / 40) * 0.5})`,
                }}
              />
              
              {/* Size comparison circle */}
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1"
              >
                <span className="text-white/80 text-xs">≈ {currentData.comparison}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-pink-300 text-xs font-semibold mb-1">Taille</p>
              <p className="text-white text-xl font-bold">{currentData.size}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-purple-300 text-xs font-semibold mb-1">Poids</p>
              <p className="text-white text-xl font-bold">{currentData.weight}</p>
            </div>
          </div>

          {/* Description */}
          <div className="relative z-10 mt-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-white/90 text-center text-sm leading-relaxed">
              {currentData.description}
            </p>
          </div>
        </Card>

        {/* Slider Control */}
        <Card className="bg-white rounded-3xl p-6 shadow-lg">
          {/* Play controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={() => handleWeekChange(Math.max(1, currentWeek - 1))}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              disabled={currentWeek <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-14 h-14 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'} text-white shadow-lg`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            
            <Button
              onClick={() => handleWeekChange(Math.min(40, currentWeek + 1))}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              disabled={currentWeek >= 40}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Week Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Semaine 1</span>
              <span className="font-bold text-purple-600">Semaine {currentWeek}</span>
              <span>Semaine 40</span>
            </div>
            
            <input
              type="range"
              min="1"
              max="40"
              value={currentWeek}
              onChange={(e) => handleWeekChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #8b5cf6 ${(currentWeek / 40) * 100}%, #e2e8f0 ${(currentWeek / 40) * 100}%, #e2e8f0 100%)`,
              }}
            />
            
            {/* Trimester markers */}
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span className={trimester === 1 ? 'text-pink-500 font-bold' : ''}>1er trim.</span>
              <span className={trimester === 2 ? 'text-purple-500 font-bold' : ''}>2ème trim.</span>
              <span className={trimester === 3 ? 'text-indigo-500 font-bold' : ''}>3ème trim.</span>
            </div>
          </div>

          {/* Quick week buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((week) => (
              <button
                key={week}
                onClick={() => handleWeekChange(week)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  currentWeek === week
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-110'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                S{week}
              </button>
            ))}
          </div>
        </Card>

        {/* CSS for animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes rotate3d {
            0%, 100% { transform: perspective(1000px) rotateY(-5deg); }
            50% { transform: perspective(1000px) rotateY(5deg); }
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
            border: 3px solid white;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
            border: 3px solid white;
          }
        `}</style>
      </div>
    </div>
  );
}

export default FetusEvolutionPage;
