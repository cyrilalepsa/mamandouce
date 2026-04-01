import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Youtube, Play, ExternalLink, Baby, Heart, BookOpen, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/section/baby-preparation')}
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
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Introduction */}
        <Card className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 mb-6 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">Chaînes recommandées</p>
              <p className="text-sm text-slate-500">Sélection de vidéos pour vous accompagner</p>
            </div>
          </div>
        </Card>

        {/* Grille de vidéos */}
        <div className="grid grid-cols-2 gap-3">
          {VIDEO_RESOURCES.map((resource) => (
            <Card
              key={resource.id}
              onClick={() => openVideo(resource.url)}
              className={`${resource.bgColor} rounded-2xl p-4 border-0 cursor-pointer hover:shadow-lg transition-all active:scale-95`}
            >
              <div className="text-center">
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
            </Card>
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
