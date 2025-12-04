import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Category, ItemType, ItemStatus, AssetType } from '../types';
import { suggestAttributes } from '../utils/ai';
import { getAssetsForCategory, ASSET_MAPPING } from '../utils/assetMapping';
import AssetCarousel from './AssetCarousel';

export type ModalMode = 'category' | 'item' | null;

interface CreationModalProps {
  mode: ModalMode;
  categories: Category[];
  initialCategory?: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isDarkMode?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];

const CreationModal: React.FC<CreationModalProps> = ({ mode, categories, initialCategory, onClose, onSave, isDarkMode = false }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || (categories.length > 0 ? categories[0].category : ''));

  const [type, setType] = useState<ItemType>('text');
  const [status, setStatus] = useState<ItemStatus>('ok');
  const [assetType, setAssetType] = useState<AssetType>('default');
  const [iconName, setIconName] = useState<string>('Box');

  const [isSuggesting, setIsSuggesting] = useState(false);

  // Theme-based styles (like UIOverlay)
  const modalBgClass = isDarkMode
    ? "bg-slate-900 border-slate-700"
    : "bg-white border-gray-100";

  const previewBgClass = isDarkMode
    ? "bg-slate-800"
    : "bg-gray-100";

  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-gray-500";

  const inputClass = isDarkMode
    ? "bg-slate-800 border-slate-700 focus:border-indigo-500 focus:ring-indigo-900 text-white placeholder-slate-500"
    : "bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-200 text-gray-900 placeholder-gray-400";

  const buttonHoverClass = isDarkMode
    ? "hover:bg-slate-800 text-slate-500 hover:text-slate-300"
    : "hover:bg-gray-100 text-gray-400 hover:text-gray-600";

  const magicButtonClass = isDarkMode
    ? "bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-400"
    : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600";

  useEffect(() => {
    setName('');
    setValue('');
    setType('text');
    setStatus('ok');
    setAssetType('default');
    setIconName('Box');
    if (initialCategory) setSelectedCategory(initialCategory);
    else if (categories.length > 0) setSelectedCategory(categories[0].category);
  }, [mode, initialCategory, categories]);

  // Compute available assets based on selected category
  const availableAssets = useMemo(() => {
    return getAssetsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Determine current color for preview
  const currentColor = useMemo(() => {
    if (mode === 'category') return selectedColor;
    const cat = categories.find(c => c.category === selectedCategory);
    return cat ? cat.color : '#6366f1';
  }, [mode, selectedColor, selectedCategory, categories]);

  // Auto-select first asset type if current one is not in the list (when category changes)
  useEffect(() => {
    if (availableAssets.length > 0) {
      const isCurrentValid = availableAssets.some(a => a.value === assetType);
      if (!isCurrentValid) {
        setAssetType(availableAssets[0].value);
      }
    }
  }, [availableAssets, assetType]);


  // AI Suggestion Trigger
  const handleMagicSuggest = async () => {
    if (!name) return;
    setIsSuggesting(true);
    const result = await suggestAttributes(name, mode === 'category' ? 'category' : 'item');

    if (result) {
      if (result.color) setSelectedColor(result.color);
      if (result.icon) setIconName(result.icon);
      if (result.assetType) {
        setAssetType(result.assetType as AssetType);
      }
    }
    setIsSuggesting(false);
  };

  if (!mode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const id = Math.random().toString(36).substr(2, 9);

    if (mode === 'category') {
      onSave({ category: name, color: selectedColor, icon: iconName, items: [] });
    } else {
      onSave({
        categoryName: selectedCategory,
        item: {
          id,
          name,
          value: value || '0',
          type,
          status,
          assetType,
          lastUpdated: Date.now()
        }
      });
    }
    onClose();
  };


  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300">
      {mode === 'category' ? (
        // CATEGORY MODE - Original vertical layout
        <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 m-4 transform transition-all ring-1 animate-in zoom-in-95 fade-in duration-300 ${modalBgClass} ${isDarkMode ? 'ring-white/10' : 'ring-black/5'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
              Nouvelle Île
            </h2>
            <button onClick={onClose} className={`p-1 rounded-full ${buttonHoverClass}`}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textSecondary}`}>
                Type d'île
              </label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all font-medium ${inputClass}`}
                autoFocus
              >
                <option value="">Sélectionner un type...</option>
                {Object.keys(ASSET_MAPPING).map((islandType) => (
                  <option key={islandType} value={islandType}>
                    {islandType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textSecondary}`}>Couleur</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${selectedColor === c ? 'ring-gray-400 scale-110' : 'ring-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              <Check size={18} />
              <span>Créer</span>
            </button>
          </form>
        </div>
      ) : (
        // ITEM MODE - New 2-column layout inspired by the image
        <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden m-4 transform transition-all ring-1 animate-in zoom-in-95 fade-in duration-300 ${isDarkMode ? 'ring-white/10' : 'ring-black/5'}`}>
          <div className="flex h-[600px]">
            {/* LEFT SIDE - 3D Preview */}
            <div className={`w-1/2 relative ${previewBgClass}`}>
              {/* 3D Asset Preview - Full height */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AssetCarousel
                  assets={availableAssets}
                  selectedAsset={assetType}
                  onSelect={setAssetType}
                  color={currentColor}
                />
              </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className={`w-1/2 flex flex-col ${modalBgClass}`}>
              {/* Close button */}
              <div className="flex justify-end p-4">
                <button onClick={onClose} className={`p-2 rounded-full ${buttonHoverClass}`}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-8 pb-8">
                <div className="flex-1 space-y-6">
                  {/* Name Input */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                      Nom du bloc
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Épargne Bitcoin"
                        className={`flex-1 px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all font-medium ${inputClass}`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleMagicSuggest}
                        disabled={!name || isSuggesting}
                        className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 ${magicButtonClass}`}
                        title="Suggestions IA"
                      >
                        {isSuggesting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                      Île
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none appearance-none font-medium ${inputClass}`}
                      >
                        {categories.map(cat => (
                          <option key={cat.category} value={cat.category}>{cat.category}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none ${textSecondary}`} size={16} />
                    </div>
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                      Valeur
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold ${textPrimary}`}>
                        €
                      </span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="15,000"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all font-medium text-lg ${inputClass}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!name}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={22} />
                  <span>Placer le bloc</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreationModal;
