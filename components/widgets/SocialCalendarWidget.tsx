import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { SocialEvent } from '../../types';

interface SocialCalendarWidgetProps {
  events: SocialEvent[];
  upcomingEvents: SocialEvent[];
  onAddEvent: (event: Omit<SocialEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

const EVENT_TYPES = {
  party: { label: 'Soirée', icon: Icons.PartyPopper, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  dinner: { label: 'Dîner', icon: Icons.Utensils, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  wedding: { label: 'Mariage', icon: Icons.Heart, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  birthday: { label: 'Anniversaire', icon: Icons.Cake, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  other: { label: 'Autre', icon: Icons.Calendar, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const SocialCalendarWidget: React.FC<SocialCalendarWidgetProps> = ({
  events,
  upcomingEvents,
  onAddEvent,
  onDeleteEvent,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'party' as SocialEvent['type'],
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const cardBg = isDark ? 'bg-slate-700/30' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  const formatEventDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAdd = () => {
    const dateTimeString = `${newEvent.date}T${newEvent.time || '12:00'}`;
    const timestamp = new Date(dateTimeString).getTime();

    onAddEvent({
      itemId,
      title: newEvent.title,
      date: timestamp,
      location: newEvent.location || undefined,
      type: newEvent.type,
      contactIds: [],
    });

    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'party',
    });
    setShowAddForm(false);
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
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Icons.CalendarHeart size={16} className="text-indigo-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Calendrier Social</p>
            <p className={`text-xs ${textSecondary}`}>
              {upcomingEvents.length > 0
                ? `${upcomingEvents.length} événement${upcomingEvents.length > 1 ? 's' : ''} à venir`
                : 'Aucun événement prévu'}
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

          {/* Upcoming Events List */}
          <div className="p-4 space-y-3">
            {(showAllEvents ? events : upcomingEvents).map(event => {
              const config = EVENT_TYPES[event.type] || EVENT_TYPES.other;
              const Icon = config.icon;

              return (
                <div key={event.id} className={`p-3 rounded-xl border ${borderClass} ${cardBg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${textPrimary}`}>{event.title}</h4>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1 opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity"
                        >
                          <Icons.X size={14} />
                        </button>
                      </div>

                      <p className={`text-xs font-medium ${config.color} mb-1`}>{config.label}</p>

                      <div className="space-y-0.5">
                        <div className={`flex items-center gap-1.5 text-[11px] ${textSecondary}`}>
                          <Icons.Clock size={11} />
                          {formatEventDate(event.date)}
                        </div>
                        {event.location && (
                          <div className={`flex items-center gap-1.5 text-[11px] ${textSecondary}`}>
                            <Icons.MapPin size={11} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <p className={`text-xs text-center py-2 ${textSecondary}`}>
                Rien de prévu pour le moment.
              </p>
            )}
          </div>

          {/* Show All Toggle */}
          {events.length > 5 && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowAllEvents(!showAllEvents)}
                className={`w-full py-2 text-xs font-medium flex items-center justify-center gap-1 ${textSecondary}`}
              >
                {showAllEvents ? 'Voir moins' : `Voir tous (${events.length})`}
              </button>
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'} pt-3 space-y-3`}>
              <div>
                <label className={`text-[10px] ${textSecondary}`}>Titre</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  placeholder="Dîner chez Alex"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Heure</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as SocialEvent['type'] }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  >
                    {Object.entries(EVENT_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Lieu</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newEvent.title || !newEvent.date}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white"
                >
                  Ajouter
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={14} />
                Ajouter un événement
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialCalendarWidget;
