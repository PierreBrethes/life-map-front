import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Alert } from '../../types';

interface AlertsWidgetProps {
  alerts: Alert[];
  onAddAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  activeAlertsCount: number;
  itemId: string;
  isDark: boolean;
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({
  alerts,
  onAddAlert,
  onDeleteAlert,
  onToggleAlert,
  activeAlertsCount,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    severity: 'warning' as 'warning' | 'critical',
    dueDate: '',
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  // Check if there's any critical active alert
  const hasCriticalAlert = alerts.some(a => a.isActive && a.severity === 'critical');
  const hasWarningAlert = alerts.some(a => a.isActive && a.severity === 'warning');

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAddAlert = () => {
    if (!newAlert.name.trim()) return;

    onAddAlert({
      itemId,
      name: newAlert.name.trim(),
      severity: newAlert.severity,
      dueDate: newAlert.dueDate ? new Date(newAlert.dueDate).getTime() : undefined,
      isActive: true,
    });

    setNewAlert({ name: '', severity: 'warning', dueDate: '' });
    setShowAddForm(false);
  };

  const getSeverityConfig = (severity: 'warning' | 'critical', isActive: boolean) => {
    if (!isActive) {
      return {
        bg: isDark ? 'bg-slate-700/30' : 'bg-gray-100',
        icon: Icons.BellOff,
        iconColor: textSecondary,
        badge: null,
      };
    }

    if (severity === 'critical') {
      return {
        bg: isDark ? 'bg-red-900/30 border border-red-500/30' : 'bg-red-50 border border-red-200',
        icon: Icons.Zap,
        iconColor: 'text-red-400',
        badge: '🔴',
      };
    }

    return {
      bg: isDark ? 'bg-orange-900/30 border border-orange-500/30' : 'bg-orange-50 border border-orange-200',
      icon: Icons.AlertTriangle,
      iconColor: 'text-orange-400',
      badge: '🟠',
    };
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
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasCriticalAlert
            ? 'bg-red-500/20'
            : hasWarningAlert
              ? 'bg-orange-500/20'
              : 'bg-emerald-500/20'
            }`}>
            <Icons.Bell size={16} className={
              hasCriticalAlert
                ? 'text-red-400'
                : hasWarningAlert
                  ? 'text-orange-400'
                  : 'text-emerald-400'
            } />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Alertes</p>
            <p className={`text-xs ${textSecondary}`}>
              {activeAlertsCount > 0
                ? `${activeAlertsCount} active${activeAlertsCount > 1 ? 's' : ''}`
                : 'Aucune alerte'
              }
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
          {/* Alerts List */}
          {alerts.length > 0 ? (
            <div className="divide-y divide-slate-700/30">
              {alerts.map(alert => {
                const config = getSeverityConfig(alert.severity, alert.isActive);
                const IconComponent = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`px-4 py-3 flex items-center justify-between ${!alert.isActive ? 'opacity-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                        <IconComponent size={16} className={config.iconColor} />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {config.badge && <span className="text-xs">{config.badge}</span>}
                          <p className={`text-sm font-medium truncate ${textPrimary}`}>
                            {alert.name}
                          </p>
                        </div>
                        <p className={`text-xs ${textSecondary}`}>
                          {alert.dueDate
                            ? `Échéance : ${formatDate(alert.dueDate)}`
                            : `Créée le ${formatDate(alert.createdAt)}`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle */}
                      <button
                        onClick={() => onToggleAlert(alert.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                          }`}
                        title={alert.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {alert.isActive ? (
                          <Icons.ToggleRight size={18} className={
                            alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                          } />
                        ) : (
                          <Icons.ToggleLeft size={18} className={textSecondary} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                          }`}
                        title="Supprimer"
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
              <Icons.Bell size={24} className={`mx-auto mb-2 ${textSecondary}`} />
              <p className={`text-sm ${textSecondary}`}>Aucune alerte configurée</p>
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 py-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              <p className={`text-xs font-semibold uppercase mb-3 ${textSecondary}`}>
                Nouvelle alerte
              </p>

              {/* Alert Name */}
              <input
                type="text"
                placeholder="Description de l'alerte"
                value={newAlert.name}
                onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAlert()}
                className={`w-full px-3 py-2 rounded-lg text-sm mb-3 ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
              />

              {/* Severity Selector */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setNewAlert(prev => ({ ...prev, severity: 'warning' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${newAlert.severity === 'warning'
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
                  onClick={() => setNewAlert(prev => ({ ...prev, severity: 'critical' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${newAlert.severity === 'critical'
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

              {/* Due Date (optional) */}
              <div className="mb-3">
                <label className={`text-xs ${textSecondary} block mb-1`}>
                  Date d'échéance (optionnel)
                </label>
                <input
                  type="date"
                  value={newAlert.dueDate}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                />
              </div>

              {/* Preview */}
              <div className={`text-xs mb-3 p-2 rounded-lg ${newAlert.severity === 'critical'
                ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
                : isDark ? 'bg-orange-900/20 text-orange-300' : 'bg-orange-50 text-orange-600'
                }`}>
                {newAlert.severity === 'critical'
                  ? '⚡ Cette alerte affichera une notification rouge sur le bloc'
                  : '⚠️ Cette alerte sera en mode surveillance'
                }
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAlert({ name: '', severity: 'warning', dueDate: '' });
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddAlert}
                  disabled={!newAlert.name.trim()}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium text-white transition-colors ${newAlert.severity === 'critical'
                    ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-500/50'
                    : 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50'
                    }`}
                >
                  Créer l'alerte
                </button>
              </div>
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
                Ajouter une alerte
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsWidget;
