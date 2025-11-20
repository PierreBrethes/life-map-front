
import React, { useState, useEffect } from 'react';
import { SelectionState, Category, ItemType, ItemStatus } from '../types';
import * as Icons from 'lucide-react'; // Dynamic Import all icons
import CreationModal, { ModalMode } from './CreationModal';

interface UIOverlayProps {
  selection: SelectionState | null;
  categories: Category[];
  onClose: () => void;
  onSaveNewElement: (data: any, mode: ModalMode) => void;
  onDelete: () => void;
  showConnections: boolean;
  onToggleConnections: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  selection, 
  categories, 
  onClose, 
  onSaveNewElement, 
  onDelete,
  showConnections,
  onToggleConnections
}) => {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeData, setActiveData] = useState<SelectionState | null>(null);

  useEffect(() => {
    if (selection) {
      setActiveData(selection);
    }
  }, [selection]);

  // Dynamic Icon Renderer
  const renderIcon = (iconName: string | undefined, fallback: any) => {
    if (!iconName) return fallback;
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) return <IconComponent className="w-5 h-5" />;
    return fallback;
  };

  const getCategoryIcon = (catName: string) => {
    const category = categories.find(c => c.category === catName);
    if (category?.icon) return <span className="text-indigo-600">{renderIcon(category.icon, <Icons.Box className="w-5 h-5" />)}</span>;

    switch (catName) {
      case 'Finances': return <Icons.Wallet className="w-5 h-5 text-indigo-600" />;
      case 'Santé': return <Icons.Activity className="w-5 h-5 text-emerald-600" />;
      case 'Immobilier': return <Icons.Home className="w-5 h-5 text-pink-600" />;
      case 'Famille': return <Icons.Users className="w-5 h-5 text-amber-600" />;
      default: return <Icons.Box className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: ItemType) => {
      switch(type) {
          case 'currency': return <Icons.Wallet size={14} className="text-gray-400" />;
          case 'percentage': return <Icons.Percent size={14} className="text-gray-400" />;
          case 'date': return <Icons.Calendar size={14} className="text-gray-400" />;
          default: return <Icons.FileText size={14} className="text-gray-400" />;
      }
  };

  const getStatusBadge = (status: ItemStatus) => {
      switch(status) {
          case 'critical': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full"><Icons.AlertTriangle size={10}/> Critique</span>;
          case 'warning': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full"><Icons.AlertTriangle size={10}/> Attention</span>;
          default: return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full"><Icons.CheckCircle size={10}/> Normal</span>;
      }
  };

  const formatValue = (val: string, type: ItemType) => {
    if (type === 'currency' && !val.includes('€') && !val.includes('$')) return val + '€';
    if (type === 'percentage' && !val.includes('%')) return val + '%';
    return val;
  };

  const handleSave = (data: any) => {
    onSaveNewElement(data, modalMode);
    setModalMode(null);
  };

  return (
    <>
        <CreationModal 
            mode={modalMode}
            categories={categories}
            initialCategory={selection?.categoryName}
            onClose={() => setModalMode(null)}
            onSave={handleSave}
        />

        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-gray-800">
            
        <div className="absolute top-6 left-6 pointer-events-auto">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Icons.Box className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">LifeMap</h1>
                    <p className="text-xs text-gray-500 font-medium">AI-Powered v3.0</p>
                </div>
            </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-auto pointer-events-auto z-40">
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-white/50 p-2 rounded-full shadow-xl ring-1 ring-gray-900/5">
                <button 
                    onClick={onToggleConnections}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 ${
                        showConnections 
                        ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' 
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                >
                    <Icons.Link size={18} />
                    <span>Liens</span>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button 
                    onClick={() => setModalMode('category')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 font-semibold text-sm transition-all active:scale-95"
                >
                    <Icons.Layers size={18} />
                    <span>Nouvelle Île</span>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button 
                    onClick={() => setModalMode('item')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-all shadow-lg shadow-gray-900/20 active:scale-95"
                >
                    <Icons.Plus size={18} />
                    <span>Ajouter Bloc</span>
                </button>
            </div>
        </div>

        <div
            className={`
            pointer-events-auto
            h-full w-80 sm:w-96
            absolute right-0 top-0
            bg-white/80 backdrop-blur-md
            border-l border-white/50 shadow-2xl
            transform transition-transform duration-500 ease-out
            ${selection ? 'translate-x-0' : 'translate-x-full'}
            flex flex-col
            z-40
            `}
        >
            {activeData && (
            <>
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-white/50">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(activeData.categoryName)}
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {activeData.categoryName}
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight break-words">
                    {activeData.item.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                        {getStatusBadge(activeData.item.status)}
                        <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                             {getTypeIcon(activeData.item.type)} {activeData.item.type}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600"
                        title="Supprimer"
                    >
                        <Icons.Trash2 size={20} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-800"
                        title="Fermer"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <p className="text-sm text-gray-400 mb-1 font-medium">Valeur Actuelle</p>
                    <p className="text-5xl font-bold text-gray-900 tracking-tight break-all">
                    {formatValue(activeData.item.value, activeData.item.type)}
                    </p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Actions</h3>
                    
                    <button className="w-full group flex items-center justify-between p-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Icons.Activity size={14} className="text-indigo-600"/>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-gray-800 font-semibold">Historique</p>
                            <p className="text-xs text-gray-500">Voir l'évolution</p>
                        </div>
                    </div>
                    <Icons.ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1"/>
                    </button>
                </div>

                </div>

                <div className="p-6 border-t border-gray-100 text-center bg-gray-50/50">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">ID: {activeData.item.id || 'LEGACY'}</span>
                </div>
            </>
            )}
        </div>
        </div>
    </>
  );
};

export default UIOverlay;
