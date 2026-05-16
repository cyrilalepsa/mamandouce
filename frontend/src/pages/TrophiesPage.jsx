import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Award, Medal, Crown, Gift, Check, Star, Sparkles, Heart } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';
import api from '../utils/api';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Animation des cœurs dorés pour Badge Or
const GoldenHeartsAnimation = ({ onComplete }) => {
  useEffect(() => {
    // Explosion de confettis dorés
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFB6C1', '#FFDAB9']
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * particleRatio),
        spread: 100,
        shapes: ['heart'],
        ...opts
      });
    }

    // Multiple bursts
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    const timeout = setTimeout(() => {
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative p-8 text-center">
        {/* Scintillements nacre */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
        
        {/* Badge Or */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full shadow-2xl flex items-center justify-center animate-bounce">
            <Crown className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-4 -right-4 animate-spin-slow">
            <Sparkles className="w-12 h-12 text-yellow-400" />
          </div>
          <div className="absolute -bottom-4 -left-4 animate-pulse">
            <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Nunito, sans-serif', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
          🏆 Badge Or débloqué ! 🏆
        </h2>
        <p className="text-xl text-yellow-200 mb-4">
          Tu es maintenant une Marraine Or !
        </p>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Félicitations pour ton engagement exceptionnel ! 
          Tu pourras bientôt aider à modérer les contributions de la communauté.
        </p>
        
        <Button 
          onClick={onComplete}
          className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Continuer ✨
        </Button>
      </div>
    </div>
  );
};

// Message de félicitations pour Bronze/Argent
const BadgeUnlockModal = ({ badge, onClose }) => {
  const badgeConfig = {
    bronze: {
      icon: Medal,
      color: 'from-amber-600 to-amber-700',
      title: 'Badge Bronze débloqué !',
      message: 'Bravo ! Tu as fait tes premières contributions validées. Continue comme ça, chaque geste compte ! 💪'
    },
    silver: {
      icon: Award,
      color: 'from-slate-400 to-slate-500',
      title: 'Badge Argent débloqué !',
      message: 'Magnifique ! Ton parrainage et tes contributions font grandir notre belle communauté. Tu es sur la bonne voie ! 🌟'
    }
  };

  const config = badgeConfig[badge];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <Card className="bg-gradient-to-br from-white via-pink-50 to-sky-50 p-8 rounded-3xl shadow-2xl max-w-sm text-center">
        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${config.color} rounded-full shadow-lg flex items-center justify-center`}>
          <Icon className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {config.title}
        </h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {config.message}
        </p>
        <Button 
          onClick={onClose}
          className="btn-cloud-3d-blue text-white px-6 py-2 rounded-full font-bold"
        >
          Merci ! 💕
        </Button>
      </Card>
    </div>
  );
};

function TrophiesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [giftEligibility, setGiftEligibility] = useState(null);
  const [myContributions, setMyContributions] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [showGoldAnimation, setShowGoldAnimation] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, giftRes, contribRes, statsRes] = await Promise.all([
        api.contributions.getBadgeProgress(),
        api.contributions.getGiftEligibility(),
        api.contributions.getMy(),
        api.contributions.getCommunityStats().catch(() => ({ data: null }))
      ]);
      
      setProgress(progressRes.data);
      setGiftEligibility(giftRes.data);
      setMyContributions(contribRes.data.contributions || []);
      if (statsRes.data) setCommunityStats(statsRes.data);
      
      // Check for new badge
      if (progressRes.data.new_badge_unlocked) {
        if (progressRes.data.new_badge_unlocked === 'gold') {
          setShowGoldAnimation(true);
        } else {
          setNewBadge(progressRes.data.new_badge_unlocked);
        }
      }
    } catch (error) {
      console.error('Error fetching trophy data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClaimFreePostpartum = async () => {
    try {
      await api.contributions.claimFreePostpartum();
      toast.success('🎁 Post-partum gratuit débloqué !');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-pink-300 border-t-pink-600 rounded-full" />
      </div>
    );
  }

  const badges = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: Medal,
      color: 'from-amber-600 to-amber-700',
      bgColor: 'bg-amber-100',
      requirement: '3 contributions validées',
      earned: progress?.bronze?.earned,
      progressContrib: progress?.bronze?.progress_contributions || 0,
      requiredContrib: 3,
      progressRef: 0,
      requiredRef: 0
    },
    {
      id: 'silver',
      name: 'Argent',
      icon: Award,
      color: 'from-slate-400 to-slate-500',
      bgColor: 'bg-slate-100',
      requirement: '1 parrainage + 2 contributions',
      earned: progress?.silver?.earned,
      progressContrib: progress?.silver?.progress_contributions || 0,
      requiredContrib: 2,
      progressRef: progress?.silver?.progress_referrals || 0,
      requiredRef: 1
    },
    {
      id: 'gold',
      name: 'Or - Marraine',
      icon: Crown,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-100',
      requirement: '3 parrainages + 5 contributions',
      earned: progress?.gold?.earned,
      progressContrib: progress?.gold?.progress_contributions || 0,
      requiredContrib: 5,
      progressRef: progress?.gold?.progress_referrals || 0,
      requiredRef: 3
    }
  ];

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6 pb-24">
      {/* Animations modales */}
      {showGoldAnimation && (
        <GoldenHeartsAnimation onComplete={() => setShowGoldAnimation(false)} />
      )}
      {newBadge && newBadge !== 'gold' && (
        <BadgeUnlockModal badge={newBadge} onClose={() => setNewBadge(null)} />
      )}

      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <PageHeader title="Mes Trophées" icon={<Trophy className="w-6 h-6 text-amber-500" />} />

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-pink-100 to-pink-50 p-4 rounded-2xl text-center">
            <div className="text-3xl font-bold text-pink-600">{progress?.contributions_validated || 0}</div>
            <div className="text-sm text-pink-700">Contributions validées</div>
          </Card>
          <Card className="bg-gradient-to-br from-sky-100 to-sky-50 p-4 rounded-2xl text-center">
            <div className="text-3xl font-bold text-sky-600">{progress?.referrals_completed || 0}</div>
            <div className="text-sm text-sky-700">Parrainages réussis</div>
          </Card>
        </div>

        {/* Badges */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Trophy className="w-5 h-5 text-amber-500" />
            Mes Badges
          </h2>

          <div className="space-y-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              const totalProgress = badge.requiredRef > 0
                ? ((badge.progressContrib / badge.requiredContrib) + (badge.progressRef / badge.requiredRef)) / 2
                : badge.progressContrib / badge.requiredContrib;
              const percentage = Math.min(totalProgress * 100, 100);

              return (
                <div 
                  key={badge.id}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    badge.earned 
                      ? `${badge.bgColor} border-transparent shadow-md` 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      badge.earned 
                        ? `bg-gradient-to-br ${badge.color}` 
                        : 'bg-slate-200'
                    }`}>
                      <Icon className={`w-7 h-7 ${badge.earned ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${badge.earned ? 'text-slate-700' : 'text-slate-500'}`}>
                          Badge {badge.name}
                        </h3>
                        {badge.earned && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                            ✓ Obtenu
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{badge.requirement}</p>
                      
                      {!badge.earned && (
                        <div className="mt-2">
                          {/* Progress bar */}
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Contributions: {badge.progressContrib}/{badge.requiredContrib}</span>
                            {badge.requiredRef > 0 && (
                              <span>Parrainages: {badge.progressRef}/{badge.requiredRef}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Gold badge indicator */}
                  {badge.id === 'gold' && badge.earned && (
                    <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl text-center">
                      <span className="text-amber-700 font-medium text-sm">
                        ✨ Tu es une Marraine Or ! Accès futur à la modération ✨
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Classement Communautaire Anonyme */}
        {communityStats && (
          <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-5 shadow-lg" data-testid="community-leaderboard">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <Star className="w-5 h-5 text-amber-500" />
              Classement Communautaire
            </h2>

            {/* Stats globales */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl text-center" style={{
                background: 'linear-gradient(160deg, #fff 0%, #fefefe 30%, #f5f5f7 100%)',
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.03), inset 2px 2px 6px rgba(255,255,255,0.9)',
              }}>
                <div className="text-2xl font-bold text-pink-600">{communityStats.total_contributors}</div>
                <div className="text-xs text-slate-500">Contributrices</div>
              </div>
              <div className="p-3 rounded-xl text-center" style={{
                background: 'linear-gradient(160deg, #fff 0%, #fefefe 30%, #f5f5f7 100%)',
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(0,0,0,0.03), inset 2px 2px 6px rgba(255,255,255,0.9)',
              }}>
                <div className="text-2xl font-bold text-sky-600">{communityStats.total_contributions}</div>
                <div className="text-xs text-slate-500">Contributions</div>
              </div>
            </div>

            {/* Badges distribués */}
            <div className="space-y-2">
              {[
                { badge: 'gold', name: communityStats.badge_names?.gold || 'Marraine Or', count: communityStats.badges?.gold || 0, icon: Crown, gradient: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-100' },
                { badge: 'silver', name: communityStats.badge_names?.silver || 'Argent', count: communityStats.badges?.silver || 0, icon: Award, gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-100' },
                { badge: 'bronze', name: communityStats.badge_names?.bronze || 'Bronze', count: communityStats.badges?.bronze || 0, icon: Medal, gradient: 'from-amber-600 to-amber-700', bg: 'bg-amber-100' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.badge} className="flex items-center gap-3 p-3 rounded-xl" style={{
                    background: 'linear-gradient(160deg, #fff 0%, #fefefe 30%, #fafafa 100%)',
                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(240,240,242,0.8)',
                  }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-700">{item.count}</span>
                      <span className="text-xs text-slate-400 ml-1">membres</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Motivation */}
            {communityStats.badges?.gold === 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100/50 to-amber-100/50 rounded-xl text-center">
                <p className="text-sm text-amber-700 font-medium">
                  Soyez la première Marraine Or de la communauté !
                </p>
              </div>
            )}
            {communityStats.badges?.gold > 0 && !progress?.gold?.earned && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100/50 to-amber-100/50 rounded-xl text-center">
                <p className="text-sm text-amber-700 font-medium">
                  {communityStats.badges.gold} Marraine{communityStats.badges.gold > 1 ? 's' : ''} Or dans la communauté — rejoignez-les !
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Gift Eligibility */}
        <Card className="bg-gradient-to-br from-purple-100 via-pink-50 to-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Gift className="w-5 h-5 text-purple-500" />
            Cadeaux & Parrainage
          </h2>

          {/* Free postpartum claim */}
          {giftEligibility?.can_claim_free_postpartum && (
            <div className="mb-4 p-4 bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl border-2 border-rose-300">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-6 h-6 text-rose-500" />
                <span className="font-bold text-rose-700">Post-partum gratuit disponible !</span>
              </div>
              <p className="text-rose-600 text-sm mb-3">
                Grâce à tes 2 parrainages, tu peux réclamer le suivi post-partum gratuitement.
              </p>
              <Button 
                onClick={handleClaimFreePostpartum}
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold"
                data-testid="claim-free-postpartum-btn"
              >
                Réclamer mon cadeau 🎁
              </Button>
            </div>
          )}

          {giftEligibility?.postpartum_claimed && (
            <div className="mb-4 p-3 bg-green-100 rounded-xl text-green-700 text-sm flex items-center gap-2">
              <Check className="w-5 h-5" />
              Post-partum gratuit déjà réclamé !
            </div>
          )}

          {/* Gift buttons */}
          {giftEligibility?.gifts_available?.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-600 text-sm">Tu peux offrir un cadeau à une amie :</p>
              {giftEligibility.gifts_available.map((gift, i) => (
                <Button
                  key={i}
                  onClick={() => navigate(`/referral/gift?type=${gift.type}`)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold"
                  data-testid={`gift-${gift.type}-btn`}
                >
                  🎁 Offrir {gift.name} ({gift.value}€)
                </Button>
              ))}
            </div>
          )}

          {!giftEligibility?.can_claim_free_postpartum && giftEligibility?.gifts_available?.length === 0 && (
            <div className="text-center text-slate-500 py-4">
              <p className="mb-2">Continue à parrainer pour débloquer des cadeaux !</p>
              <p className="text-sm">
                • 2 parrainages = Post-partum gratuit<br/>
                • 3+ parrainages = Offrir Post-partum<br/>
                • 5+ parrainages = Offrir Premium
              </p>
              <Button
                onClick={() => navigate('/referral')}
                className="mt-4 btn-cloud-3d-blue text-white px-6 py-2 rounded-full font-bold"
              >
                Parrainer une amie
              </Button>
            </div>
          )}
        </Card>

        {/* Mes contributions récentes */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <h2 className="text-lg font-bold text-slate-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Mes Contributions
          </h2>

          {myContributions.length === 0 ? (
            <div className="text-center text-slate-500 py-6">
              <p className="mb-3">Tu n'as pas encore soumis de contribution.</p>
              <p className="text-sm text-slate-400 mb-4">
                Contribue via le Scan alimentaire, le Sac de maternité ou les Recettes bébé !
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {myContributions.slice(0, 10).map((contrib) => (
                <div 
                  key={contrib.id}
                  className={`p-3 rounded-xl border ${
                    contrib.status === 'approved' 
                      ? 'bg-green-50 border-green-200' 
                      : contrib.status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-700">{contrib.title}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {contrib.contribution_type === 'food_scan' && '🍎 Scan'}
                        {contrib.contribution_type === 'maternity_bag' && '👜 Sac'}
                        {contrib.contribution_type === 'recipe' && '🍼 Recette'}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contrib.status === 'approved' 
                        ? 'bg-green-200 text-green-700' 
                        : contrib.status === 'rejected'
                        ? 'bg-red-200 text-red-700'
                        : 'bg-amber-200 text-amber-700'
                    }`}>
                      {contrib.status === 'approved' && '✓ Validée'}
                      {contrib.status === 'rejected' && '✗ Refusée'}
                      {contrib.status === 'pending' && '⏳ En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default TrophiesPage;
