import { useState } from 'react';
import { Card } from '../ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badge = null,
  iconBg = 'bg-gradient-to-br from-slate-100 to-slate-200',
  iconColor = 'text-slate-600',
  'data-testid': dataTestId
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden" data-testid={dataTestId}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        data-testid={dataTestId ? `${dataTestId}-header` : undefined}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-700">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-slate-100 pt-4">
          {children}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="w-full p-3 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all duration-200 text-slate-600"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      )}
    </Card>
  );
}
