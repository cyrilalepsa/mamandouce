import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Youtube, Play, ExternalLink, Baby, Heart, BookOpen, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CloudCard } from '../components/ui/CloudCard';

// Styles glossy 3D nuage
const glossyStyles = {
  pink: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(252,231,243,0.9) 45%, rgba(251,207,232,0.75) 70%, rgba(249,168,212,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(244,114,182,0.25), 0 6px 12px -4px rgba(244,114,182,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(244,114,182,0.1)',
    border: '2px solid rgba(244,114,182,0.25)'
  },
  blue: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,242,254,0.9) 45%, rgba(186,230,253,0.75) 70%, rgba(125,211,252,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(56,189,248,0.25), 0 6px 12px -4px rgba(56,189,248,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(56,189,248,0.1)',
    border: '2px solid rgba(125,211,252,0.3)'
  },
  purple: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(243,232,255,0.9) 45%, rgba(233,213,255,0.75) 70%, rgba(216,180,254,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(168,85,247,0.25), 0 6px 12px -4px rgba(168,85,247,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(168,85,247,0.1)',
    border: '2px solid rgba(216,180,254,0.3)'
  },
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,243,199,0.9) 45%, rgba(253,230,138,0.75) 70%, rgba(251,191,36,0.5) 100%)',
    shadow: '0 10px 28px -6px rgba(245,158,11,0.25), 0 6px 12px -4px rgba(245,158,11,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(245,158,11,0.1)',
    border: '2px solid rgba(251,191,36,0.3)'
  },
  teal: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(204,251,241,0.9) 45%, rgba(153,246,228,0.75) 70%, rgba(94,234,212,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(20,184,166,0.25), 0 6px 12px -4px rgba(20,184,166,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(20,184,166,0.1)',
    border: '2px solid rgba(94,234,212,0.3)'
  },
  red: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(254,226,226,0.9) 45%, rgba(254,202,202,0.75) 70%, rgba(252,165,165,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(239,68,68,0.25), 0 6px 12px -4px rgba(239,68,68,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(239,68,68,0.1)',
    border: '2px solid rgba(252,165,165,0.3)'
  },
  sky: {
    bg: 'linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.97) 20%, rgba(224,247,250,0.9) 45%, rgba(186,242,250,0.75) 70%, rgba(125,225,252,0.55) 100%)',
    shadow: '0 10px 28px -6px rgba(14,165,233,0.25), 0 6px 12px -4px rgba(14,165,233,0.15), inset 0 2px 6px rgba(255,255,255,0.98), inset 0 -3px 6px rgba(14,165,233,0.1)',
    border: '2px solid rgba(125,225,252,0.3)'
  }
};

// Map couleur vidéo -> style glossy
const videoGlossyMap = {
  'maternelles': 'red',
  'papa-positive': 'blue',
  'anna-roy': 'pink',
  'mpedia': 'teal',
  'haptonomie': 'purple',
  'preparation-accouchement': 'amber',
  'allaitement': 'sky',
  'soins-bebe': 'teal'
};

// Reflet glossy
const GlossyReflect = () => (
  <div 
    className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
  />
);

const VIDEO_RESOURCES = [
  {
    id: 'maternelles',
    title: 'La Maison des Maternelles',
    desc: 'Émission France TV - Conseils grossesse & bébé',
    icon: '📺',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    url: 'https://www.youtube.com/@lamaisondesmaternelles'
  },
  {
    id: 'papa-positive',
    title: 'Papa Positive',
    desc: 'Parentalité bienveillante & éducation',
    icon: '👨‍👧',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    url: 'https://www.youtube.com/@papapositive'
  },
  {
    id: 'anna-roy',
    title: 'Anna Roy - Sage-femme',
    desc: 'Conseils de sage-femme expérimentée',
    icon: '👩‍⚕️',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    url: 'https://www.youtube.com/@AnnaRoySageFemme'
  },
  {
    id: 'mpedia',
    title: 'mpedia - Pédiatres',
    desc: 'Conseils pédiatriques officiels',
    icon: '👶',
    color: 'from-teal-400 to-emerald-500',
    bgColor: 'bg-teal-50',
    url: 'https://www.youtube.com/@mpediafr'
  },
  {
    id: 'haptonomie',
    title: 'Haptonomie & Bien-être',
    desc: 'Lien affectif prénatal',
    icon: '🤰',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-purple-50',
    url: 'https://www.youtube.com/results?search_query=haptonomie+grossesse'
  },
  {
    id: 'preparation-accouchement',
    title: 'Préparation à l\'accouchement',
    desc: 'Techniques de respiration & positions',
    icon: '🧘‍♀️',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    url: 'https://www.youtube.com/results?search_query=preparation+accouchement'
  },
  {
    id: 'allaitement',
    title: 'Allaitement maternel',
    desc: 'Conseils et positions d\'allaitement',
    icon: '🍼',
    color: 'from-sky-400 to-blue-500',
    bgColor: 'bg-sky-50',
    url: 'https://www.youtube.com/results?search_query=allaitement+maternel+conseils'
  },
  {
    id: 'soins-bebe',
    title: 'Premiers soins bébé',
    desc: 'Bain, change, soins du cordon',
    icon: '🛁',
    color: 'from-cyan-400 to-teal-500',
    bgColor: 'bg-cyan-50',
    url: 'https://www.youtube.com/results?search_query=soins+nouveau+né+tutoriel'
  }
];

function BabyVideosPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openVideo = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header - Effet glossy */}
        <CloudCard color="pink" className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="p-2 rounded-full hover:bg-white/50"
              data-testid="back-button"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Vidéos & Ressources
              </h1>
              <p className="text-sm text-slate-500">Tutoriels et conseils vidéo</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
        </CloudCard>

        {/* Introduction - Effet glossy */}
        <CloudCard color="pink" className="p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Chaînes recommandées</p>
              <p className="text-sm text-slate-500">Sélection de vidéos pour vous accompagner</p>
            </div>
          </div>
        </CloudCard>

        {/* Grille de vidéos - Effet glossy */}
        <div className="grid grid-cols-2 gap-3">
          {VIDEO_RESOURCES.map((resource) => {
            const glossyColor = videoGlossyMap[resource.id] || 'pink';
            const style = glossyStyles[glossyColor];
            
            return (
              <div
                key={resource.id}
                onClick={() => openVideo(resource.url)}
                className="relative overflow-hidden rounded-2xl p-4 cursor-pointer hover:scale-[0.98] transition-all active:scale-95"
                style={{
                  background: style.bg,
                  boxShadow: style.shadow,
                  border: style.border
                }}
              >
                <GlossyReflect />
                <div className="relative text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${resource.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">{resource.icon}</span>
                  </div>
                  <h3 className="font-semibold text-slate-700 text-sm mb-1 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {resource.desc}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-400">
                    <ExternalLink className="w-3 h-3" />
                    <span>YouTube</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note en bas */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Ces liens ouvrent YouTube dans un nouvel onglet</p>
        </div>
      </div>
    </div>
  );
}

export default BabyVideosPage;
