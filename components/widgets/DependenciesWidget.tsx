import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useCategories, useDependencies } from '../../hooks/useLifeMapData';
import { useLifeMapMutations } from '../../hooks/useLifeMapMutations';
import { LifeItem, Dependency } from '../../types';
import { useStore } from '../../store/useStore';

interface DependenciesWidgetProps {
  itemId: string;
  categoryName: string;
  isDark: boolean;
}

const DependenciesWidget: React.FC<DependenciesWidgetProps> = ({
  itemId,
  categoryName,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('outgoing');
  const [isExpanded, setIsExpanded] = useState(false);

  // Data Loading
  const { data: dependencies = [] } = useDependencies();
  const { data: categories = [] } = useCategories();
  const { deleteDependency } = useLifeMapMutations();
  const { startConnection, selectDependency } = useStore();

  // Filter dependencies
  const incoming = useMemo(() => dependencies.filter(d => d.toItemId === itemId), [dependencies, itemId]);
  const outgoing = useMemo(() => dependencies.filter(d => d.fromItemId === itemId), [dependencies, itemId]);

  const currentList = activeTab === 'incoming' ? incoming : outgoing;

  // Helpers to resolve items
  const resolveItem = (dep: Dependency) => {
    const isIncoming = activeTab === 'incoming';
    const targetCatId = isIncoming ? dep.fromCategoryId : dep.toCategoryId;
    const targetItemId = isIncoming ? dep.fromItemId : dep.toItemId;

    const cat = categories.find(c => c.id === targetCatId);
    const item = cat?.items.find(i => i.id === targetItemId);

    return { cat, item };
  };

  const handleCreateConnection = () => {
    // If outgoing, we start from THIS item
    // If incoming, logic is trickier strictly from UI perspective, but usually 'Connect' means 'Connect FROM here'
    // Let's assume standard 'Start Connection' means 'This item -> Target'
    // If user wants incoming, they should go to the other item? Or we support reverse?
    // Standard flow: Start connection from this item.
    const cat = categories.find(c => c.name === categoryName);
    const item = cat?.items.find(i => i.id === itemId);
    
    if (item) {
        startConnection({ categoryName, item });
    }
  };

  // Theme
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Icons.Link size={16} className="text-blue-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Connexions</p>
            <p className={`text-xs ${textSecondary}`}>
              {incoming.length} entrants • {outgoing.length} sortants
            </p>
          </div>
        </div>
        <Icons.ChevronDown
          size={16}
          className={`transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          {/* Tabs */}
          <div className={`px-4 py-2 flex gap-1 ${isDark ? 'bg-slate-700/20' : 'bg-gray-50'}`}>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'outgoing'
                  ? isDark ? 'bg-slate-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                  : textSecondary
                }`}
            >
              Impacte ({outgoing.length})
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === 'incoming'
                  ? isDark ? 'bg-slate-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                  : textSecondary
                }`}
            >
              Dépend de ({incoming.length})
            </button>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {currentList.length > 0 ? (
              <div className="divide-y divide-slate-700/30">
                {currentList.map(dep => {
                  const { cat, item } = resolveItem(dep);
                  if (!item) return null; // Should clean up invalid dependencies eventually

                  return (
                    <div
                      key={dep.id}
                      className={`px-4 py-3 flex items-center justify-between group transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}
                      onClick={() => selectDependency(dep.id)} // Select logic for graph visualization?
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: cat?.color || '#94a3b8' }}
                        >
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${textPrimary}`}>{item.name}</p>
                          <p className={`text-[10px] ${textSecondary}`}>
                             {activeTab === 'incoming' ? 'Source' : 'Cible'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Supprimer ce lien ?')) deleteDependency.mutate(dep.id);
                        }}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-slate-600 text-slate-400 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
                        title="Supprimer le lien"
                      >
                        <Icons.Unlink size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
                <div className="px-4 py-6 text-center">
                    <Icons.Link2Off size={24} className={`mx-auto mb-2 ${textSecondary}`} />
                    <p className={`text-sm ${textSecondary}`}>
                        Aucune connexion {activeTab === 'incoming' ? 'entrante' : 'sortante'}
                    </p>
                </div>
            )}
          </div>

          {/* Footer Action */}
          <div className={`p-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
            <button 
                onClick={handleCreateConnection}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                  isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                <Icons.Plus size={14} />
                Créer une connexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependenciesWidget;
