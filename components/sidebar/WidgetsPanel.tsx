import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface Widget {
  id: string;
  label: string;
}

interface WidgetsPanelProps {
  widgets?: Widget[];
  onSelectWidget?: (id: string) => void;
  isDark: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'graph', label: 'Graphique' },
  { id: 'table', label: 'Tableau' },
];

const WidgetsPanel: React.FC<WidgetsPanelProps> = ({
  widgets = DEFAULT_WIDGETS,
  onSelectWidget,
  isDark
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';

  return (
    <div className={`rounded-2xl border overflow-hidden ${bgClass} ${borderClass}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center gap-3">
          {/* Plus Icon with purple background */}
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Icons.Plus size={16} className="text-violet-400" />
          </div>

          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Widgets</p>
            <p className={`text-xs ${textSecondary}`}>Personnaliser</p>
          </div>
        </div>

        {/* Chevron */}
        <Icons.ChevronDown
          size={16}
          className={`transition-transform ${textSecondary} ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Content - Widget Grid */}
      {isExpanded && (
        <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
          <div className="pt-3 grid grid-cols-2 gap-2">
            {widgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => onSelectWidget?.(widget.id)}
                className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors ${isDark
                    ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Icons.Plus size={16} className={textSecondary} />
                <span className={`text-xs font-medium ${textPrimary}`}>{widget.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetsPanel;
