import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Crown } from 'lucide-react';

export function TopBar({ isAdmin }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end items-center">
      <Button
        onClick={() => navigate('/pricing')}
        data-testid="premium-button"
        className="bg-gradient-to-r from-amber-400 to-amber-300 text-white rounded-full px-4 py-2 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        title="Premium"
      >
        <Crown className="w-4 h-4" />
        <span className="text-sm font-semibold">Premium</span>
      </Button>
    </div>
  );
}
