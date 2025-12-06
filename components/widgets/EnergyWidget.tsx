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
  Legend,
} from 'recharts';
import { EnergyConsumption } from '../../types';

interface EnergyWidgetProps {
  consumption: EnergyConsumption[];
  onAddEntry: (entry: Omit<EnergyConsumption, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

const EnergyWidget: React.FC<EnergyWidgetProps> = ({
  consumption,
  onAddEntry,
  onDeleteEntry,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().slice(0, 7), // YYYY-MM format
    electricityCost: '',
    electricityKwh: '',
    gasCost: '',
    gasM3: '',
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';
  const chartColors = {
    electricity: '#facc15', // Yellow
    gas: '#3b82f6',        // Blue
    grid: isDark ? '#334155' : '#e5e7eb',
    text: isDark ? '#94a3b8' : '#6b7280',
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sort and prepare chart data
  const chartData = useMemo(() => {
    return [...consumption]
      .sort((a, b) => a.date - b.date)
      .slice(-12) // Last 12 months
      .map(entry => ({
        month: new Date(entry.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        electricity: entry.electricityCost,
        gas: entry.gasCost,
        total: entry.electricityCost + entry.gasCost,
      }));
  }, [consumption]);

  // Calculate current month and comparison
  const stats = useMemo(() => {
    const sortedData = [...consumption].sort((a, b) => b.date - a.date);
    const current = sortedData[0];
    const lastYear = sortedData.find(entry => {
      const currentDate = current ? new Date(current.date) : new Date();
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentDate.getMonth() &&
        entryDate.getFullYear() === currentDate.getFullYear() - 1;
    });

    const currentTotal = current ? current.electricityCost + current.gasCost : 0;
    const lastYearTotal = lastYear ? lastYear.electricityCost + lastYear.gasCost : 0;
    const difference = lastYearTotal ? ((currentTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

    return {
      current,
      currentTotal,
      lastYear,
      lastYearTotal,
      difference,
    };
  }, [consumption]);

  const handleAddEntry = () => {
    const date = new Date(newEntry.date + '-01').getTime();

    onAddEntry({
      itemId,
      date,
      electricityCost: parseFloat(newEntry.electricityCost) || 0,
      electricityKwh: parseFloat(newEntry.electricityKwh) || undefined,
      gasCost: parseFloat(newEntry.gasCost) || 0,
      gasM3: parseFloat(newEntry.gasM3) || undefined,
    });

    setNewEntry({
      date: new Date().toISOString().slice(0, 7),
      electricityCost: '',
      electricityKwh: '',
      gasCost: '',
      gasM3: '',
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
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Icons.Zap size={16} className="text-yellow-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Énergie</p>
            <p className={`text-xs ${textSecondary}`}>
              {stats.currentTotal > 0 ? `${formatCurrency(stats.currentTotal)}/mois` : 'Aucune donnée'}
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
          {/* Current Month Stats */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {/* Electricity */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icons.Lightbulb size={12} className="text-yellow-400" />
                <span className={`text-[10px] uppercase font-bold ${textSecondary}`}>
                  Électricité
                </span>
              </div>
              <p className="text-lg font-bold text-yellow-500">
                {stats.current ? formatCurrency(stats.current.electricityCost) : '—'}
              </p>
              {stats.current?.electricityKwh && (
                <p className={`text-[10px] ${textSecondary}`}>
                  {stats.current.electricityKwh} kWh
                </p>
              )}
            </div>

            {/* Gas */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icons.Flame size={12} className="text-blue-400" />
                <span className={`text-[10px] uppercase font-bold ${textSecondary}`}>
                  Gaz
                </span>
              </div>
              <p className="text-lg font-bold text-blue-500">
                {stats.current ? formatCurrency(stats.current.gasCost) : '—'}
              </p>
              {stats.current?.gasM3 && (
                <p className={`text-[10px] ${textSecondary}`}>
                  {stats.current.gasM3} m³
                </p>
              )}
            </div>
          </div>

          {/* Year Comparison */}
          {stats.lastYear && (
            <div className={`mx-4 mb-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textSecondary}`}>vs. même mois l'an dernier</span>
                <span className={`text-sm font-bold ${stats.difference <= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                  {stats.difference > 0 ? '+' : ''}{stats.difference.toFixed(1)}%
                </span>
              </div>
              <p className={`text-[10px] ${textSecondary} mt-1`}>
                N-1: {formatCurrency(stats.lastYearTotal)}
              </p>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="px-4 pb-3 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="electricityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: chartColors.text }}
                    axisLine={{ stroke: chartColors.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: chartColors.text }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="electricity"
                    name="Électricité"
                    stroke="#facc15"
                    fill="url(#electricityGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="gas"
                    name="Gaz"
                    stroke="#3b82f6"
                    fill="url(#gasGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Add Entry Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              <div className="pt-3 space-y-2">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Mois</label>
                  <input
                    type="month"
                    value={newEntry.date}
                    onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Électricité (€)</label>
                    <input
                      type="number"
                      placeholder="85"
                      value={newEntry.electricityCost}
                      onChange={e => setNewEntry(prev => ({ ...prev, electricityCost: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>kWh (optionnel)</label>
                    <input
                      type="number"
                      placeholder="450"
                      value={newEntry.electricityKwh}
                      onChange={e => setNewEntry(prev => ({ ...prev, electricityKwh: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Gaz (€)</label>
                    <input
                      type="number"
                      placeholder="65"
                      value={newEntry.gasCost}
                      onChange={e => setNewEntry(prev => ({ ...prev, gasCost: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>m³ (optionnel)</label>
                    <input
                      type="number"
                      placeholder="80"
                      value={newEntry.gasM3}
                      onChange={e => setNewEntry(prev => ({ ...prev, gasM3: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
                    />
                  </div>
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
                    onClick={handleAddEntry}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-yellow-500 text-black hover:bg-yellow-400"
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
                Ajouter une facture
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnergyWidget;
