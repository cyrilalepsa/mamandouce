import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Apple, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

export function FoodsTab({ pendingFoods, foodStats, loadPendingFoods }) {
  const handleFoodAction = async (foodId, action) => {
    try {
      await api.admin.updateFoodStatus(foodId, action);
      toast.success(action === 'approved' ? 'Aliment approuvé !' : 'Aliment rejeté');
      loadPendingFoods();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white rounded-2xl p-4 text-center">
          <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-600">{foodStats.pending}</p>
          <p className="text-xs text-slate-500">En attente</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{foodStats.approved}</p>
          <p className="text-xs text-slate-500">Approuvés</p>
        </Card>
        <Card className="bg-white rounded-2xl p-4 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{foodStats.rejected}</p>
          <p className="text-xs text-slate-500">Rejetés</p>
        </Card>
      </div>

      {/* Pending Foods */}
      <Card className="bg-white rounded-3xl p-6">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Aliments proposés</h3>
        {pendingFoods.length === 0 ? (
          <div className="text-center py-8">
            <Apple className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun aliment en attente de validation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingFoods.map((food, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-700">{food.name}</h4>
                  <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    {food.category && <span>📁 {food.category}</span>}
                    {food.barcode && <span>📊 {food.barcode}</span>}
                  </div>
                  {food.notes && <p className="text-xs text-slate-400 mt-1 italic">{food.notes}</p>}
                  <p className="text-xs text-slate-400 mt-1">Proposé par: {food.user_email || 'Anonyme'}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFoodAction(food.id, 'approved')}
                    className="bg-green-500 text-white rounded-lg px-3 py-2 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleFoodAction(food.id, 'rejected')}
                    className="bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
