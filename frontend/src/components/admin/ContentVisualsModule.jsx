import { useState } from 'react';
import { Layers } from 'lucide-react';
import FetusVisualsTab from './FetusVisualsTab';
import AppBannersTab from './AppBannersTab';
import LegalContentTab from './LegalContentTab';

const MODULE_TABS = [
  { id: 'fetus', label: 'Visuels Fœtus' },
  { id: 'banners', label: 'Images & Bannières App' },
  { id: 'legal', label: 'Informations & Textes Légaux' },
];

export default function ContentVisualsModule() {
  const [activeTab, setActiveTab] = useState('fetus');

  return (
    <div className="w-full min-w-0 space-y-4" data-testid="content-visuals-module">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-pink-50 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <Layers className="h-6 w-6 shrink-0 text-violet-600" />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">
              Gestion des Contenus &amp; Visuels
            </h2>
            <p className="text-xs leading-relaxed text-slate-500">
              Fœtus, bannières d&apos;interface et textes légaux — centralisés pour le Cockpit.
            </p>
          </div>
        </div>
      </div>

      <div
        className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
        role="tablist"
        aria-label="Sections contenus et visuels"
        data-testid="content-visuals-module-tabs"
      >
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-bold min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-600'
            }`}
            data-testid={`content-visuals-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-w-0" role="tabpanel">
        {activeTab === 'fetus' && <FetusVisualsTab embedded />}
        {activeTab === 'banners' && <AppBannersTab />}
        {activeTab === 'legal' && <LegalContentTab />}
      </div>
    </div>
  );
}
