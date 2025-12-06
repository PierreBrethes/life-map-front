import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { HealthAppointment } from '../../types';

interface HealthAppointmentsWidgetProps {
  appointments: HealthAppointment[];
  upcomingAppointments: HealthAppointment[];
  onAddAppointment: (appointment: Omit<HealthAppointment, 'id'>) => void;
  onUpdateAppointment: (id: string, updates: Partial<HealthAppointment>) => void;
  onDeleteAppointment: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

const APPOINTMENT_TYPES = {
  doctor: { label: 'Médecin', icon: Icons.Stethoscope, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  dentist: { label: 'Dentiste', icon: Icons.Smile, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  vaccine: { label: 'Vaccin', icon: Icons.Syringe, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  checkup: { label: 'Bilan', icon: Icons.ClipboardCheck, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  other: { label: 'Autre', icon: Icons.Calendar, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

const HealthAppointmentsWidget: React.FC<HealthAppointmentsWidgetProps> = ({
  appointments,
  upcomingAppointments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    title: '',
    type: 'doctor' as HealthAppointment['type'],
    date: '',
    notes: '',
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const cardBg = isDark ? 'bg-slate-700/30' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAdd = () => {
    onAddAppointment({
      itemId,
      title: newAppointment.title,
      type: newAppointment.type,
      date: new Date(newAppointment.date).getTime(),
      notes: newAppointment.notes,
      isCompleted: false,
    });
    setNewAppointment({ title: '', type: 'doctor', date: '', notes: '' });
    setShowAddForm(false);
  };

  const toggleComplete = (app: HealthAppointment) => {
    onUpdateAppointment(app.id, { isCompleted: !app.isCompleted });
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
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Icons.Stethoscope size={16} className="text-blue-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Carnet de Santé</p>
            <p className={`text-xs ${textSecondary}`}>
              {upcomingAppointments.length > 0
                ? `${upcomingAppointments.length} RDV à venir`
                : 'Aucun RDV prévu'}
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

          {/* List */}
          <div className="p-4 space-y-3">
            {(showAll ? appointments : upcomingAppointments).map(app => {
              const config = APPOINTMENT_TYPES[app.type] || APPOINTMENT_TYPES.other;
              const Icon = config.icon;
              const isPast = app.date < Date.now();

              return (
                <div key={app.id} className={`p-3 rounded-xl border ${borderClass} ${cardBg} ${app.isCompleted ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={config.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${textPrimary} ${app.isCompleted ? 'line-through' : ''}`}>
                          {app.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleComplete(app)}
                            className={`p-1 rounded-full ${app.isCompleted ? 'text-green-400 bg-green-500/10' : 'text-slate-400 hover:text-green-400'}`}
                          >
                            <Icons.Check size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteAppointment(app.id)}
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <Icons.Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs font-medium ${config.color} mb-1`}>{config.label}</p>

                      <div className={`flex items-center gap-1.5 text-[11px] ${isPast && !app.isCompleted ? 'text-red-400 font-bold' : textSecondary}`}>
                        <Icons.Calendar size={11} />
                        {formatDate(app.date)}
                        {isPast && !app.isCompleted && ' (Passé)'}
                      </div>

                      {app.notes && (
                        <div className={`mt-1 text-[11px] ${textSecondary}italic`}>
                          "{app.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {appointments.length === 0 && (
              <p className={`text-xs text-center py-2 ${textSecondary}`}>
                Carnet de santé vide.
              </p>
            )}
          </div>

          {appointments.length > 5 && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className={`w-full py-2 text-xs font-medium flex items-center justify-center gap-1 ${textSecondary}`}
              >
                {showAll ? 'Voir moins' : `Voir tout (${appointments.length})`}
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
                  value={newAppointment.title}
                  onChange={e => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  placeholder="Rappel Rapide / Nom RDV"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Type</label>
                  <select
                    value={newAppointment.type}
                    onChange={e => setNewAppointment(prev => ({ ...prev, type: e.target.value as HealthAppointment['type'] }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  >
                    {Object.entries(APPOINTMENT_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`text-[10px] ${textSecondary}`}>Notes</label>
                <input
                  type="text"
                  value={newAppointment.notes}
                  onChange={e => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                  placeholder="Renouveler ordonnance..."
                />
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
                  disabled={!newAppointment.title || !newAppointment.date}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white"
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
                Nouveau RDV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthAppointmentsWidget;
