import { useState } from 'react';
import { Card } from './ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CollapsibleCard({ 
  title, 
  icon: Icon, 
  iconBg = 'bg-pink-100',
  iconColor = 'text-pink-600',
  children, 
  defaultOpen = false,
  badge = null,
  subtitle = null,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={`bg-white rounded-3xl shadow-sm overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
        data-testid={`collapsible-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {Icon && (
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-700">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full font-medium">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isOpen ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'
        }`}>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
          {children}
          
          {/* Bouton fermer en bas */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all duration-200 text-slate-600"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Fermer</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
