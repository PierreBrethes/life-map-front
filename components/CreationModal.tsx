
import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Category, ItemType, ItemStatus, AssetType } from '../types';
import { suggestAttributes } from '../utils/ai';

export type ModalMode = 'category' | 'item' | null;

interface CreationModalProps {
  mode: ModalMode;
  categories: Category[];
  initialCategory?: string | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6'];

const CreationModal: React.FC<CreationModalProps> = ({ mode, categories, initialCategory, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || (categories.length > 0 ? categories[0].category : ''));
  
  const [type, setType] = useState<ItemType>('text');
  const [status, setStatus] = useState<ItemStatus>('ok');
  const [assetType, setAssetType] = useState<AssetType>('default');
  const [iconName, setIconName] = useState<string>('Box');

  const [isSuggesting, setIsSuggesting] = useState(false);

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

  // AI Suggestion Trigger
  const handleMagicSuggest = async () => {
    if (!name) return;
    setIsSuggesting(true);
    const result = await suggestAttributes(name, mode === 'category' ? 'category' : 'item');
    
    if (result) {
        if (result.color) setSelectedColor(result.color);
        if (result.icon) setIconName(result.icon);
        if (result.assetType) setAssetType(result.assetType as AssetType);
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 m-4 transform transition-all ring-1 ring-black/5 animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             {mode === 'category' ? 'Nouvelle Île' : 'Nouveau Bloc'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Input with Magic Wand */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {mode === 'category' ? "Nom de l'île" : "Nom du bloc"}
            </label>
            <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sport, Tennis, Bitcoin..."
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                  autoFocus
                />
                <button 
                    type="button"
                    onClick={handleMagicSuggest}
                    disabled={!name || isSuggesting}
                    className="px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    title="Suggestions IA"
                >
                    {isSuggesting ? <Loader2 size={20} className="animate-spin"/> : <Sparkles size={20}/>}
                </button>
            </div>
          </div>

          {/* --- CATEGORY MODE --- */}
          {mode === 'category' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Couleur</label>
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
            </>
          )}

          {/* --- ITEM MODE --- */}
          {mode === 'item' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Île</label>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none text-gray-900 font-medium text-sm"
                        >
                            {categories.map(cat => (
                                <option key={cat.category} value={cat.category}>{cat.category}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                   <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                    <div className="relative">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none text-gray-900 font-medium text-sm"
                        >
                            <option value="text">Texte / Info</option>
                            <option value="currency">Montant (€/$)</option>
                            <option value="percentage">Pourcentage (%)</option>
                            <option value="date">Date</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valeur</label>
                    <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Valeur..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Modèle 3D</label>
                    <div className="relative">
                        <select
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value as AssetType)}
                            className="w-full px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none text-gray-900 font-medium text-sm"
                        >
                            <option value="default">Défaut</option>
                            <option value="people">Personne / Humain</option>
                            <option value="sport">Sport (Haltère/Balle)</option>
                            <option value="tech">Tech (Écran)</option>
                            <option value="travel">Voyage (Avion)</option>
                            <option value="home">Maison</option>
                            <option value="health">Santé</option>
                            <option value="nature">Nature</option>
                            <option value="finance">Finance</option>
                        </select>
                         <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
              </div>

               <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">État</label>
                <div className="flex gap-2">
                    {[
                        { val: 'ok', label: 'Normal', color: 'bg-gray-100 text-gray-600 border-gray-200' },
                        { val: 'warning', label: 'Alerte', color: 'bg-amber-50 text-amber-600 border-amber-200' },
                        { val: 'critical', label: 'Critique', color: 'bg-red-50 text-red-600 border-red-200' }
                    ].map((opt) => (
                         <button
                            key={opt.val}
                            type="button"
                            onClick={() => setStatus(opt.val as any)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${opt.color} ${status === opt.val ? 'ring-2 ring-offset-1 ring-indigo-500' : 'opacity-70 hover:opacity-100'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
              </div>
            </>
          )}

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
    </div>
  );
};

export default CreationModal;
