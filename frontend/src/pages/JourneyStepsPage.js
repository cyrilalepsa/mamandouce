import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Sparkles, Baby, Gift, HeartHandshake, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../utils/api';
import {
  PreconceptionSection,
  PregnancySection,
  BabyPreparationSection,
  PostpartumSection,
  ServicesSection,
  PinnedSectionsProvider
} from '../components/home';

function JourneyStepsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pregnancyProfile, setPregnancyProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.pregnancy.getProfile();
      setPregnancyProfile(res.data);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const hasPregnancyProfile = pregnancyProfile && pregnancyProfile.current_week;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-pink-400" />
              <h1 
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                {t('home.journeySteps', 'Les étapes de votre plus beau voyage')}
              </h1>
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-sm text-slate-500">
              {t('journey.subtitle', 'Votre compagnon à chaque étape')}
            </p>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Introduction */}
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-5 mb-6 border-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t('journey.welcomeTitle', 'Bienvenue dans votre parcours')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('journey.welcomeDesc', 'De la conception à l\'arrivée de bébé, nous sommes là pour vous accompagner. Explorez chaque étape à votre rythme.')}
              </p>
            </div>
          </div>
        </Card>

        {/* Les 5 sections */}
        <PinnedSectionsProvider>
          <div className="space-y-4">
            {/* Étape 1: En route vers la grossesse */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 to-pink-300 -z-10"></div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-sm font-semibold text-amber-600">{t('journey.step', 'Étape')} 1</span>
              </div>
              <div className="ml-6 pl-6">
                <PreconceptionSection />
              </div>
            </div>

            {/* Étape 2: Grossesse */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 to-purple-300 -z-10"></div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <Baby className="w-5 h-5 text-pink-500" />
                </div>
                <span className="text-sm font-semibold text-pink-600">{t('journey.step', 'Étape')} 2</span>
              </div>
              <div className="ml-6 pl-6">
                <PregnancySection 
                  hasPregnancyProfile={hasPregnancyProfile}
                  pregnancyProfile={pregnancyProfile}
                />
              </div>
            </div>

            {/* Étape 3: Préparer l'arrivée de bébé */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-rose-300 -z-10"></div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <Gift className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm font-semibold text-purple-600">{t('journey.step', 'Étape')} 3</span>
              </div>
              <div className="ml-6 pl-6">
                <BabyPreparationSection />
              </div>
            </div>

            {/* Étape 4: Suivi post-partum */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 to-slate-300 -z-10"></div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <HeartHandshake className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-sm font-semibold text-rose-600">{t('journey.step', 'Étape')} 4</span>
              </div>
              <div className="ml-6 pl-6">
                <PostpartumSection />
              </div>
            </div>

            {/* Étape 5: Services et ressources */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <Settings className="w-5 h-5 text-slate-500" />
                </div>
                <span className="text-sm font-semibold text-slate-600">{t('journey.step', 'Étape')} 5</span>
              </div>
              <div className="ml-6 pl-6">
                <ServicesSection />
              </div>
            </div>
          </div>
        </PinnedSectionsProvider>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
            <Heart className="w-4 h-4 text-pink-300" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
          </div>
          <p className="text-sm text-slate-400 mt-3">
            {t('journey.footer', 'MamanDouce - Votre compagnon de grossesse')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default JourneyStepsPage;
