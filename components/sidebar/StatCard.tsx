import React from 'react';

interface StatCardProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  unit?: string;
  progress?: number; // 0-100, optional progress bar
  variant: 'gradient' | 'dark';
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  icon,
  value,
  unit,
  progress,
  variant,
  isDark
}) => {
  // Gradient variant: purple gradient background
  // Dark variant: dark slate background
  const bgClass = variant === 'gradient'
    ? 'bg-gradient-to-br from-violet-600 to-purple-700'
    : isDark
      ? 'bg-slate-800/80'
      : 'bg-slate-700/90';

  const textColor = 'text-white';
  const labelColor = variant === 'gradient'
    ? 'text-violet-200'
    : 'text-slate-400';

  return (
    <div className={`flex-1 p-4 rounded-2xl ${bgClass}`}>
      {/* Label with icon */}
      <div className={`flex items-center gap-1.5 mb-2 ${labelColor}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold ${textColor}`}>
        {value}
        {unit && <span className="text-sm font-medium ml-1 opacity-80">{unit}</span>}
      </div>

      {/* Optional Progress Bar */}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
