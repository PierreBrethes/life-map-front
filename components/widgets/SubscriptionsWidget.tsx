import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Subscription } from '../../types';

interface SubscriptionsWidgetProps {
  subscriptions: Subscription[];
  totalMonthly: number;
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscription: (id: string) => void;
  getNextBillingDate: (billingDay: number) => Date;
  itemId: string;
  isDark: boolean;
}

// Popular subscription presets
const SUBSCRIPTION_PRESETS = [
  { name: 'Netflix', icon: 'Tv', color: '#e50914', amount: 15.99 },
  { name: 'Spotify', icon: 'Music', color: '#1db954', amount: 9.99 },
  { name: 'Amazon Prime', icon: 'Package', color: '#ff9900', amount: 6.99 },
  { name: 'Disney+', icon: 'Clapperboard', color: '#113ccf', amount: 8.99 },
  { name: 'YouTube Premium', icon: 'Youtube', color: '#ff0000', amount: 12.99 },
  { name: 'Apple Music', icon: 'Apple', color: '#fc3c44', amount: 10.99 },
  { name: 'Autre', icon: 'CreditCard', color: '#6366f1', amount: 0 },
];

const SubscriptionsWidget: React.FC<SubscriptionsWidgetProps> = ({
  subscriptions,
  totalMonthly,
  onAddSubscription,
  onDeleteSubscription,
  onToggleSubscription,
  getNextBillingDate,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<typeof SUBSCRIPTION_PRESETS[0] | null>(null);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    billingDay: new Date().getDate(),
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const handleSelectPreset = (preset: typeof SUBSCRIPTION_PRESETS[0]) => {
    setSelectedPreset(preset);
    setNewSub({
      name: preset.name === 'Autre' ? '' : preset.name,
      amount: preset.amount > 0 ? preset.amount.toString() : '',
      billingDay: new Date().getDate(),
    });
  };

  const handleAddSubscription = () => {
    const amount = parseFloat(newSub.amount);
    if (!newSub.name || isNaN(amount) || amount <= 0) return;

    onAddSubscription({
      itemId,
      name: newSub.name,
      amount,
      billingDay: newSub.billingDay,
      icon: selectedPreset?.icon || 'CreditCard',
      color: selectedPreset?.color || '#6366f1',
      isActive: true,
    });

    setNewSub({ name: '', amount: '', billingDay: new Date().getDate() });
    setSelectedPreset(null);
    setShowAddForm(false);
  };

  // Get icon component dynamically
  const getIcon = (iconName: string, size = 16) => {
    const IconComponent = (Icons as any)[iconName] || Icons.CreditCard;
    return <IconComponent size={size} />;
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Icons.CreditCard size={16} className="text-indigo-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Abonnements</p>
            <p className={`text-xs ${textSecondary}`}>
              {formatCurrency(totalMonthly)}/mois
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
          {/* Subscriptions List */}
          {subscriptions.length > 0 ? (
            <div className="divide-y divide-slate-700/30">
              {subscriptions.map(sub => {
                const nextDate = getNextBillingDate(sub.billingDay);
                return (
                  <div
                    key={sub.id}
                    className={`px-4 py-3 flex items-center justify-between ${!sub.isActive ? 'opacity-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${sub.color}20` }}
                      >
                        <span style={{ color: sub.color }}>
                          {getIcon(sub.icon || 'CreditCard', 16)}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{sub.name}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          Prochain : {formatDate(nextDate)}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${textPrimary}`}>
                        {formatCurrency(sub.amount)}
                      </span>

                      {/* Toggle */}
                      <button
                        onClick={() => onToggleSubscription(sub.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                          }`}
                      >
                        {sub.isActive ? (
                          <Icons.ToggleRight size={18} className="text-emerald-500" />
                        ) : (
                          <Icons.ToggleLeft size={18} className={textSecondary} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteSubscription(sub.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
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
              <Icons.CreditCard size={24} className={`mx-auto mb-2 ${textSecondary}`} />
              <p className={`text-sm ${textSecondary}`}>Aucun abonnement</p>
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 py-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              {/* Preset Selector */}
              {!selectedPreset && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {SUBSCRIPTION_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${isDark
                        ? 'bg-slate-700/50 hover:bg-slate-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      <span style={{ color: preset.color }}>{getIcon(preset.icon, 18)}</span>
                      <span className={`text-[10px] ${textSecondary}`}>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Form Fields */}
              {selectedPreset && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${selectedPreset.color}20` }}
                    >
                      <span style={{ color: selectedPreset.color }}>
                        {getIcon(selectedPreset.icon, 16)}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {selectedPreset.name === 'Autre' ? 'Nouvel abonnement' : selectedPreset.name}
                    </span>
                    <button
                      onClick={() => setSelectedPreset(null)}
                      className={`ml-auto p-1 rounded ${textSecondary} hover:text-white`}
                    >
                      <Icons.X size={14} />
                    </button>
                  </div>

                  {/* Custom name for "Autre" */}
                  {selectedPreset.name === 'Autre' && (
                    <input
                      type="text"
                      placeholder="Nom de l'abonnement"
                      value={newSub.name}
                      onChange={e => setNewSub(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                    />
                  )}

                  {/* Amount */}
                  <input
                    type="number"
                    placeholder="Montant mensuel (€)"
                    value={newSub.amount}
                    onChange={e => setNewSub(prev => ({ ...prev, amount: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />

                  {/* Billing Day */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${textSecondary}`}>Jour de prélèvement :</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newSub.billingDay}
                      onChange={e => setNewSub(prev => ({ ...prev, billingDay: parseInt(e.target.value) || 1 }))}
                      className={`w-16 px-2 py-1 rounded-lg text-sm text-center ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedPreset(null);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddSubscription}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600"
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
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={14} />
                Ajouter un abonnement
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsWidget;
