import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HistoryEntry } from '../../types';

interface HistoryWidgetProps {
  history: HistoryEntry[];
  onAddEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1A', value: '1Y' },
  { label: 'Tout', value: 'ALL' },
];

const HistoryWidget: React.FC<HistoryWidgetProps> = ({
  history,
  onAddEntry,
  onDeleteEntry,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [newEntry, setNewEntry] = useState({
    label: '',
    value: '',
    category: 'expense' as 'income' | 'expense' | 'transfer',
    date: getTodayDate(),
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';
  const chartColors = {
    income: '#22c55e',
    expense: '#ef4444',
    grid: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#94a3b8' : '#6b7280',
  };

  // Filter history by time range
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '1M': 30 * 24 * 60 * 60 * 1000,
      '3M': 90 * 24 * 60 * 60 * 1000,
      '6M': 180 * 24 * 60 * 60 * 1000,
      '1Y': 365 * 24 * 60 * 60 * 1000,
      'ALL': Infinity,
    };

    const cutoff = now - ranges[timeRange];
    return history
      .filter(h => h.date >= cutoff)
      .sort((a, b) => a.date - b.date);
  }, [history, timeRange]);

  // Prepare chart data (cumulative balance)
  const chartData = useMemo(() => {
    let balance = 0;
    return filteredHistory.map(entry => {
      balance += entry.value;
      return {
        date: new Date(entry.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short'
        }),
        balance,
        value: entry.value,
        label: entry.label,
      };
    });
  }, [filteredHistory]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredHistory
      .filter(h => h.value > 0)
      .reduce((sum, h) => sum + h.value, 0);
    const expense = filteredHistory
      .filter(h => h.value < 0)
      .reduce((sum, h) => sum + Math.abs(h.value), 0);
    return { income, expense, net: income - expense };
  }, [filteredHistory]);

  const handleAddEntry = () => {
    const value = parseFloat(newEntry.value);
    if (!newEntry.label || isNaN(value)) return;

    // Parse the date or use today
    const entryDate = newEntry.date
      ? new Date(newEntry.date).getTime()
      : Date.now();

    onAddEntry({
      itemId,
      date: entryDate,
      label: newEntry.label,
      value: newEntry.category === 'income' ? Math.abs(value) : -Math.abs(value),
      category: newEntry.category,
    });

    setNewEntry({ label: '', value: '', category: 'expense', date: getTodayDate() });
    setShowAddForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
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
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Icons.LineChart size={16} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Historique</p>
            <p className={`text-xs ${textSecondary}`}>
              {filteredHistory.length} transactions
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
          {/* Time Range Selector */}
          <div className="px-4 pt-3 flex gap-1">
            {TIME_RANGES.map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeRange === range.value
                  ? 'bg-emerald-500 text-white'
                  : isDark
                    ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="px-4 py-3 h-40">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: chartColors.text }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Solde']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#22c55e"
                    fill="url(#balanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className={`text-sm ${textSecondary}`}>Aucune donnée</p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="px-4 pb-3 grid grid-cols-3 gap-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase ${textSecondary}`}>Entrées</p>
              <p className="text-sm font-semibold text-emerald-500">
                +{formatCurrency(totals.income)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase ${textSecondary}`}>Sorties</p>
              <p className="text-sm font-semibold text-red-500">
                -{formatCurrency(totals.expense)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <p className={`text-[10px] uppercase ${textSecondary}`}>Net</p>
              <p className={`text-sm font-semibold ${totals.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totals.net)}
              </p>
            </div>
          </div>

          {/* Add Entry Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              <div className="pt-3 space-y-2">
                {/* Category Selector */}
                <div className="flex gap-2">
                  {(['income', 'expense'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewEntry(prev => ({ ...prev, category: cat }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${newEntry.category === cat
                        ? cat === 'income'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                        : isDark
                          ? 'bg-slate-700/50 text-slate-400'
                          : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {cat === 'income' ? 'Entrée' : 'Sortie'}
                    </button>
                  ))}
                </div>

                {/* Label Input */}
                <input
                  type="text"
                  placeholder="Libellé (ex: Salaire)"
                  value={newEntry.label}
                  onChange={e => setNewEntry(prev => ({ ...prev, label: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />

                {/* Value Input */}
                <input
                  type="number"
                  placeholder="Montant (€)"
                  value={newEntry.value}
                  onChange={e => setNewEntry(prev => ({ ...prev, value: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />

                {/* Date Input */}
                <div>
                  <label className={`text-xs ${textSecondary} block mb-1`}>Date (optionnel)</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddEntry}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Icons.Plus size={14} />
                Ajouter une transaction
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryWidget;
