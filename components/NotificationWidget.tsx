import React, { useState, useEffect } from 'react';
import { Category, LifeItem } from '../types';
import * as Icons from 'lucide-react';

interface NotificationWidgetProps {
  categories: Category[];
  isDarkMode: boolean;
  onItemClick: (categoryName: string, item: LifeItem) => void;
}

interface NotificationItem {
  item: LifeItem;
  categoryName: string;
  categoryColor: string;
}

const NotificationWidget: React.FC<NotificationWidgetProps> = ({
  categories,
  isDarkMode,
  onItemClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Collect all notifications (warning + critical) from all categories
  const notifications: NotificationItem[] = [];
  categories.forEach(cat => {
    cat.items.forEach(item => {
      if ((item.status === 'warning' || item.status === 'critical') && !item.notificationDismissed) {
        notifications.push({
          item,
          categoryName: cat.category,
          categoryColor: cat.color
        });
      }
    });
  });

  // Sort by priority: critical first, then warning
  notifications.sort((a, b) => {
    if (a.item.status === 'critical' && b.item.status !== 'critical') return -1;
    if (a.item.status !== 'critical' && b.item.status === 'critical') return 1;
    return 0;
  });

  // Format time as French 24h format "HH:MM"
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Format date as French format "Jour. DD mois"
  const formatDate = (date: Date) => {
    const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayName} ${dayNum} ${monthName}`;
  };

  const glassPanelClass = isDarkMode
    ? "bg-slate-900/80 backdrop-blur-xl border-slate-700/50 text-white"
    : "bg-white/80 backdrop-blur-xl border-white/50 text-gray-800";

  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-gray-500";

  const getPriorityBadge = (status: 'warning' | 'critical') => {
    if (status === 'critical') {
      return (
        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
          3j
        </div>
      );
    } else {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
          1j
        </div>
      );
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className={`w-80 rounded-2xl border shadow-2xl overflow-hidden transition-all ${glassPanelClass}`}>
      {/* Header - Date & Time Display */}
      <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'}`}>
        <div className="flex items-center justify-center gap-2">
          <Icons.Clock className={`w-4 h-4 ${textSecondary}`} />
          <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>
            {formatTime(currentTime)}
          </span>
          <span className={`text-sm ${textSecondary}`}>•</span>
          <span className={`text-sm font-medium ${textSecondary}`}>
            {formatDate(currentTime)}
          </span>
        </div>
      </div>

      {/* Échéances Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-5 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100/50'
          }`}
      >
        <div className="flex items-center gap-2">
          <Icons.Calendar className={`w-4 h-4 ${textSecondary}`} />
          <span className={`text-sm font-semibold ${textPrimary}`}>Échéances</span>
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
            }`}>
            {notifications.length}
          </div>
        </div>
        <Icons.ChevronDown
          className={`w-4 h-4 transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Notifications List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto px-3 pb-3 space-y-2">
          {notifications.map((notif, index) => {
            const bgColor = notif.item.status === 'critical'
              ? (isDarkMode ? 'bg-red-900/20' : 'bg-red-50/80')
              : (isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50/80');

            const borderColor = notif.item.status === 'critical'
              ? 'border-red-500/30'
              : 'border-amber-500/30';

            return (
              <button
                key={notif.item.id || index}
                onClick={() => onItemClick(notif.categoryName, notif.item)}
                className={`w-full p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${bgColor} ${borderColor} group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold mb-1 truncate ${textPrimary} group-hover:text-indigo-500 transition-colors`}>
                      {notif.item.notificationLabel || notif.item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Icons.Calendar className={`w-3 h-3 ${textSecondary}`} />
                      <span className={`text-xs ${textSecondary}`}>
                        {notif.item.status === 'critical' ? '7 déc' : '15 déc'}
                      </span>
                    </div>
                  </div>
                  {(notif.item.status === 'critical' || notif.item.status === 'warning') &&
                    getPriorityBadge(notif.item.status)
                  }
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollbar styling */}
      <style>{`
                .max-h-96::-webkit-scrollbar {
                    width: 6px;
                }
                .max-h-96::-webkit-scrollbar-track {
                    background: ${isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(229, 231, 235, 0.5)'};
                    border-radius: 10px;
                }
                .max-h-96::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
                    border-radius: 10px;
                }
                .max-h-96::-webkit-scrollbar-thumb:hover {
                    background: ${isDarkMode ? 'rgba(148, 163, 184, 0.7)' : 'rgba(156, 163, 175, 0.7)'};
                }
            `}</style>
    </div>
  );
};

export default NotificationWidget;
