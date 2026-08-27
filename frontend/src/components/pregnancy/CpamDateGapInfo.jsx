import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CPAM_MATERNITY_GAP_GUIDANCE } from '../../utils/maternityLeave';

export function CpamDateGapInfo({ className = '' }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:text-violet-900 underline-offset-2 hover:underline ${className}`}
          data-testid="maternity-cpam-gap-info"
        >
          <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Pourquoi un écart ?
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        animation="fade"
        className="max-w-[min(18rem,calc(100vw-2rem))] w-auto text-xs leading-relaxed bg-slate-900 text-white border-0 shadow-xl rounded-xl p-3"
        data-testid="maternity-cpam-gap-popover"
      >
        {CPAM_MATERNITY_GAP_GUIDANCE}
      </PopoverContent>
    </Popover>
  );
}
