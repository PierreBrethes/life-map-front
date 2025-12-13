import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCategories, useSettings } from '../hooks/useLifeMapData';
import { useLifeMapMutations } from '../hooks/useLifeMapMutations';

const DeleteIslandModal: React.FC = () => {
  const { pendingDeleteIsland, setPendingDeleteIsland } = useStore();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const { deleteCategory, updateItem, deleteItem } = useLifeMapMutations();

  const [confirmName, setConfirmName] = useState('');
  const [deleteMode, setDeleteMode] = useState<'move' | 'delete'>('move');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const isDark = settings?.theme === 'dark';

  // Find the category to delete
  const categoryToDelete = categories.find(c => c.id === pendingDeleteIsland?.id);

  // Get other categories for move option
  const otherCategories = categories.filter(c => c.id !== pendingDeleteIsland?.id);

  // Set default target category
  useEffect(() => {
    if (otherCategories.length > 0 && !targetCategoryId) {
      setTargetCategoryId(otherCategories[0].id);
    }
  }, [otherCategories, targetCategoryId]);

  // Reset state when modal opens
  useEffect(() => {
    if (pendingDeleteIsland) {
      setConfirmName('');
      setDeleteMode(pendingDeleteIsland.itemCount > 0 ? 'move' : 'delete');
      setError(null);
    }
  }, [pendingDeleteIsland]);

  if (!pendingDeleteIsland || !categoryToDelete) return null;

  const canConfirm = confirmName.toLowerCase() === pendingDeleteIsland.name.toLowerCase();
  const hasItems = pendingDeleteIsland.itemCount > 0;

  const handleConfirmDelete = async () => {
    if (!canConfirm) return;

    try {
      if (hasItems) {
        if (deleteMode === 'move' && targetCategoryId) {
          // Move all items to the target category
          await Promise.all(
            categoryToDelete.items.map(item =>
              updateItem.mutateAsync({
                id: item.id,
                payload: { categoryId: targetCategoryId }
              })
            )
          );
        } else if (deleteMode === 'delete') {
          // Delete all items manually
          await Promise.all(
            categoryToDelete.items.map(item => deleteItem.mutateAsync(item.id))
          );
        }
      }
      // Note: If deleteMode is 'delete', we assume the backend cascades the deletion
      // or handles orphaned items. Otherwise, items should be deleted first.

      // Delete the category
      await deleteCategory.mutateAsync(pendingDeleteIsland.id);

      setPendingDeleteIsland(null);
    } catch (error: any) {
      console.error('Error deleting island:', error);
      setError(error.message || "Une erreur est survenue lors de la suppression.");
    }
  };

  const glassPanelClass = isDark
    ? "bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white"
    : "bg-white/95 backdrop-blur-xl border-gray-200 text-gray-800";

  const inputClass = isDark
    ? "bg-slate-800/50 border-slate-700 focus:border-red-400 text-white placeholder-slate-500"
    : "bg-white border-gray-200 focus:border-red-400 text-gray-700 placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-6 m-4 ring-1 transform animate-in zoom-in-95 ${glassPanelClass} ${isDark ? 'ring-slate-700' : 'ring-black/5'
          }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-red-500/20">
            <Icons.AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Supprimer l'île
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Cette action est irréversible
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
            <Icons.XCircle size={16} />
            {error}
          </div>
        )}

        {/* Island Info */}
        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: categoryToDelete.color }}
            />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pendingDeleteIsland.name}
            </span>
          </div>
          {hasItems && (
            <p className={`mt-2 text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              <Icons.AlertCircle size={14} className="inline mr-1" />
              Cette île contient {pendingDeleteIsland.itemCount} bloc(s)
            </p>
          )}
        </div>

        {/* Item Handling Options (only if has items) */}
        {hasItems && (
          <div className="mb-6 space-y-3">
            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Que faire des blocs ?
            </p>

            {/* Move option */}
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${deleteMode === 'move'
              ? isDark ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-500 bg-indigo-50'
              : isDark ? 'border-slate-700 hover:border-slate-600' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === 'move'}
                onChange={() => setDeleteMode('move')}
                className="mt-1"
              />
              <div className="flex-1">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Déplacer vers une autre île
                </p>
                {deleteMode === 'move' && otherCategories.length > 0 && (
                  <select
                    value={targetCategoryId}
                    onChange={(e) => setTargetCategoryId(e.target.value)}
                    className={`mt-2 w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                  >
                    {otherCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.items.length} blocs)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </label>

            {/* Delete option */}
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${deleteMode === 'delete'
              ? isDark ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50'
              : isDark ? 'border-slate-700 hover:border-slate-600' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === 'delete'}
                onChange={() => setDeleteMode('delete')}
                className="mt-1"
              />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Supprimer tous les blocs
                </p>
                <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  ⚠️ Les blocs seront définitivement supprimés
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            Tapez "<span className="font-bold">{pendingDeleteIsland.name}</span>" pour confirmer
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={pendingDeleteIsland.name}
            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 ${inputClass}`}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setPendingDeleteIsland(null)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={!canConfirm || deleteCategory.isPending}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${canConfirm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-red-500/30 text-red-300 cursor-not-allowed'
              }`}
          >
            {deleteCategory.isPending ? (
              <Icons.Loader2 size={16} className="animate-spin" />
            ) : (
              <Icons.Trash2 size={16} />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteIslandModal;
