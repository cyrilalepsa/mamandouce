import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import GoldModerationPanel from '../components/GoldModerationPanel';

function ModerationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Modération
          </h1>
        </div>

        <GoldModerationPanel />
      </div>
    </div>
  );
}

export default ModerationPage;
