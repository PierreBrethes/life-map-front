import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem } from '../../types';

interface GarageStatCardsProps {
  nextDeadline: { days: number; severity: string; name: string } | null;
  item: LifeItem;
  onUpdateItem: (updates: Partial<LifeItem>) => void;
  isDark: boolean;
}

const GarageStatCards: React.FC<GarageStatCardsProps> = ({ nextDeadline, item, onUpdateItem, isDark }) => {
  const [isEditingMileage, setIsEditingMileage] = useState(false);
  const [editMileage, setEditMileage] = useState(item.mileage?.toString() || '');

  // Sync edit state with item
  useEffect(() => {
    setEditMileage(item.mileage?.toString() || '');
  }, [item.mileage]);

  const handleSaveMileage = () => {
    const mileage = parseInt(editMileage) || undefined;
    onUpdateItem({ mileage });
    setIsEditingMileage(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveMileage();
    if (e.key === 'Escape') {
      setEditMileage(item.mileage?.toString() || '');
      setIsEditingMileage(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Prochaines Échéances Card */}
      <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="flex items-center gap-1.5 mb-2 text-violet-200">
          <Icons.Calendar size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Prochaines Échéances</span>
        </div>
        <div className="text-3xl font-bold text-white">
          {nextDeadline ? nextDeadline.days : '—'}
          {nextDeadline && <span className="text-sm font-medium ml-1 opacity-80">jours</span>}
        </div>
        {nextDeadline && (
          <div className="text-[10px] text-violet-200 mt-1 truncate">
            {nextDeadline.name}
          </div>
        )}
        {!nextDeadline && (
          <div className="text-[10px] text-violet-200 mt-1">
            Ajouter une alerte avec date
          </div>
        )}
      </div>

      {/* Kilométrage Card - Editable */}
      <div
        className={`flex-1 p-4 rounded-2xl cursor-pointer transition-all ${isEditingMileage ? 'ring-2 ring-sky-400' : 'hover:ring-1 hover:ring-white/20'
          } ${isDark ? 'bg-slate-800/80' : 'bg-slate-700/90'}`}
        onClick={() => !isEditingMileage && setIsEditingMileage(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Icons.Gauge size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Kilométrage</span>
          </div>
          {!isEditingMileage && <Icons.Pencil size={10} className="text-slate-500" />}
        </div>

        {isEditingMileage ? (
          <div className="space-y-2">
            <input
              type="number"
              value={editMileage}
              onChange={(e) => setEditMileage(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveMileage}
              placeholder="125000"
              className="w-full px-2 py-1 rounded-lg text-xl font-bold bg-slate-600/50 text-white placeholder-slate-400 border border-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              autoFocus
            />
            <div className="text-[10px] text-slate-400">Appuyer sur Entrée pour valider</div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-white">
              {item.mileage ? item.mileage.toLocaleString('fr-FR') : '—'}
              <span className="text-sm font-medium ml-1 opacity-80">km</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Cliquer pour modifier
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GarageStatCards;
