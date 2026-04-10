import { User, Mail, Calendar } from 'lucide-react';

export function UserInfoCard({ user, formatDate }) {
  return (
    <div 
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.95) 30%, rgba(186,230,253,0.85) 70%, rgba(125,211,252,0.75) 100%)',
        boxShadow: '0 6px 16px -4px rgba(14,165,233,0.2), 0 3px 6px -2px rgba(14,165,233,0.1), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(14,165,233,0.08)'
      }}
      data-testid="user-info-card"
    >
      {/* Effet de reflet bombé */}
      <div 
        className="absolute top-0 left-2 right-2 h-2/5 rounded-t-2xl pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)' }}
      />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-sky-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <User className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
          >
            <Mail className="w-4 h-4 text-sky-500" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-semibold text-sm text-slate-700">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)' }}
          >
            <Calendar className="w-4 h-4 text-pink-500" />
            <div>
              <p className="text-xs text-slate-500">Membre depuis</p>
              <p className="font-semibold text-sm text-slate-700">{formatDate(user?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
