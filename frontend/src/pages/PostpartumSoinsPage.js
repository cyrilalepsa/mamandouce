import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Baby, Moon, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const SOINS_ITEMS = [
  { 
    id: 'diapers', 
    icon: '😴', 
    title: 'Coucher et change', 
    desc: 'Sommeil, couches, soins',
    color: 'from-indigo-400 to-violet-500',
    bgColor: 'bg-indigo-50',
    route: '/postpartum/soins/coucher-change'
  },
  { 
    id: 'babywearing', 
    icon: '🤱', 
    title: 'Portage', 
    desc: 'Écharpes, porte-bébé, positions',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-rose-50',
    route: '/postpartum/soins/portage'
  },
];

export default function PostpartumSoinsPage() {
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
            <h1 className="text-2xl font-bold text-slate-700">Soins quotidiens</h1>
            <p className="text-sm text-slate-500">Coucher, change, portage</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Grille de cartes 2 colonnes */}
        <div className="grid grid-cols-2 gap-3">
          {SOINS_ITEMS.map((item) => (
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
