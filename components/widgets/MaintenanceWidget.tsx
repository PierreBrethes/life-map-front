import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { MaintenanceTask } from '../../types';

interface MaintenanceWidgetProps {
  tasks: MaintenanceTask[];
  onAddTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  onDeleteTask: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

// Urgency configuration
const URGENCY_CONFIG = {
  low: {
    label: 'Faible',
    color: 'text-slate-400',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    icon: Icons.Clock,
  },
  medium: {
    label: 'Normal',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: Icons.AlertCircle,
  },
  high: {
    label: 'Urgent',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    icon: Icons.AlertTriangle,
  },
  critical: {
    label: 'Critique',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: Icons.Zap,
  },
};

// Preset tasks for quick add
const PRESET_TASKS = [
  { title: 'Révision chaudière', urgency: 'medium' as const },
  { title: 'Ramonage cheminée', urgency: 'medium' as const },
  { title: 'Taxe foncière', urgency: 'high' as const },
  { title: 'Assurance habitation', urgency: 'medium' as const },
  { title: 'Entretien jardin', urgency: 'low' as const },
  { title: 'Peinture', urgency: 'low' as const },
  { title: 'Plomberie', urgency: 'high' as const },
  { title: 'Électricité', urgency: 'high' as const },
];

const MaintenanceWidget: React.FC<MaintenanceWidgetProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    urgency: 'medium' as MaintenanceTask['urgency'],
    dueDate: '',
    estimatedCost: '',
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sort and filter tasks
  const { pendingTasks, completedTasks, urgentCount, totalEstimatedCost } = useMemo(() => {
    const pending = tasks
      .filter(t => !t.isCompleted)
      .sort((a, b) => {
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });

    const completed = tasks
      .filter(t => t.isCompleted)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    const urgent = pending.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;
    const total = pending.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

    return {
      pendingTasks: pending,
      completedTasks: completed,
      urgentCount: urgent,
      totalEstimatedCost: total,
    };
  }, [tasks]);

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'En retard';
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Check if task is overdue
  const isOverdue = (task: MaintenanceTask) => {
    if (!task.dueDate) return false;
    return task.dueDate < Date.now() && !task.isCompleted;
  };

  const handleAddTask = () => {
    onAddTask({
      itemId,
      title: newTask.title,
      description: newTask.description || undefined,
      urgency: newTask.urgency,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : undefined,
      estimatedCost: parseFloat(newTask.estimatedCost) || undefined,
      isCompleted: false,
    });

    setNewTask({
      title: '',
      description: '',
      urgency: 'medium',
      dueDate: '',
      estimatedCost: '',
    });
    setShowAddForm(false);
  };

  const handleQuickAdd = (preset: typeof PRESET_TASKS[0]) => {
    onAddTask({
      itemId,
      title: preset.title,
      urgency: preset.urgency,
      isCompleted: false,
    });
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
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Icons.Wrench size={16} className="text-orange-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Maintenance</p>
            <p className={`text-xs ${textSecondary}`}>
              {pendingTasks.length} tâche{pendingTasks.length !== 1 ? 's' : ''} en attente
              {urgentCount > 0 && (
                <span className="text-amber-400 ml-1">({urgentCount} urgent{urgentCount !== 1 ? 'es' : ''})</span>
              )}
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
          {/* Total Estimated Cost */}
          {totalEstimatedCost > 0 && (
            <div className={`mx-4 mt-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textSecondary}`}>Coût estimé total</span>
                <span className={`text-sm font-bold text-orange-400`}>
                  {formatCurrency(totalEstimatedCost)}
                </span>
              </div>
            </div>
          )}

          {/* Pending Tasks List */}
          <div className="p-4 space-y-2">
            {pendingTasks.length === 0 ? (
              <p className={`text-sm text-center py-4 ${textSecondary}`}>
                Aucune tâche en attente 🎉
              </p>
            ) : (
              pendingTasks.map(task => {
                const config = URGENCY_CONFIG[task.urgency];
                const UrgencyIcon = config.icon;
                const overdue = isOverdue(task);

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border ${config.border} ${config.bg} transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => onUpdateTask(task.id, {
                          isCompleted: true,
                          completedAt: Date.now()
                        })}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isDark ? 'border-slate-500 hover:border-emerald-400' : 'border-gray-400 hover:border-emerald-500'
                          }`}
                      >
                        <Icons.Check size={12} className="opacity-0 hover:opacity-50" />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${textPrimary}`}>{task.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>

                        {task.description && (
                          <p className={`text-xs mt-0.5 ${textSecondary}`}>{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5">
                          {task.dueDate && (
                            <span className={`text-[10px] flex items-center gap-1 ${overdue ? 'text-red-400' : textSecondary}`}>
                              <Icons.Calendar size={10} />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.estimatedCost && (
                            <span className={`text-[10px] flex items-center gap-1 ${textSecondary}`}>
                              <Icons.Euro size={10} />
                              {formatCurrency(task.estimatedCost)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-red-900/30 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          }`}
                      >
                        <Icons.Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Completed Tasks Toggle */}
          {completedTasks.length > 0 && (
            <div className="px-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`w-full py-2 text-xs font-medium flex items-center justify-center gap-1 ${textSecondary}`}
              >
                {showCompleted ? 'Masquer' : 'Afficher'} les tâches terminées ({completedTasks.length})
                <Icons.ChevronDown size={12} className={showCompleted ? 'rotate-180' : ''} />
              </button>

              {showCompleted && (
                <div className="pb-3 space-y-2">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/20' : 'bg-gray-50'} opacity-60`}
                    >
                      <div className="flex items-center gap-2">
                        <Icons.CheckCircle2 size={14} className="text-emerald-400" />
                        <span className={`text-xs line-through ${textSecondary}`}>{task.title}</span>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="ml-auto p-1 rounded hover:bg-red-500/20"
                        >
                          <Icons.X size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              <div className="pt-3 space-y-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Titre</label>
                  <input
                    type="text"
                    placeholder="Révision chaudière..."
                    value={newTask.title}
                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Description (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Détails..."
                    value={newTask.description}
                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Urgence</label>
                    <select
                      value={newTask.urgency}
                      onChange={e => setNewTask(prev => ({ ...prev, urgency: e.target.value as MaintenanceTask['urgency'] }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                    >
                      {Object.entries(URGENCY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Échéance</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Coût estimé (€)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={newTask.estimatedCost}
                    onChange={e => setNewTask(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.title.trim()}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-3">
              {/* Quick Add Presets */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TASKS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(preset)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${isDark
                        ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>

              {/* Custom Add Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={14} />
                Ajouter une tâche personnalisée
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceWidget;
