import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { BodyMetric } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BodyTrackingWidgetProps {
  metrics: BodyMetric[];
  latestMetric: BodyMetric | null;
  bmi: string | null;
  weightTrend: { value: string; direction: string; percentage: string } | null;
  onAddMetric: (metric: Omit<BodyMetric, 'id'>) => void;
  onDeleteMetric: (id: string) => void;
  itemId: string;
  isDark: boolean;
}

const BodyTrackingWidget: React.FC<BodyTrackingWidgetProps> = ({
  metrics,
  latestMetric,
  bmi,
  weightTrend,
  onAddMetric,
  onDeleteMetric,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChart, setShowChart] = useState(true);

  const [newEntry, setNewEntry] = useState({
    weight: '',
    height: latestMetric?.height?.toString() || '',
    bodyFat: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgClass = isDark ? 'bg-slate-800/50' : 'bg-white';
  const borderClass = isDark ? 'border-slate-700/50' : 'border-gray-100';
  const cardBg = isDark ? 'bg-slate-700/30' : 'bg-gray-50';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-50';

  // Chart Data preparation
  const chartData = useMemo(() => {
    return metrics
      .slice(-10) // Last 10 entries
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        weight: m.weight,
        fat: m.bodyFat,
      }));
  }, [metrics]);

  const handleAdd = () => {
    onAddMetric({
      itemId,
      date: new Date(newEntry.date).getTime(),
      weight: parseFloat(newEntry.weight),
      height: newEntry.height ? parseFloat(newEntry.height) : undefined,
      bodyFat: newEntry.bodyFat ? parseFloat(newEntry.bodyFat) : undefined,
    });
    setNewEntry(prev => ({
      ...prev,
      weight: '',
      bodyFat: '',
    }));
    setShowAddForm(false);
  };

  const getBmiColor = (bmiVal: number) => {
    if (bmiVal < 18.5) return 'text-blue-400';
    if (bmiVal < 25) return 'text-green-400';
    if (bmiVal < 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBmiLabel = (bmiVal: number) => {
    if (bmiVal < 18.5) return 'Maigreur';
    if (bmiVal < 25) return 'Normal';
    if (bmiVal < 30) return 'Surpoids';
    return 'Obésité';
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
            <Icons.Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Suivi Corporel</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${textPrimary}`}>
                {latestMetric ? `${latestMetric.weight} kg` : '—'}
              </span>
              {weightTrend && (
                <span className={`text-[10px] flex items-center ${weightTrend.direction === 'down' ? 'text-green-400' :
                    weightTrend.direction === 'up' ? 'text-orange-400' : 'text-slate-400'
                  }`}>
                  {weightTrend.direction === 'down' ? <Icons.TrendingDown size={10} /> :
                    weightTrend.direction === 'up' ? <Icons.TrendingUp size={10} /> : <Icons.Minus size={10} />}
                  {weightTrend.value}
                </span>
              )}
            </div>
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

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-px bg-slate-700/20">
            {/* BMI Card */}
            <div className={`p-4 ${cardBg}`}>
              <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${textSecondary}`}>IMC</div>
              {bmi ? (
                <>
                  <div className={`text-lg font-bold ${getBmiColor(parseFloat(bmi))}`}>{bmi}</div>
                  <div className={`text-[10px] font-medium ${getBmiColor(parseFloat(bmi))}`}>
                    {getBmiLabel(parseFloat(bmi))}
                  </div>
                </>
              ) : (
                <div className={`text-xs ${textSecondary}`}>Ajouter taille & poids</div>
              )}
            </div>

            {/* Fat / Height Card */}
            <div className={`p-4 ${cardBg}`}>
              <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${textSecondary}`}>Infos</div>
              <div className="space-y-1">
                {latestMetric?.height && (
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] ${textSecondary}`}>Taille</span>
                    <span className={`text-xs font-medium ${textPrimary}`}>{latestMetric.height} cm</span>
                  </div>
                )}
                {latestMetric?.bodyFat && (
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] ${textSecondary}`}>Gras</span>
                    <span className={`text-xs font-medium ${textPrimary}`}>{latestMetric.bodyFat}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart Toggle */}
          <div className="px-4 pt-4 pb-2 flex justify-end">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`text-[10px] flex items-center gap-1 ${textSecondary} hover:text-indigo-400`}
            >
              <Icons.LineChart size={12} />
              {showChart ? 'Masquer le graph' : 'Voir le graph'}
            </button>
          </div>

          {/* Chart */}
          {showChart && metrics.length > 1 && (
            <div className="h-40 px-2 pb-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis
                    hide
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Add Form */}
          {showAddForm ? (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'} pt-3 space-y-3`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEntry.weight}
                    onChange={e => setNewEntry(prev => ({ ...prev, weight: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                    placeholder="75.5"
                    autoFocus
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Taille (cm)</label>
                  <input
                    type="number"
                    value={newEntry.height}
                    onChange={e => setNewEntry(prev => ({ ...prev, height: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                    placeholder="180"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Masse grasse (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newEntry.bodyFat}
                    onChange={e => setNewEntry(prev => ({ ...prev, bodyFat: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Date</label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2`}
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
                  disabled={!newEntry.weight}
                  className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-500 text-white"
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
                Nouvelle pesée
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BodyTrackingWidget;
