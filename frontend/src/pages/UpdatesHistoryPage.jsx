import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, Check, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { appUpdates } from '../data/appUpdates';

export default function UpdatesHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedVersion, setExpandedVersion] = useState(null);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'major':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'minor':
        return 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white';
      case 'patch':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'major': return t('updates.major');
      case 'minor': return t('updates.minor');
      case 'patch': return t('updates.patch');
      default: return t('updates.update');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-4 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{t('updates.title')}</h1>
            <p className="text-white/80 text-sm">{t('updates.subtitle')}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-white/20 rounded-2xl px-4 py-3 flex-1">
            <p className="text-3xl font-bold">{appUpdates.length}</p>
            <p className="text-white/80 text-sm">{t('updates.updates')}</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-3 flex-1">
            <p className="text-3xl font-bold">{appUpdates[0]?.version}</p>
            <p className="text-white/80 text-sm">{t('updates.currentVersion')}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-6">
        <div className="relative">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-300" />
          
          {appUpdates.map((update, index) => {
            const isExpanded = expandedVersion === update.version;
            const isLatest = index === 0;
            
            return (
              <div key={update.version} className="relative mb-6 last:mb-0">
                {/* Point sur la timeline */}
                <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-lg ${
                  isLatest 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500' 
                    : 'bg-slate-300'
                }`} />
                
                {/* Carte de la mise à jour */}
                <Card className={`ml-14 overflow-hidden transition-all duration-300 ${
                  isLatest ? 'border-2 border-purple-200 shadow-lg' : 'border border-slate-200'
                }`}>
                  {/* Header cliquable */}
                  <button
                    onClick={() => setExpandedVersion(isExpanded ? null : update.version)}
                    className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(update.type)}`}>
                            {getTypeLabel(update.type)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            v{update.version}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {t('updates.current')}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-slate-700 text-lg">{update.title}</h3>
                        
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(update.date)}
                        </p>
                      </div>
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isExpanded ? 'bg-purple-100' : 'bg-slate-100'
                      }`}>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {/* Contenu dépliable */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                      <p className="text-sm text-slate-600 mb-4">{update.description}</p>
                      
                      <ul className="space-y-2">
                        {update.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm text-slate-700">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Bouton fermer */}
                      <button
                        onClick={() => setExpandedVersion(null)}
                        className="w-full mt-4 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all duration-200 text-slate-600"
                      >
                        <ChevronUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{t('common.close')}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 py-6 border-t border-slate-200">
          <p className="text-slate-400 text-sm">
            {t('updates.footer')}
          </p>
          <p className="text-slate-300 text-xs mt-1">
            {t('updates.suggestions')}
          </p>
        </div>
      </div>
    </div>
  );
}
