import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ItemStatus } from '../../types';

interface NotificationItem {
  id: string;
  label: string;
  type: 'active' | 'attention';
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  enabled: boolean;
  currentStatus: ItemStatus;
  onToggle: () => void;
  onAddAlert: (severity: 'warning' | 'critical', label: string) => void;
  onClearAlert: () => void;
  isDark: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  enabled,
  currentStatus,
  onToggle,
  onAddAlert,
  onClearAlert,
  isDark
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<'warning' | 'critical'>('warning');
  const [alertLabel, setAlertLabel] = useState('');

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  const activeCount = notifications.length;
  const hasActiveAlert = currentStatus === 'warning' || currentStatus === 'critical';

  const handleAddAlert = () => {
    if (!alertLabel.trim()) {
      // Default labels based on severity
      const defaultLabel = alertSeverity === 'critical'
        ? 'Action urgente requise'
        : 'Surveillance recommandée';
      onAddAlert(alertSeverity, defaultLabel);
    } else {
      onAddAlert(alertSeverity, alertLabel.trim());
    }
    setAlertLabel('');
    setShowAddForm(false);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          {/* Bell Icon with status-based color */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStatus === 'critical'
              ? 'bg-red-500/20'
              : currentStatus === 'warning'
                ? 'bg-orange-500/20'
                : 'bg-emerald-500/20'
            }`}>
            <Icons.Bell size={16} className={
              currentStatus === 'critical'
                ? 'text-red-400'
                : currentStatus === 'warning'
                  ? 'text-orange-400'
                  : 'text-emerald-400'
            } />
          </div>

          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Alertes</p>
            <p className={`text-xs ${textSecondary}`}>
              {hasActiveAlert
                ? currentStatus === 'critical'
                  ? '🔴 Alerte critique active'
                  : '🟠 Alerte active'
                : '✅ Aucune alerte'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled
              ? currentStatus === 'critical' ? 'bg-red-500' : 'bg-orange-500'
              : isDark ? 'bg-slate-600' : 'bg-gray-300'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>

          {/* Chevron */}
          <Icons.ChevronDown
            size={16}
            className={`transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`px-4 pb-4 space-y-3 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          {/* Current notifications */}
          {notifications.length > 0 && (
            <div className="pt-3 space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl flex items-center gap-3 ${notif.type === 'attention'
                      ? isDark ? 'bg-red-900/30 border border-red-500/30' : 'bg-red-50 border border-red-200'
                      : isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                    }`}
                >
                  {notif.type === 'attention' ? (
                    <Icons.AlertTriangle size={16} className="text-red-400" />
                  ) : (
                    <Icons.Bell size={16} className="text-amber-400" />
                  )}
                  <span className={`text-sm ${textPrimary}`}>{notif.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add Alert Form */}
          {showAddForm ? (
            <div className={`pt-3 p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <p className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}>
                Nouvelle alerte
              </p>

              {/* Severity Selector */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAlertSeverity('warning')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${alertSeverity === 'warning'
                      ? 'bg-orange-500 text-white ring-2 ring-orange-500/50'
                      : isDark
                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <Icons.AlertTriangle size={14} />
                  Attention
                </button>
                <button
                  onClick={() => setAlertSeverity('critical')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${alertSeverity === 'critical'
                      ? 'bg-red-500 text-white ring-2 ring-red-500/50'
                      : isDark
                        ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <Icons.Zap size={14} />
                  Critique
                </button>
              </div>

              {/* Alert Label Input */}
              <input
                type="text"
                placeholder="Libellé (optionnel)"
                value={alertLabel}
                onChange={(e) => setAlertLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAlert()}
                className={`w-full px-3 py-2 rounded-lg text-sm mb-3 ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 ${alertSeverity === 'critical' ? 'focus:ring-red-500/50' : 'focus:ring-orange-500/50'
                  }`}
              />

              {/* Preview what will happen */}
              <div className={`text-xs mb-3 p-2 rounded-lg ${alertSeverity === 'critical'
                  ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
                  : isDark ? 'bg-orange-900/20 text-orange-300' : 'bg-orange-50 text-orange-600'
                }`}>
                {alertSeverity === 'critical'
                  ? '⚡ Une notification rouge apparaîtra sur le bloc'
                  : '⚠️ Le statut passera en mode surveillance'
                }
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setAlertLabel('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddAlert}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium text-white ${alertSeverity === 'critical'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                >
                  Créer l'alerte
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 space-y-2">
              {/* Add Alert Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={16} />
                Ajouter une alerte
              </button>

              {/* Clear Alert Button - Only shown if there's an active alert */}
              {hasActiveAlert && (
                <button
                  onClick={onClearAlert}
                  className={`w-full py-2 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${isDark
                      ? 'text-emerald-400 hover:bg-emerald-900/20'
                      : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                >
                  <Icons.CheckCircle size={14} />
                  Marquer comme résolu
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
