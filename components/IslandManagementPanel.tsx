import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCategories, useSettings } from '../hooks/useLifeMapData';
import { useLifeMapMutations } from '../hooks/useLifeMapMutations';
import { Category } from '../types';

const IslandManagementPanel: React.FC = () => {
  const { islandManagementOpen, setIslandManagementOpen, setPendingDeleteIsland } = useStore();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const { updateCategory } = useLifeMapMutations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const isDark = settings?.theme === 'dark';

  if (!islandManagementOpen) return null;

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;

    await updateCategory.mutateAsync({
      id: editingId,
      payload: { name: editName.trim(), color: editColor }
    });

    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = (category: Category) => {
    setPendingDeleteIsland({
      id: category.id,
      name: category.name,
      itemCount: category.items.length
    });
  };

  const glassPanelClass = isDark
    ? "bg-slate-900/95 backdrop-blur-xl border-slate-700/50"
    : "bg-white/95 backdrop-blur-xl border-gray-200";

  const inputClass = isDark
    ? "bg-slate-800/50 border-slate-700 focus:border-indigo-400 text-white"
    : "bg-white border-gray-200 focus:border-indigo-400 text-gray-700";

  // Preset colors
  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setIslandManagementOpen(false)}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-md h-full border-r shadow-2xl animate-in slide-in-from-left duration-300 ${glassPanelClass}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <Icons.Layers size={24} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Gérer mes îles
            </h2>
          </div>
          <button
            onClick={() => setIslandManagementOpen(false)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {categories.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <Icons.Layers size={48} className="mx-auto mb-4 opacity-30" />
              <p>Aucune île créée</p>
            </div>
          ) : (
            categories.map(category => (
              <div
                key={category.id}
                className={`rounded-xl border p-4 transition-colors ${isDark
                  ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
              >
                {editingId === category.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${inputClass}`}
                      placeholder="Nom de l'île"
                      autoFocus
                    />

                    {/* Color Picker */}
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${editColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                            }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim() || updateCategory.isPending}
                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        {updateCategory.isPending ? (
                          <Icons.Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Icons.Check size={14} />
                        )}
                        Enregistrer
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {category.items.length} bloc{category.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(category)}
                        className={`p-2 rounded-lg transition-colors ${isDark
                          ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                          : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
                          }`}
                        title="Modifier"
                      >
                        <Icons.Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className={`p-2 rounded-lg transition-colors ${isDark
                          ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          }`}
                        title="Supprimer"
                      >
                        <Icons.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            Clic droit sur une île pour accéder au menu contextuel
          </p>
        </div>
      </div>
    </div>
  );
};

export default IslandManagementPanel;
