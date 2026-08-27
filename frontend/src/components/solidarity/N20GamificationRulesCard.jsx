import {
  Award,
  Crown,
  CreditCard,
  HandHeart,
  Medal,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card } from '../ui/card';
import { N20Amount } from '../N20Icon';

function RuleItem({ icon: Icon, iconClass, title, children }) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}
      >
        <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-700 text-sm">{title}</p>
        <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{children}</p>
      </div>
    </li>
  );
}

function BadgeTier({ icon: Icon, label, detail, unlockedClass, lockedClass }) {
  return (
    <div className="text-center min-w-0">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1.5 ${unlockedClass}`}
      >
        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <p className={`text-xs font-semibold ${lockedClass}`}>{label}</p>
      <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{detail}</p>
    </div>
  );
}

/**
 * Règles de gamification N20 — transparence solde, usages et badges.
 */
export function N20GamificationRulesCard() {
  return (
    <Card
      className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-violet-100/80"
      data-testid="n20-gamification-rules-card"
    >
      <h3
        className="font-bold text-slate-700 mb-4 flex items-center gap-2"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        <Medal className="w-5 h-5 text-violet-600" aria-hidden="true" />
        Règles de la communauté & Badges N20
      </h3>

      <div className="space-y-5">
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-violet-700 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Actions rémunératrices
          </h4>
          <ul className="space-y-3">
            <RuleItem
              icon={UserPlus}
              iconClass="bg-pink-100 text-pink-600"
              title="Parrainage d'amies"
            >
              <span className="inline-flex flex-wrap items-center gap-1">
                <N20Amount value={5} size={14} showSign className="inline-flex" /> par filleule
                accueillie via votre lien (bonus tirelire + solde cadeaux pour les marraines).
              </span>
            </RuleItem>
            <RuleItem
              icon={HandHeart}
              iconClass="bg-purple-100 text-purple-600"
              title="Contribution & partage solidaire"
            >
              Partages validés (scanner alimentaire, conseils, Relais Maman) comptent pour vos badges
              et la contribution N20 inter-services de l&apos;écosystème MamanDouce / NeriaCorp.
            </RuleItem>
            <RuleItem
              icon={UserCheck}
              iconClass="bg-emerald-100 text-emerald-600"
              title="Complétion de profil"
            >
              Profil complété = intégration communauté accélérée et accès aux programmes de
              reconnaissance N20.
            </RuleItem>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-rose-700 mb-3 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
            Utilisation du solde N20
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>
                Déduction sur le <strong className="text-slate-700">Pack Premium</strong> (
                <N20Amount value={30} size={12} className="inline-flex" />).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>
                Déduction sur l&apos;espace <strong className="text-slate-700">Post-partum</strong> (
                <N20Amount value={10} size={12} className="inline-flex" />).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 mt-0.5">•</span>
              <span>
                Services partenaires de l&apos;écosystème (invitations, cadeaux marraine, offres
                NeriaCorp inter-applications).
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            Système de badges
          </h4>
          <p className="text-sm text-slate-500 mb-3 leading-relaxed">
            Chaque contribution et parrainage débloque des statuts et avantages au fil de votre
            parcours N20.
          </p>
          <div className="flex justify-center gap-4 sm:gap-6">
            <BadgeTier
              icon={Award}
              label="Bronze"
              detail="3 contributions"
              unlockedClass="bg-gradient-to-br from-amber-600 to-amber-700"
              lockedClass="text-amber-800"
            />
            <BadgeTier
              icon={Award}
              label="Argent"
              detail="2 contributions + 1 parrainage"
              unlockedClass="bg-gradient-to-br from-slate-400 to-slate-500"
              lockedClass="text-slate-600"
            />
            <BadgeTier
              icon={Crown}
              label="Or"
              detail="5 contributions + 3 parrainages"
              unlockedClass="bg-gradient-to-br from-yellow-400 to-yellow-600"
              lockedClass="text-yellow-700"
            />
          </div>
        </section>
      </div>
    </Card>
  );
}
