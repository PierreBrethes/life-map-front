import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useCategories, useDependencies } from '../../hooks/useLifeMapData';
import { useLifeMapMutations } from '../../hooks/useLifeMapMutations';
import { LifeItem, Dependency, Category, LinkType } from '../../types';
import { useStore } from '../../store/useStore';

interface DependenciesWidgetProps {
  itemId: string;
  categoryName: string;
  isDark: boolean;
}

// Link type configuration
const LINK_TYPE_CONFIG: Record<LinkType, { label: string; icon: keyof typeof Icons; color: string }> = {
  insurance: { label: 'Assurance', icon: 'Shield', color: '#10b981' },
  subscription: { label: 'Abonnement', icon: 'RefreshCw', color: '#8b5cf6' },
  payment: { label: 'Paiement', icon: 'CreditCard', color: '#f59e0b' },
  maintenance: { label: 'Entretien', icon: 'Wrench', color: '#6366f1' },
  ownership: { label: 'Propriété', icon: 'Key', color: '#ec4899' },
  other: { label: 'Autre', icon: 'Link', color: '#64748b' },
};

const DependenciesWidget: React.FC<DependenciesWidgetProps> = ({
  itemId,
  categoryName,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('outgoing');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDep, setEditingDep] = useState<Dependency | null>(null);

  // Data Loading
  const { data: dependencies = [] } = useDependencies();
  const { data: categories = [] } = useCategories();
  const { deleteDependency, updateDependency } = useLifeMapMutations();
  const { startConnection } = useStore();

  // Filter dependencies
  const incoming = useMemo(() => dependencies.filter(d => d.toItemId === itemId), [dependencies, itemId]);
  const outgoing = useMemo(() => dependencies.filter(d => d.fromItemId === itemId), [dependencies, itemId]);

  const currentList = activeTab === 'incoming' ? incoming : outgoing;

  // Get all items for linking
  const allItems = useMemo(() => {
    const items: { item: LifeItem; category: Category }[] = [];
    categories.forEach(cat => {
      cat.items.forEach(item => {
        items.push({ item, category: cat });
      });
    });
    return items;
  }, [categories]);

  // Helpers to resolve items
  const resolveItem = (dep: Dependency) => {
    const isIncoming = activeTab === 'incoming';
    const targetCatId = isIncoming ? dep.fromCategoryId : dep.toCategoryId;
    const targetItemId = isIncoming ? dep.fromItemId : dep.toItemId;

    const cat = categories.find(c => c.id === targetCatId);
    const item = cat?.items.find(i => i.id === targetItemId);

    return { cat, item };
  };

  const resolveLinkedItem = (linkedItemId: string | undefined) => {
    if (!linkedItemId) return null;
    for (const cat of categories) {
      const item = cat.items.find(i => i.id === linkedItemId);
      if (item) return { item, category: cat };
    }
    return null;
  };

  const handleCreateConnection = () => {
    const cat = categories.find(c => c.name === categoryName);
    const item = cat?.items.find(i => i.id === itemId);

    if (item) {
      startConnection({ categoryName, item });
    }
  };

  const handleUpdateDependency = async (depId: string, updates: Partial<Dependency>) => {
    await updateDependency.mutateAsync({ id: depId, data: updates });
    setEditingDep(null);
  };

  // Theme
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputClass = isDark
    ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500'
    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400';

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
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'outgoing'
                ? isDark ? 'bg-slate-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                : textSecondary
                }`}
            >
              <Icons.ArrowRight size={12} />
              Impacte ({outgoing.length})
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'incoming'
                ? isDark ? 'bg-slate-600 text-white' : 'bg-white text-gray-900 shadow-sm'
                : textSecondary
                }`}
            >
              <Icons.ArrowLeft size={12} />
              Dépend de ({incoming.length})
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {currentList.length > 0 ? (
              <div className="divide-y divide-slate-700/30">
                {currentList.map(dep => {
                  const { cat, item } = resolveItem(dep);
                  if (!item) return null;

                  const linkedItem = resolveLinkedItem(dep.linkedItemId);
                  const linkConfig = LINK_TYPE_CONFIG[dep.linkType || 'other'];
                  const IconComponent = Icons[linkConfig.icon] as React.FC<{ size?: number; className?: string }>;

                  return (
                    <div
                      key={dep.id}
                      className={`px-4 py-3 group transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}
                    >
                      {/* Main row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Direction indicator */}
                          <div className={`flex items-center ${textSecondary}`}>
                            {activeTab === 'outgoing' ? (
                              <Icons.ArrowRight size={14} />
                            ) : (
                              <Icons.ArrowLeft size={14} />
                            )}
                          </div>

                          {/* Target item */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: cat?.color || '#94a3b8' }}
                          >
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>{item.name}</p>
                            <p className={`text-[10px] ${textSecondary}`}>
                              {cat?.name || 'Catégorie inconnue'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingDep(editingDep?.id === dep.id ? null : dep)}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-gray-200 text-gray-400'}`}
                            title="Modifier"
                          >
                            <Icons.Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Supprimer ce lien ?')) deleteDependency.mutate(dep.id);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-slate-600 text-slate-400 hover:text-red-400' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
                            title="Supprimer le lien"
                          >
                            <Icons.Unlink size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Link metadata (always visible if present) */}
                      {(dep.description || dep.linkType || linkedItem) && (
                        <div className={`mt-2 ml-11 flex flex-wrap items-center gap-2`}>
                          {/* Link type badge */}
                          {dep.linkType && dep.linkType !== 'other' && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                              style={{ backgroundColor: linkConfig.color }}
                            >
                              <IconComponent size={10} />
                              {linkConfig.label}
                            </span>
                          )}

                          {/* Linked item badge */}
                          {linkedItem && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{
                                backgroundColor: linkedItem.category.color + '30',
                                color: isDark ? '#fff' : linkedItem.category.color
                              }}
                            >
                              <Icons.FileText size={10} />
                              {linkedItem.item.name}
                            </span>
                          )}

                          {/* Description */}
                          {dep.description && (
                            <span className={`text-[11px] italic ${textSecondary}`}>
                              "{dep.description}"
                            </span>
                          )}
                        </div>
                      )}

                      {/* Edit form */}
                      {editingDep?.id === dep.id && (
                        <EditDependencyForm
                          dependency={dep}
                          allItems={allItems}
                          isDark={isDark}
                          inputClass={inputClass}
                          textPrimary={textPrimary}
                          textSecondary={textSecondary}
                          onSave={(updates) => handleUpdateDependency(dep.id, updates)}
                          onCancel={() => setEditingDep(null)}
                        />
                      )}
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
              className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Icons.Plus size={14} />
              Créer une connexion
            </button>
            <p className={`text-[10px] text-center mt-2 ${textSecondary}`}>
              Cliquez sur un autre bloc dans la vue 3D pour créer le lien
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for editing dependency metadata
interface EditDependencyFormProps {
  dependency: Dependency;
  allItems: { item: LifeItem; category: Category }[];
  isDark: boolean;
  inputClass: string;
  textPrimary: string;
  textSecondary: string;
  onSave: (updates: Partial<Dependency>) => void;
  onCancel: () => void;
}

const EditDependencyForm: React.FC<EditDependencyFormProps> = ({
  dependency,
  allItems,
  isDark,
  inputClass,
  textPrimary,
  textSecondary,
  onSave,
  onCancel
}) => {
  const [description, setDescription] = useState(dependency.description || '');
  const [linkType, setLinkType] = useState<LinkType>(dependency.linkType || 'other');
  const [linkedItemId, setLinkedItemId] = useState(dependency.linkedItemId || '');

  return (
    <div className={`mt-3 ml-11 p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
      {/* Description */}
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Assurance auto, Prélèvement mensuel..."
          className={`w-full px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
        />
      </div>

      {/* Link Type */}
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>
          Type de lien
        </label>
        <select
          value={linkType}
          onChange={(e) => setLinkType(e.target.value as LinkType)}
          className={`w-full px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
        >
          {Object.entries(LINK_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Linked Item */}
      <div className="mb-3">
        <label className={`block text-xs font-medium mb-1 ${textSecondary}`}>
          Item associé (optionnel)
        </label>
        <select
          value={linkedItemId}
          onChange={(e) => setLinkedItemId(e.target.value)}
          className={`w-full px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
        >
          <option value="">— Aucun —</option>
          {allItems.map(({ item, category }) => (
            <option key={item.id} value={item.id}>
              {category.name} → {item.name}
            </option>
          ))}
        </select>
        <p className={`text-[10px] mt-1 ${textSecondary}`}>
          Ex: Sélectionnez un abonnement ou une assurance qui représente ce lien
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onSave({
            description: description || undefined,
            linkType,
            linkedItemId: linkedItemId || undefined
          })}
          className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default DependenciesWidget;
