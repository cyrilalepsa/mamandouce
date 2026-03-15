import { Card } from '../ui/card';
import { User, Mail, Calendar } from 'lucide-react';

export function UserInfoCard({ user, formatDate }) {
  return (
    <Card className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100" data-testid="user-info-card">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-300 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: 'Nunito, sans-serif' }}>{user?.name}</h2>
          <p className="text-slate-500">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
          <Mail className="w-5 h-5 text-sky-500" />
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-semibold text-slate-700">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
          <Calendar className="w-5 h-5 text-pink-500" />
          <div>
            <p className="text-xs text-slate-500">Membre depuis</p>
            <p className="font-semibold text-slate-700">{formatDate(user?.created_at)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
