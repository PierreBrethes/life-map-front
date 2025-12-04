import React from 'react';
import * as Icons from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  isDark: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  isDark
}) => {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';

  // Default actions if none provided
  const defaultActions: QuickAction[] = [
    {
      id: 'historique',
      label: 'Historique',
      subLabel: 'Voir l\'évolution temporelle',
      icon: <Icons.Clock size={18} className="text-indigo-400" />,
      onClick: () => console.log('Historique clicked')
    }
  ];

  const displayActions = actions || defaultActions;

  return (
    <div>
      {/* Section Header */}
      <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${textSecondary}`}>
        Actions Rapides
      </h3>

      {/* Actions List */}
      <div className="space-y-2">
        {displayActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-colors ${bgClass} ${borderClass} ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              }`}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
              }`}>
              {action.icon}
            </div>

            {/* Text */}
            <div className="text-left">
              <p className={`text-sm font-semibold ${textPrimary}`}>{action.label}</p>
              <p className={`text-xs ${textSecondary}`}>{action.subLabel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
