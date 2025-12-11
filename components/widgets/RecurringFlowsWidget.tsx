import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { RecurringTransaction } from '../../types';

type FilterTab = 'all' | 'income' | 'expense';

interface RecurringFlowsWidgetProps {
  recurring: RecurringTransaction[];
  onAddRecurring: (rec: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurring: (id: string, isActive: boolean) => void;
  targetAccountId: string;
  isDark: boolean;
}

// Category presets with visual styling
const CATEGORY_PRESETS = {
  salary: { label: 'Salaire', icon: 'Wallet', color: '#22c55e', defaultCategory: 'income' as const },
  rent: { label: 'Loyer', icon: 'Home', color: '#f97316', defaultCategory: 'expense' as const },
  insurance: { label: 'Assurance', icon: 'Shield', color: '#3b82f6', defaultCategory: 'expense' as const },
  subscription: { label: 'Abonnement', icon: 'CreditCard', color: '#6366f1', defaultCategory: 'expense' as const },
  custom: { label: 'Autre', icon: 'RefreshCw', color: '#8b5cf6', defaultCategory: 'expense' as const },
};

// Popular subscription presets
const SUBSCRIPTION_PRESETS = [
  { name: 'Netflix', icon: 'Tv', color: '#e50914', amount: 15.99 },
  { name: 'Spotify', icon: 'Music', color: '#1db954', amount: 9.99 },
  { name: 'Amazon Prime', icon: 'Package', color: '#ff9900', amount: 6.99 },
  { name: 'Disney+', icon: 'Clapperboard', color: '#113ccf', amount: 8.99 },
  { name: 'YouTube Premium', icon: 'Youtube', color: '#ff0000', amount: 12.99 },
  { name: 'Apple Music', icon: 'Apple', color: '#fc3c44', amount: 10.99 },
];

const RecurringFlowsWidget: React.FC<RecurringFlowsWidgetProps> = ({
  recurring,
  onAddRecurring,
  onDeleteRecurring,
  onToggleRecurring,
  targetAccountId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<RecurringTransaction['sourceType'] | null>(null);
  const [selectedSubscriptionPreset, setSelectedSubscriptionPreset] = useState<typeof SUBSCRIPTION_PRESETS[0] | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    dayOfMonth: new Date().getDate(),
    category: 'expense' as RecurringTransaction['category'],
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  // Filtered list based on active tab
  const filteredRecurring = useMemo(() => {
    if (activeTab === 'all') return recurring;
    return recurring.filter(r => r.category === activeTab);
  }, [recurring, activeTab]);

  // Calculate totals
  const totalIncome = recurring
    .filter(r => r.isActive && r.amount > 0)
    .reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = recurring
    .filter(r => r.isActive && r.amount < 0)
    .reduce((sum, r) => sum + Math.abs(r.amount), 0);
  const netMonthly = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getNextOccurrence = (dayOfMonth: number): string => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
    const next = today.getDate() < dayOfMonth ? thisMonth : nextMonth;
    return next.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getIcon = (iconName: string | undefined, size = 16) => {
    const IconComponent = (Icons as any)[iconName || 'RefreshCw'] || Icons.RefreshCw;
    return <IconComponent size={size} />;
  };

  const handleSelectSourceType = (type: RecurringTransaction['sourceType']) => {
    setSelectedSourceType(type);
    setSelectedSubscriptionPreset(null);
    const preset = CATEGORY_PRESETS[type];
    setFormData({
      label: type === 'subscription' ? '' : preset.label,
      amount: '',
      dayOfMonth: new Date().getDate(),
      category: preset.defaultCategory,
    });
  };

  const handleSelectSubscriptionPreset = (preset: typeof SUBSCRIPTION_PRESETS[0]) => {
    setSelectedSubscriptionPreset(preset);
    setFormData(prev => ({
      ...prev,
      label: preset.name,
      amount: preset.amount.toString(),
    }));
  };

  const handleAddRecurring = () => {
    const amount = parseFloat(formData.amount);
    if (!formData.label || isNaN(amount) || amount <= 0) return;
    if (!selectedSourceType) return;

    const preset = CATEGORY_PRESETS[selectedSourceType];
    const subPreset = selectedSubscriptionPreset;

    onAddRecurring({
      sourceType: selectedSourceType,
      targetAccountId,
      label: formData.label,
      amount: formData.category === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      dayOfMonth: formData.dayOfMonth,
      category: formData.category,
      isActive: true,
      startDate: Date.now(),
      icon: subPreset?.icon || preset.icon,
      color: subPreset?.color || preset.color,
    });

    // Reset form
    setFormData({ label: '', amount: '', dayOfMonth: new Date().getDate(), category: 'expense' });
    setSelectedSourceType(null);
    setSelectedSubscriptionPreset(null);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setSelectedSourceType(null);
    setSelectedSubscriptionPreset(null);
    setFormData({ label: '', amount: '', dayOfMonth: new Date().getDate(), category: 'expense' });
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Icons.RefreshCw size={16} className="text-violet-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Flux Récurrents</p>
            <p className={`text-xs ${textSecondary}`}>
              {recurring.filter(r => r.isActive).length} actifs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${netMonthly >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {netMonthly >= 0 ? '+' : ''}{formatCurrency(netMonthly)}/mois
          </span>
          <Icons.ChevronDown
            size={16}
            className={`transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          {/* Tabs */}
          <div className={`px-4 py-2 flex gap-1 ${isDark ? 'bg-slate-700/20' : 'bg-gray-50'}`}>
            {(['all', 'income', 'expense'] as FilterTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? isDark
                      ? 'bg-slate-600 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                    : textSecondary
                }`}
              >
                {tab === 'all' && 'Tous'}
                {tab === 'income' && (
                  <span className="flex items-center justify-center gap-1">
                    <Icons.TrendingUp size={12} className="text-emerald-500" /> Revenus
                  </span>
                )}
                {tab === 'expense' && (
                  <span className="flex items-center justify-center gap-1">
                    <Icons.TrendingDown size={12} className="text-red-400" /> Dépenses
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Summary Bar */}
          <div className={`px-4 py-2 flex justify-between text-xs border-b ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
            <span className="text-emerald-500">
              <Icons.TrendingUp size={12} className="inline mr-1" />
              {formatCurrency(totalIncome)}
            </span>
            <span className="text-red-400">
              <Icons.TrendingDown size={12} className="inline mr-1" />
              {formatCurrency(totalExpense)}
            </span>
          </div>

          {/* Recurring List */}
          {filteredRecurring.length > 0 ? (
            <div className="divide-y divide-slate-700/30 max-h-64 overflow-y-auto">
              {filteredRecurring.map(rec => {
                const color = rec.color || CATEGORY_PRESETS[rec.sourceType]?.color || '#6366f1';
                const icon = rec.icon || CATEGORY_PRESETS[rec.sourceType]?.icon || 'RefreshCw';
                return (
                  <div
                    key={rec.id}
                    className={`px-4 py-3 flex items-center justify-between ${
                      !rec.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <span style={{ color }}>{getIcon(icon, 16)}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{rec.label}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {rec.dayOfMonth} • {getNextOccurrence(rec.dayOfMonth)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${rec.amount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {rec.amount >= 0 ? '+' : ''}{formatCurrency(rec.amount)}
                      </span>

                      <button
                        onClick={() => onToggleRecurring(rec.id, !rec.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        {rec.isActive ? (
                          <Icons.ToggleRight size={18} className="text-emerald-500" />
                        ) : (
                          <Icons.ToggleLeft size={18} className={textSecondary} />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteRecurring(rec.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Icons.Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <Icons.RefreshCw size={24} className={`mx-auto mb-2 ${textSecondary}`} />
              <p className={`text-sm ${textSecondary}`}>
                {activeTab === 'all' ? 'Aucun flux récurrent' : activeTab === 'income' ? 'Aucun revenu' : 'Aucune dépense'}
              </p>
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 py-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              {/* Step 1: Select source type */}
              {!selectedSourceType && (
                <div className="space-y-2">
                  <p className={`text-xs font-medium ${textSecondary} mb-2`}>Type de flux</p>
                  <div className="grid grid-cols-5 gap-1">
                    {(Object.keys(CATEGORY_PRESETS) as RecurringTransaction['sourceType'][]).map(type => {
                      const preset = CATEGORY_PRESETS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => handleSelectSourceType(type)}
                          className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                            isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span style={{ color: preset.color }}>{getIcon(preset.icon, 18)}</span>
                          <span className={`text-[10px] ${textSecondary}`}>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={resetForm}
                    className={`w-full mt-2 py-2 rounded-lg text-xs font-medium ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* Step 2: Subscription presets (only for subscription type) */}
              {selectedSourceType === 'subscription' && !selectedSubscriptionPreset && !formData.label && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-medium ${textSecondary}`}>Choisir un abonnement</p>
                    <button onClick={() => setSelectedSourceType(null)} className={`text-xs ${textSecondary}`}>
                      <Icons.ArrowLeft size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SUBSCRIPTION_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => handleSelectSubscriptionPreset(preset)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                          isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span style={{ color: preset.color }}>{getIcon(preset.icon, 18)}</span>
                        <span className={`text-[10px] ${textSecondary}`}>{preset.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, label: ' ' }))} // Trigger custom mode
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span style={{ color: '#6366f1' }}>{getIcon('Plus', 18)}</span>
                      <span className={`text-[10px] ${textSecondary}`}>Autre</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Form fields */}
              {selectedSourceType && (selectedSourceType !== 'subscription' || selectedSubscriptionPreset || formData.label) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${selectedSubscriptionPreset?.color || CATEGORY_PRESETS[selectedSourceType].color}20` 
                        }}
                      >
                        <span style={{ color: selectedSubscriptionPreset?.color || CATEGORY_PRESETS[selectedSourceType].color }}>
                          {getIcon(selectedSubscriptionPreset?.icon || CATEGORY_PRESETS[selectedSourceType].icon, 16)}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${textPrimary}`}>
                        {selectedSubscriptionPreset?.name || CATEGORY_PRESETS[selectedSourceType].label}
                      </span>
                    </div>
                    <button onClick={resetForm} className={textSecondary}>
                      <Icons.X size={16} />
                    </button>
                  </div>

                  {/* Custom label for subscription or custom type */}
                  {(selectedSourceType === 'custom' || (selectedSourceType === 'subscription' && !selectedSubscriptionPreset)) && (
                    <input
                      type="text"
                      placeholder="Nom"
                      value={formData.label.trim()}
                      onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
                    />
                  )}

                  {/* Amount + Day */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Montant"
                      value={formData.amount}
                      onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
                    />
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${textSecondary}`}>Le</span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dayOfMonth}
                        onChange={e => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                        className={`w-14 px-2 py-2 rounded-lg text-sm text-center ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Category Toggle (only for custom) */}
                  {selectedSourceType === 'custom' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, category: 'income' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                          formData.category === 'income'
                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500'
                            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Icons.TrendingUp size={14} /> Revenu
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, category: 'expense' }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${
                          formData.category === 'expense'
                            ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500'
                            : isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Icons.TrendingDown size={14} /> Dépense
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={resetForm}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddRecurring}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-4">
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icons.Plus size={14} />
                Ajouter un flux récurrent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringFlowsWidget;
