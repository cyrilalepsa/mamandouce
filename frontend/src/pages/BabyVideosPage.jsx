import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Youtube, Play, ExternalLink, Baby, Heart, BookOpen, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ResourceCard } from '../components/ui/SoftClayCards';
import { IconWell } from '../components/ui/IconWell';
import { cycleAccentByIndex } from '../utils/accentTokens';

const VIDEO_RESOURCES = [
  {
    id: 'maternelles',
    title: 'La Maison des Maternelles',
    desc: 'Émission France TV - Conseils grossesse & bébé',
    icon: '📺',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50',
    url: 'https://www.youtube.com/@lamaisondesmaternelles'
  },
  {
    id: 'papa-positive',
    title: 'Papa Positive',
    desc: 'Parentalité bienveillante & éducation',
    icon: '👨‍👧',
    color: 'from-blue-400 to-sky-500',
    bgColor: 'bg-blue-50',
    url: 'https://www.youtube.com/@papapositive'
  },
  {
    id: 'anna-roy',
    title: 'Anna Roy - Sage-femme',
    desc: 'Conseils de sage-femme expérimentée',
    icon: '👩‍⚕️',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
    url: 'https://www.youtube.com/@AnnaRoySageFemme'
  },
  {
    id: 'mpedia',
    title: 'mpedia - Pédiatres',
    desc: 'Conseils pédiatriques officiels',
    icon: '👶',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50',
    url: 'https://www.youtube.com/@mpediafr'
  },
  {
    id: 'haptonomie',
    title: 'Haptonomie & Bien-être',
    desc: 'Lien affectif prénatal',
    icon: '🤰',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    url: 'https://www.youtube.com/results?search_query=haptonomie+grossesse'
  },
  {
    id: 'preparation-accouchement',
    title: 'Préparation à l\'accouchement',
    desc: 'Techniques de respiration & positions',
    icon: '🧘‍♀️',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50',
    url: 'https://www.youtube.com/results?search_query=preparation+accouchement'
  },
  {
    id: 'allaitement',
    title: 'Allaitement maternel',
    desc: 'Conseils et positions d\'allaitement',
    icon: '🍼',
    color: 'from-blue-400 to-sky-500',
    bgColor: 'bg-blue-50',
    url: 'https://www.youtube.com/results?search_query=allaitement+maternel+conseils'
  },
  {
    id: 'soins-bebe',
    title: 'Premiers soins bébé',
    desc: 'Bain, change, soins du cordon',
    icon: '🛁',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50',
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
        {/* Header — texte pur, sans bulle */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Vidéos & Ressources
            </h1>
            <p className="text-sm text-slate-500">Chaînes recommandées pour vous accompagner</p>
          </div>
        </div>

        {/* Liste de vidéos — mode liste, cartes blanches glossy 3D */}
        <div className="space-y-3">
          {VIDEO_RESOURCES.map((resource, index) => (
            <ResourceCard
              key={resource.id}
              index={index}
              onClick={() => openVideo(resource.url)}
              testId={`video-${resource.id}`}
              className="p-4"
            >
              <div className="flex items-center gap-4">
                <IconWell accent={cycleAccentByIndex(index)} size="xl">
                  <span className="text-2xl">{resource.icon}</span>
                </IconWell>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm mb-0.5">{resource.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-1">{resource.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </div>
            </ResourceCard>
          ))}
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
