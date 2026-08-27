import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { CPAM_MATERNITY_GAP_GUIDANCE } from '../../utils/maternityLeave';

export function CpamDateGapInfo({ className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900 underline-offset-2 hover:underline ${className}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            data-testid="maternity-cpam-gap-info"
          >
            <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Pourquoi un écart ?
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          className="max-w-[min(18rem,calc(100vw-2rem))] text-xs leading-relaxed bg-violet-900 text-white border-0 px-3 py-2"
        >
          {CPAM_MATERNITY_GAP_GUIDANCE}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
