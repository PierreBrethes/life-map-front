import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Contact } from '../../types';

interface BirthdayWidgetProps {
  nextBirthday: (Contact & { nextBirthdayDate: number; daysUntil: number; age: number }) | null;
  monthBirthdays: Contact[];
  contacts: Contact[]; // Needed for selection
  isDark: boolean;
}

const BirthdayWidget: React.FC<BirthdayWidgetProps> = ({
  nextBirthday,
  monthBirthdays,
  contacts,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const cardBg = isDark ? 'bg-slate-700/30' : 'bg-gray-50';

  // Format date
  const formatBirthday = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
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
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Icons.Gift size={16} className="text-pink-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Anniversaires</p>
            <p className={`text-xs ${textSecondary}`}>
              {nextBirthday
                ? `${nextBirthday.name} dans ${nextBirthday.daysUntil} jour${nextBirthday.daysUntil > 1 ? 's' : ''}`
                : 'Aucun anniversaire à venir'
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

          {/* Next Birthday Spotlight */}
          {nextBirthday && (
            <div className={`m-4 p-4 rounded-xl flex flex-col items-center text-center ${isDark ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40' : 'bg-gradient-to-br from-pink-50 to-purple-50'}`}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-pink-500/20">
                <Icons.Cake size={32} className="text-white" />
              </div>

              <h3 className={`text-lg font-bold ${textPrimary}`}>{nextBirthday.name}</h3>
              <p className={`text-sm font-medium text-pink-500`}>
                fêtera ses {nextBirthday.age} ans
              </p>

              <div className="mt-3 flex gap-2">
                <div className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-white/60'} backdrop-blur-sm`}>
                  <span className={`text-xs font-bold ${textPrimary}`}>
                    {new Date(nextBirthday.nextBirthdayDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              <div className={`mt-2 text-xs font-medium ${nextBirthday.daysUntil <= 3 ? 'text-red-400 animate-pulse' : textSecondary
                }`}>
                {nextBirthday.daysUntil === 0 ? "C'est aujourd'hui ! 🎉" : `Dans ${nextBirthday.daysUntil} jours`}
              </div>
            </div>
          )}

          {/* Month Birthdays List */}
          <div className="px-4 pb-4">
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
              Ce mois-ci
            </h4>

            {monthBirthdays.length > 0 ? (
              <div className="space-y-2">
                {monthBirthdays.map(contact => (
                  <div key={contact.id} className={`flex items-center justify-between p-2 rounded-lg ${cardBg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>{contact.name}</p>
                        <p className={`text-[10px] ${textSecondary}`}>{formatBirthday(contact.birthday)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs text-center py-2 ${textSecondary}`}>
                Aucun autre anniversaire ce mois-ci.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdayWidget;
