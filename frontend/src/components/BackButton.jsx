import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useBackNavigation } from '../hooks/useBackNavigation';

/**
 * Bouton retour réutilisable — onBack > backPath > navigate(-1).
 */
export function BackButton({
  onBack,
  backPath,
  className = 'p-2 rounded-full hover:bg-white/50',
  iconClassName = 'w-6 h-6 text-slate-600',
  variant = 'ghost',
  testId = 'back-button',
  ...props
}) {
  const handleBack = useBackNavigation({ onBack, backPath });

  return (
    <Button
      type="button"
      onClick={handleBack}
      variant={variant}
      className={className}
      data-testid={testId}
      {...props}
    >
      <ArrowLeft className={iconClassName} />
    </Button>
  );
}

export default BackButton;
