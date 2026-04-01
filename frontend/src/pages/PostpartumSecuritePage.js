import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const SECURITE_ITEMS = [
  { 
    id: 'difficulties', 
    icon: '💭', 
    title: 'Difficultés rencontrées', 
    desc: 'Baby blues, fatigue, solutions',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    route: '/postpartum/securite/difficultes'
  },
  { 
    id: 'precautions', 
    icon: '🛡️', 
    title: 'Précautions et sécurité', 
    desc: 'Gestes à éviter, vigilance',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    route: '/postpartum/securite/precautions'
  },
];

export default function PostpartumSecuritePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/section/postpartum')}
            variant="ghost"
            className="p-2 rounded-full hover:bg-white/50"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-700">Sécurité</h1>
            <p className="text-sm text-slate-500">Difficultés, précautions</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Grille de cartes 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {SECURITE_ITEMS.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(item.route)}
              className={`${item.bgColor} rounded-2xl p-4 border-0 cursor-pointer hover:shadow-lg transition-all active:scale-95`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-700 text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {item.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
