import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface NotificationItem {
  id: string;
  label: string;
  type: 'active' | 'attention';
}

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  enabled: boolean;
  onToggle: () => void;
  onAddAlert?: () => void;
  isDark: boolean;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  enabled,
  onToggle,
  onAddAlert,
  isDark
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';

  const activeCount = notifications.length;

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          {/* Bell Icon with orange background */}
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Icons.Bell size={16} className="text-orange-400" />
          </div>

          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Notifications</p>
            <p className={`text-xs ${textSecondary}`}>{activeCount} actives</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-orange-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
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
        <div className={`px-4 pb-4 space-y-2 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          <div className="pt-3 space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'
                  }`}
              >
                <Icons.Bell size={16} className="text-amber-400" />
                <span className={`text-sm ${textPrimary}`}>{notif.label}</span>
              </div>
            ))}
          </div>

          {/* Add Alert Button */}
          {onAddAlert && (
            <button
              onClick={onAddAlert}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Icons.Plus size={16} />
              Ajouter une alerte
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
