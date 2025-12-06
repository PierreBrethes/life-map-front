import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { PropertyValuation } from '../../types';

interface PropertyWidgetProps {
  valuation: PropertyValuation | null;
  onUpdateValuation: (valuation: Partial<PropertyValuation>) => void;
  onCreateValuation: (valuation: Omit<PropertyValuation, 'id'>) => void;
  itemId: string;
  isDark: boolean;
}

const PropertyWidget: React.FC<PropertyWidgetProps> = ({
  valuation,
  onUpdateValuation,
  onCreateValuation,
  itemId,
  isDark,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    estimatedValue: valuation?.estimatedValue?.toString() || '',
    purchasePrice: valuation?.purchasePrice?.toString() || '',
    purchaseDate: valuation?.purchaseDate
      ? new Date(valuation.purchaseDate).toISOString().split('T')[0]
      : '',
    loanAmount: valuation?.loanAmount?.toString() || '',
    loanMonthlyPayment: valuation?.loanMonthlyPayment?.toString() || '',
    loanInterestRate: valuation?.loanInterestRate?.toString() || '',
    loanDurationMonths: valuation?.loanDurationMonths?.toString() || '',
    capitalRepaid: valuation?.capitalRepaid?.toString() || '',
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

  // Calculate derived values
  const calculations = useMemo(() => {
    if (!valuation) return null;

    const capitalRemaining = valuation.loanAmount
      ? valuation.loanAmount - (valuation.capitalRepaid || 0)
      : 0;

    const equity = valuation.estimatedValue - capitalRemaining;
    const appreciation = valuation.estimatedValue - valuation.purchasePrice;
    const appreciationPercent = ((appreciation / valuation.purchasePrice) * 100).toFixed(1);

    const loanProgress = valuation.loanAmount && valuation.capitalRepaid
      ? (valuation.capitalRepaid / valuation.loanAmount) * 100
      : 0;

    return {
      capitalRemaining,
      equity,
      appreciation,
      appreciationPercent,
      loanProgress,
    };
  }, [valuation]);

  const handleSave = () => {
    const data = {
      itemId,
      estimatedValue: parseFloat(formData.estimatedValue) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).getTime() : Date.now(),
      loanAmount: parseFloat(formData.loanAmount) || undefined,
      loanMonthlyPayment: parseFloat(formData.loanMonthlyPayment) || undefined,
      loanInterestRate: parseFloat(formData.loanInterestRate) || undefined,
      loanDurationMonths: parseInt(formData.loanDurationMonths) || undefined,
      capitalRepaid: parseFloat(formData.capitalRepaid) || undefined,
    };

    if (valuation) {
      onUpdateValuation(data);
    } else {
      onCreateValuation(data);
    }
    setShowEditForm(false);
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
            <Icons.Home size={16} className="text-indigo-400" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Patrimoine</p>
            <p className={`text-xs ${textSecondary}`}>
              {valuation ? formatCurrency(valuation.estimatedValue) : 'Non configuré'}
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
          {valuation && calculations ? (
            <>
              {/* Value Cards */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {/* Estimated Value */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icons.TrendingUp size={12} className="text-emerald-400" />
                    <span className={`text-[10px] uppercase font-bold ${textSecondary}`}>
                      Valeur estimée
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-500">
                    {formatCurrency(valuation.estimatedValue)}
                  </p>
                  <p className={`text-[10px] ${calculations.appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {calculations.appreciation >= 0 ? '+' : ''}{calculations.appreciationPercent}% depuis achat
                  </p>
                </div>

                {/* Equity */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icons.Wallet size={12} className="text-indigo-400" />
                    <span className={`text-[10px] uppercase font-bold ${textSecondary}`}>
                      Valeur nette
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(calculations.equity)}
                  </p>
                  <p className={`text-[10px] ${textSecondary}`}>
                    Valeur - Capital restant
                  </p>
                </div>
              </div>

              {/* Loan Progress (if applicable) */}
              {valuation.loanAmount && valuation.loanAmount > 0 && (
                <div className={`px-4 pb-4`}>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Icons.Landmark size={12} className="text-amber-400" />
                        <span className={`text-xs font-medium ${textPrimary}`}>Crédit immobilier</span>
                      </div>
                      <span className={`text-xs font-bold ${textSecondary}`}>
                        {calculations.loanProgress.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-600/30 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, calculations.loanProgress)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px]">
                      <span className="text-emerald-400">
                        Remboursé: {formatCurrency(valuation.capitalRepaid || 0)}
                      </span>
                      <span className="text-red-400">
                        Restant: {formatCurrency(calculations.capitalRemaining)}
                      </span>
                    </div>

                    {valuation.loanMonthlyPayment && (
                      <p className={`text-[10px] mt-2 ${textSecondary}`}>
                        Mensualité: {formatCurrency(valuation.loanMonthlyPayment)}/mois
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowEditForm(true)}
                  className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                      ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icons.Pencil size={14} />
                  Modifier les informations
                </button>
              </div>
            </>
          ) : showEditForm ? null : (
            <div className="p-4">
              <button
                onClick={() => setShowEditForm(true)}
                className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${isDark
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }`}
              >
                <Icons.Plus size={16} />
                Configurer le patrimoine
              </button>
            </div>
          )}

          {/* Edit Form */}
          {showEditForm && (
            <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
              <div className="pt-3 space-y-3">
                <p className={`text-xs font-semibold ${textPrimary}`}>Informations du bien</p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Valeur estimée (€)</label>
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={e => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="250000"
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Prix d'achat (€)</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="200000"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] ${textSecondary}`}>Date d'achat</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={e => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                  />
                </div>

                <p className={`text-xs font-semibold ${textPrimary} pt-2`}>Crédit immobilier (optionnel)</p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Montant emprunté (€)</label>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={e => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="180000"
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Capital remboursé (€)</label>
                    <input
                      type="number"
                      value={formData.capitalRepaid}
                      onChange={e => setFormData(prev => ({ ...prev, capitalRepaid: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="45000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Mensualité (€)</label>
                    <input
                      type="number"
                      value={formData.loanMonthlyPayment}
                      onChange={e => setFormData(prev => ({ ...prev, loanMonthlyPayment: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="850"
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] ${textSecondary}`}>Durée (mois)</label>
                    <input
                      type="number"
                      value={formData.loanDurationMonths}
                      onChange={e => setFormData(prev => ({ ...prev, loanDurationMonths: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${textPrimary} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                      placeholder="240"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyWidget;
