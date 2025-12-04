import React from 'react';
import * as Icons from 'lucide-react';

interface SidebarHeaderProps {
  categoryName: string;
  categoryIcon?: string;
  categoryColor: string;
  itemName: string;
  itemStatus: 'ok' | 'warning' | 'critical';
  onDelete: () => void;
  onClose: () => void;
  isDark: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  categoryName,
  categoryIcon = 'Star',
  categoryColor,
  itemName,
  itemStatus,
  onDelete,
  onClose,
  isDark
}) => {
  // Dynamic icon loading
  const IconComponent = (Icons as any)[categoryIcon] || Icons.Star;

  // Status badge configuration
  const statusConfig = {
    ok: {
      bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
      text: 'text-emerald-500',
      icon: Icons.Check,
      label: 'OK'
    },
    warning: {
      bg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
      text: 'text-amber-500',
      icon: Icons.AlertTriangle,
      label: 'ATTENTION'
    },
    critical: {
      bg: isDark ? 'bg-red-500/20' : 'bg-amber-100',
      text: 'text-amber-400',
      icon: Icons.Zap,
      label: 'CRITIQUE'
    }
  };

  const status = statusConfig[itemStatus];
  const StatusIcon = status.icon;

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className={`p-6 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
      {/* Top row: Category badge + Actions */}
      <div className="flex items-start justify-between mb-4">
        {/* Category Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: isDark ? `${categoryColor}20` : `${categoryColor}15`,
            color: categoryColor
          }}
        >
          <IconComponent size={12} />
          <span>{categoryName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition-colors ${isDark
                ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400'
                : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
              }`}
            title="Supprimer"
          >
            <Icons.Trash2 size={18} />
          </button>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-800'
              }`}
            title="Fermer"
          >
            <Icons.X size={18} />
          </button>
        </div>
      </div>

      {/* Item Name */}
      <h2 className={`text-2xl font-bold leading-tight mb-3 ${textPrimary}`}>
        {itemName}
      </h2>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
      >
        <StatusIcon size={12} />
        <span>{status.label}</span>
      </div>
    </div>
  );
};

export default SidebarHeader;
