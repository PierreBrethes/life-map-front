import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface InfoSectionProps {
  type: string;
  description?: string;
  value: string;
  onEdit?: () => void;
  isDark: boolean;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  type,
  description,
  value,
  onEdit,
  isDark
}) => {
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';

  return (
    <div className={`p-5 rounded-2xl border ${bgClass} ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>
          Informations
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className={`p-1.5 rounded-lg transition-colors ${isDark
                ? 'hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400'
                : 'hover:bg-indigo-50 text-gray-400 hover:text-indigo-600'
              }`}
          >
            <Icons.Pencil size={14} />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {/* Type */}
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>
            Type
          </p>
          <p className={`text-sm font-medium ${textPrimary}`}>{type}</p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>
              Description
            </p>
            <p className={`text-sm ${textPrimary}`}>{description}</p>
          </div>
        )}

        {/* Value */}
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>
            Valeur
          </p>
          <p className={`text-lg font-semibold text-indigo-500`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
