import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem, HistoryEntry, Subscription } from '../../types';
import { useFinanceBalance, formatCurrency } from '../../hooks/useFinanceBalance';

// Real estate asset types
const REAL_ESTATE_TYPES = ['house', 'apartment'];

// Garage/Vehicle asset types
const GARAGE_TYPES = ['car', 'motorbike', 'boat', 'plane'];

interface SidebarHeaderProps {
  categoryName: string;
  categoryIcon?: string;
  categoryColor: string;
  item: LifeItem;
  onDelete: () => void;
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateValue: (value: string) => void;
  onUpdateItem: (updates: Partial<LifeItem>) => void;
  onResetBalance: () => void;
  isDark: boolean;
  // Finance-specific props
  isFinanceType: boolean;
  history: HistoryEntry[];
  subscriptions: Subscription[];
  onToggleSyncBalance: (sync: boolean) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  categoryName,
  categoryIcon = 'Star',
  categoryColor,
  item,
  onDelete,
  onClose,
  onUpdateName,
  onUpdateValue,
  onUpdateItem,
  onResetBalance,
  isDark,
  isFinanceType,
  history,
  subscriptions,
  onToggleSyncBalance,
}) => {
  // Check asset type
  const isRealEstate = item.assetType && REAL_ESTATE_TYPES.includes(item.assetType);
  const isGarage = item.assetType && GARAGE_TYPES.includes(item.assetType);

  // Editable states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingRent, setIsEditingRent] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingMileage, setIsEditingMileage] = useState(false);

  const [editName, setEditName] = useState(item.name);
  const [editValue, setEditValue] = useState(item.value);
  const [editRent, setEditRent] = useState(item.rentAmount?.toString() || '');
  const [editRentDay, setEditRentDay] = useState(item.rentDueDay?.toString() || '1');
  const [editAddress, setEditAddress] = useState(item.address || '');
  const [editCity, setEditCity] = useState(item.city || '');
  const [editPostalCode, setEditPostalCode] = useState(item.postalCode || '');
  const [editMileage, setEditMileage] = useState(item.mileage?.toString() || '');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  // Track the item id to detect when we switch blocks
  const prevItemIdRef = useRef(item.id);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect block change and mark as transitioning
  useEffect(() => {
    if (prevItemIdRef.current !== item.id) {
      setIsTransitioning(true);
      prevItemIdRef.current = item.id;
      // Reset edit states
      setIsEditingRent(false);
      setIsEditingAddress(false);
      setIsEditingMileage(false);
      // Allow transition to complete before enabling sync
      const timer = setTimeout(() => setIsTransitioning(false), 100);
      return () => clearTimeout(timer);
    }
  }, [item.id]);

  // Use centralized finance balance hook
  const { formattedBalance, formattedForecast, isNegativeForecast, balance } = useFinanceBalance(
    isFinanceType ? item : null,
    history,
    subscriptions
  );

  // Sync balance with block value when enabled
  useEffect(() => {
    if (isTransitioning) return;
    if (isFinanceType && item.syncBalanceWithBlock) {
      if (formattedBalance !== item.value) {
        onUpdateValue(formattedBalance);
      }
    }
  }, [isFinanceType, item.syncBalanceWithBlock, formattedBalance, isTransitioning]);

  // Sync edit states with props
  useEffect(() => {
    setEditName(item.name);
  }, [item.name]);

  useEffect(() => {
    setEditValue(item.value);
  }, [item.value]);

  useEffect(() => {
    setEditRent(item.rentAmount?.toString() || '');
    setEditRentDay(item.rentDueDay?.toString() || '1');
  }, [item.rentAmount, item.rentDueDay]);

  useEffect(() => {
    setEditAddress(item.address || '');
    setEditCity(item.city || '');
    setEditPostalCode(item.postalCode || '');
  }, [item.address, item.city, item.postalCode]);

  useEffect(() => {
    setEditMileage(item.mileage?.toString() || '');
  }, [item.mileage]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [isEditingValue]);

  // Dynamic icon loading
  const IconComponent = (Icons as any)[categoryIcon] || Icons.Star;

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-slate-700/50' : 'bg-gray-100';
  const inputBorder = isDark ? 'border-slate-600' : 'border-gray-300';

  // Handle name save
  const handleSaveName = () => {
    if (editName.trim() && editName !== item.name) {
      onUpdateName(editName.trim());
    } else {
      setEditName(item.name);
    }
    setIsEditingName(false);
  };

  // Handle value save
  const handleSaveValue = () => {
    if (editValue.trim() && editValue !== item.value) {
      onUpdateValue(editValue.trim());
    } else {
      setEditValue(item.value);
    }
    setIsEditingValue(false);
  };

  // Handle rent save
  const handleSaveRent = () => {
    const rentAmount = parseFloat(editRent) || undefined;
    const rentDueDay = parseInt(editRentDay) || 1;
    onUpdateItem({ rentAmount, rentDueDay: Math.min(31, Math.max(1, rentDueDay)) });
    setIsEditingRent(false);
  };

  // Handle address save
  const handleSaveAddress = () => {
    onUpdateItem({
      address: editAddress.trim() || undefined,
      city: editCity.trim() || undefined,
      postalCode: editPostalCode.trim() || undefined,
    });
    setIsEditingAddress(false);
  };

  // Handle mileage save
  const handleSaveMileage = () => {
    const mileage = parseInt(editMileage) || undefined;
    onUpdateItem({ mileage });
    setIsEditingMileage(false);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent, saveHandler: () => void, cancelHandler: () => void) => {
    if (e.key === 'Enter') {
      saveHandler();
    } else if (e.key === 'Escape') {
      cancelHandler();
    }
  };

  // Calculate days until rent is due
  const getDaysUntilRent = () => {
    if (!item.rentDueDay) return null;
    const now = new Date();
    const currentDay = now.getDate();
    const dueDay = item.rentDueDay;

    let daysUntil = dueDay - currentDay;
    if (daysUntil < 0) {
      // Next month
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
      daysUntil = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
    return daysUntil;
  };

  return (
    <div className={`p-6 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
      {/* Top row: Category badge + Actions */}
      <div className="flex items-start justify-between mb-4">
        {/* Category Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: isDark ? `${categoryColor}20` : `${categoryColor}15`,
            color: categoryColor
          }}
        >
          <IconComponent size={12} />
          <span>{categoryName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition-colors ${isDark
              ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400'
              : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
              }`}
            title="Supprimer"
          >
            <Icons.Trash2 size={18} />
          </button>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-400 hover:text-gray-800'
              }`}
            title="Fermer"
          >
            <Icons.X size={18} />
          </button>
        </div>
      </div>

      {/* Item Name - Editable */}
      <div className="mb-3">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => handleKeyDown(e, handleSaveName, () => {
                setEditName(item.name);
                setIsEditingName(false);
              })}
              className={`flex-1 text-2xl font-bold px-2 py-1 rounded-lg border ${inputBg} ${inputBorder} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
            />
          </div>
        ) : (
          <div
            className="group flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditingName(true)}
          >
            <h2 className={`text-2xl font-bold leading-tight ${textPrimary}`}>
              {item.name}
            </h2>
            <Icons.Pencil
              size={14}
              className={`opacity-0 group-hover:opacity-100 transition-opacity ${textSecondary}`}
            />
          </div>
        )}
      </div>

      {/* === FINANCE TYPE: Balance and Forecast Cards === */}
      {isFinanceType && (
        <>
          <div className="flex gap-3 mb-3">
            {/* Current Balance Card */}
            <div className="flex-1 p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700">
              <div className="flex items-center gap-1.5 mb-1 text-emerald-200">
                <Icons.Wallet size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Solde Actuel</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formattedBalance}
              </div>
            </div>

            {/* Forecast Card */}
            <div className={`flex-1 p-3 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-700/90'}`}>
              <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                <Icons.TrendingDown size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Prévu (7j)</span>
              </div>
              <div className={`text-xl font-bold ${isNegativeForecast ? 'text-red-400' : 'text-white'}`}>
                {formattedForecast}
              </div>
            </div>
          </div>

          {/* Debug info - initial balance */}
          {item.initialBalance !== undefined && (
            <div className={`text-[10px] mb-2 ${textSecondary}`}>
              Solde initial: {formatCurrency(item.initialBalance)}
              <button
                onClick={onResetBalance}
                className="ml-2 text-red-400 hover:text-red-300 underline"
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Sync Toggle */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl mb-4 cursor-pointer transition-colors ${isDark ? 'bg-slate-800/50 hover:bg-slate-800/70' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            onClick={() => onToggleSyncBalance(!item.syncBalanceWithBlock)}
          >
            <div className="flex items-center gap-2">
              <Icons.RefreshCw size={14} className={item.syncBalanceWithBlock ? 'text-emerald-400' : textSecondary} />
              <span className={`text-xs font-medium ${textPrimary}`}>
                Afficher sur le bloc 3D
              </span>
            </div>
            <button
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.syncBalanceWithBlock ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.syncBalanceWithBlock ? 'translate-x-5' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </>
      )}

      {/* === REAL ESTATE TYPE: Rent and Address Cards === */}
      {isRealEstate && (
        <>
          <div className="flex gap-3 mb-3">
            {/* Rent Card */}
            <div
              className={`flex-1 p-3 rounded-xl cursor-pointer transition-all ${isEditingRent
                ? 'ring-2 ring-amber-500/50'
                : 'hover:ring-1 hover:ring-slate-500/30'
                } ${isDark ? 'bg-gradient-to-br from-amber-600/80 to-amber-700/80' : 'bg-gradient-to-br from-amber-500 to-amber-600'}`}
              onClick={() => !isEditingRent && setIsEditingRent(true)}
            >
              {isEditingRent ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-200">
                    <Icons.Euro size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Loyer mensuel</span>
                  </div>
                  <input
                    type="number"
                    value={editRent}
                    onChange={(e) => setEditRent(e.target.value)}
                    placeholder="850"
                    className="w-full px-2 py-1 rounded-lg text-sm bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-200">Dû le</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editRentDay}
                      onChange={(e) => setEditRentDay(e.target.value)}
                      className="w-12 px-2 py-0.5 rounded text-xs bg-white/20 text-white border border-white/20 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-200">du mois</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditingRent(false); }}
                      className="flex-1 py-1 rounded text-[10px] font-medium bg-white/20 text-white"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveRent(); }}
                      className="flex-1 py-1 rounded text-[10px] font-medium bg-white text-amber-700"
                    >
                      OK
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-amber-200">
                      <Icons.Euro size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Loyer</span>
                    </div>
                    <Icons.Pencil size={10} className="text-amber-200/50" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {item.rentAmount ? formatCurrency(item.rentAmount) : '—'}
                  </div>
                  {item.rentDueDay && (
                    <div className="text-[10px] text-amber-200 mt-0.5">
                      Dû le {item.rentDueDay} • {getDaysUntilRent() === 0 ? "Aujourd'hui" : `Dans ${getDaysUntilRent()}j`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Address Card */}
            <div
              className={`flex-1 p-3 rounded-xl cursor-pointer transition-all ${isEditingAddress
                ? 'ring-2 ring-indigo-500/50'
                : 'hover:ring-1 hover:ring-slate-500/30'
                } ${isDark ? 'bg-slate-800/80' : 'bg-slate-700/90'}`}
              onClick={() => !isEditingAddress && setIsEditingAddress(true)}
            >
              {isEditingAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Icons.MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Adresse</span>
                  </div>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="12 rue de la Paix"
                    className={`w-full px-2 py-1 rounded-lg text-xs ${inputBg} ${textPrimary} border ${inputBorder} focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editPostalCode}
                      onChange={(e) => setEditPostalCode(e.target.value)}
                      placeholder="75001"
                      className={`w-16 px-2 py-1 rounded-lg text-xs ${inputBg} ${textPrimary} border ${inputBorder} focus:outline-none`}
                    />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="Paris"
                      className={`flex-1 px-2 py-1 rounded-lg text-xs ${inputBg} ${textPrimary} border ${inputBorder} focus:outline-none`}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditingAddress(false); }}
                      className={`flex-1 py-1 rounded text-[10px] font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveAddress(); }}
                      className="flex-1 py-1 rounded text-[10px] font-medium bg-indigo-500 text-white"
                    >
                      OK
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Icons.MapPin size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Adresse</span>
                    </div>
                    <Icons.Pencil size={10} className="text-slate-500/50" />
                  </div>
                  {item.address || item.city ? (
                    <>
                      <div className={`text-sm font-medium ${textPrimary} truncate`}>
                        {item.address || '—'}
                      </div>
                      <div className={`text-xs ${textSecondary} truncate`}>
                        {[item.postalCode, item.city].filter(Boolean).join(' ') || '—'}
                      </div>
                    </>
                  ) : (
                    <div className={`text-sm ${textSecondary}`}>
                      Cliquer pour ajouter
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
      {/* === OTHER TYPES: Simple editable value (excludes finance, real estate, and garage) === */}
      {!isFinanceType && !isRealEstate && !isGarage && (
        <div className="mb-4">
          {isEditingValue ? (
            <div className="flex items-center gap-2">
              <input
                ref={valueInputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveValue}
                onKeyDown={(e) => handleKeyDown(e, handleSaveValue, () => {
                  setEditValue(item.value);
                  setIsEditingValue(false);
                })}
                className={`w-full text-xl font-semibold px-2 py-1 rounded-lg border ${inputBg} ${inputBorder} text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
              />
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditingValue(true)}
            >
              <span className="text-xl font-semibold text-indigo-500">
                {item.value}
              </span>
              <Icons.Pencil
                size={12}
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${textSecondary}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
