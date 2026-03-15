import { Card } from '../ui/card';
import { Users, MessageSquare, Apple } from 'lucide-react';

export function DashboardTab({ globalStats, codeStats, setActiveTab, messageStats }) {
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.visits}</p>
          <p className="text-xs font-medium opacity-90">Visites</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.registrations || globalStats.users.total}</p>
          <p className="text-xs font-medium opacity-90">Inscrits</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.users.premium}</p>
          <p className="text-xs font-medium opacity-90">Premium</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-3 text-white">
          <p className="text-2xl font-bold">{globalStats.users.beta_tester}</p>
          <p className="text-xs font-medium opacity-90">Bêta</p>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white rounded-xl p-3 border-l-3 border-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Gratuits</p>
              <p className="text-lg font-bold text-slate-700">{globalStats.users.free}</p>
            </div>
            <Users className="w-4 h-4 text-slate-200" />
          </div>
        </Card>
        
        <Card 
          className="bg-white rounded-xl p-3 border-l-3 border-red-400 cursor-pointer hover:bg-red-50 transition-colors" 
          onClick={() => globalStats.unread_messages > 0 && setActiveTab('messages')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Non lus</p>
              <p className="text-lg font-bold text-red-600">{globalStats.unread_messages}</p>
            </div>
            <MessageSquare className="w-4 h-4 text-red-200" />
          </div>
        </Card>
        
        <Card 
          className="bg-white rounded-xl p-3 border-l-3 border-amber-400 cursor-pointer hover:bg-amber-50 transition-colors" 
          onClick={() => globalStats.pending_foods > 0 && setActiveTab('foods')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold">En attente</p>
              <p className="text-lg font-bold text-amber-600">{globalStats.pending_foods}</p>
            </div>
            <Apple className="w-4 h-4 text-amber-200" />
          </div>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Résumé</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-slate-700">{globalStats.users.total}</p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">
              {globalStats.users.total > 0 
                ? Math.round((globalStats.users.premium + globalStats.users.beta_tester) / globalStats.users.total * 100) 
                : 0}%
            </p>
            <p className="text-[10px] text-slate-500">Taux premium</p>
          </div>
          <div>
            <p className="text-xl font-bold text-sky-600">{codeStats.available}</p>
            <p className="text-[10px] text-slate-500">Codes dispo</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-600">{codeStats.used}</p>
            <p className="text-[10px] text-slate-500">Codes utilisés</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
