import React, { useState, useEffect } from 'react';
import { SelectionState, Category, ItemType, ItemStatus, LifeItem, UserSettings } from '../types';
import * as Icons from 'lucide-react'; // Dynamic Import all icons
import CreationModal, { ModalMode } from './CreationModal';
import NotificationWidget from './NotificationWidget';
import { ItemDetailSidebar } from './sidebar';
import { useLifeMapMutations } from '../hooks/useLifeMapMutations';
import { useStore } from '../store/useStore';
import { useSettings } from '../hooks/useLifeMapData';

interface UIOverlayProps {
    categories: Category[];
    onSelect: (categoryName: string, item: LifeItem) => void;
    onUpdateItem: (categoryName: string, itemId: string, updates: Partial<LifeItem>) => void;
    onDelete: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
    categories,
    onSelect,
    onUpdateItem,
    onDelete,
}) => {
    // Global Store
    const {
        selection, setSelection,
        connectionMode, startConnection, cancelConnection,
        showConnections, toggleConnections
    } = useStore();

    // Data Hooks
    const { data: settingsData } = useSettings();
    const settings = settingsData || { theme: 'light', notificationsEnabled: true } as UserSettings;

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [activeData, setActiveData] = useState<SelectionState | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ categoryName: string, item: LifeItem }[]>([]);

    // Local state for edits
    const [customLabel, setCustomLabel] = useState('');

    // Value Editing State
    const [isEditingValue, setIsEditingValue] = useState(false);
    const [editValue, setEditValue] = useState('');

    const { updateSettings } = useLifeMapMutations();

    const isDark = settings.theme === 'dark';

    // Handler for closing sidebar
    const onClose = () => setSelection(null);

    // Styles based on theme
    const glassPanelClass = isDark
        ? "bg-slate-900/80 backdrop-blur-xl border-slate-700/50 text-white"
        : "bg-white/80 backdrop-blur-xl border-white/50 text-gray-800";

    const inputClass = isDark
        ? "bg-slate-800/50 border-slate-700 focus:border-indigo-400 text-white placeholder-slate-500"
        : "bg-white/80 border-white/50 focus:border-indigo-400 text-gray-700 placeholder-gray-400";

    const btnSecondaryClass = isDark
        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
        : "bg-gray-50 hover:bg-gray-100 text-gray-700";

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-slate-400" : "text-gray-500";

    useEffect(() => {
        if (selection) {
            setActiveData(selection);
            setCustomLabel(selection.item.notificationLabel || '');
            setEditValue(selection.item.value);
            setIsEditingValue(false);
        }
    }, [selection]);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const query = searchQuery.toLowerCase();
        const results: { categoryName: string, item: LifeItem }[] = [];

        categories.forEach(cat => {
            cat.items.forEach(item => {
                if (item.name.toLowerCase().includes(query)) {
                    results.push({ categoryName: cat.name, item }); // Use cat.name instead of cat.category
                }
            });
        });
        setSearchResults(results);
    }, [searchQuery, categories]);

    // Dynamic Icon Renderer
    const renderIcon = (iconName: string | undefined, fallback: any) => {
        if (!iconName) return fallback;
        const IconComponent = (Icons as any)[iconName];
        if (IconComponent) return <IconComponent className="w-5 h-5" />;
        return fallback;
    };

    const getCategoryIcon = (catName: string) => {
        const category = categories.find(c => c.name === catName); // Use name
        const colorClass = isDark ? "text-indigo-400" : "text-indigo-600";
        if (category?.icon) return <span className={colorClass}>{renderIcon(category.icon, <Icons.Box className="w-5 h-5" />)}</span>;
        return <Icons.Box className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />;
    };

    const getTypeIcon = (type: ItemType) => {
        const cls = isDark ? "text-slate-500" : "text-gray-400";
        switch (type) {
            case 'currency': return <Icons.Wallet size={14} className={cls} />;
            case 'percentage': return <Icons.Percent size={14} className={cls} />;
            case 'date': return <Icons.Calendar size={14} className={cls} />;
            default: return <Icons.FileText size={14} className={cls} />;
        }
    };

    const getStatusBadge = (status: ItemStatus) => {
        switch (status) {
            case 'critical': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full"><Icons.AlertTriangle size={10} /> Critique</span>;
            case 'warning': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full"><Icons.AlertTriangle size={10} /> Attention</span>;
            default: return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full"><Icons.CheckCircle size={10} /> Normal</span>;
        }
    };

    const formatValue = (val: string, type: ItemType) => {
        if (type === 'currency' && !val.includes('€') && !val.includes('$')) return val + '€';
        if (type === 'percentage' && !val.includes('%')) return val + '%';
        return val;
    };

    const handleLabelUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeData) {
            onUpdateItem(activeData.categoryName, activeData.item.id, { notificationLabel: customLabel });
        }
    };

    const handleValueUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeData) {
            onUpdateItem(activeData.categoryName, activeData.item.id, { value: editValue });
            setIsEditingValue(false);
        }
    };

    return (
        <>
            <CreationModal
                mode={modalMode}
                categories={categories}
                initialCategory={selection?.categoryName}
                onClose={() => setModalMode(null)}
                isDarkMode={isDark}
            />

            {/* CONNECTION MODE BANNER */}
            {connectionMode !== 'idle' && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
                    <div className={`px-6 py-3 rounded-full shadow-2xl border flex items-center gap-4 ${isDark ? 'bg-indigo-900/90 border-indigo-500/50 text-white' : 'bg-indigo-600/90 border-indigo-400/50 text-white'}`}>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm">
                                {connectionMode === 'selecting-source' ? "Étape 1 : Sélectionnez le point de départ" : "Étape 2 : Sélectionnez la destination"}
                            </span>
                            <span className="text-xs opacity-80">
                                {connectionMode === 'selecting-source' ? "Cliquez sur un bloc..." : "Cliquez sur un autre bloc pour créer le lien."}
                            </span>
                        </div>
                        <button
                            onClick={cancelConnection}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <Icons.X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200">
                    <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 m-4 ring-1 transform transition-all animate-in zoom-in-95 ${glassPanelClass} ${isDark ? 'ring-slate-700' : 'ring-black/5'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${textPrimary}`}>
                                <Icons.Settings size={20} />
                                <span>Paramètres</span>
                            </h2>
                            <button onClick={() => setIsSettingsOpen(false)} className={`p-1 rounded-full ${btnSecondaryClass}`}>
                                <Icons.X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {isDark ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${textPrimary}`}>Thème</p>
                                        <p className={`text-xs ${textSecondary}`}>{isDark ? 'Mode Sombre' : 'Mode Clair'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSettings.mutate({ ...settings, theme: isDark ? 'light' : 'dark' })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Notifications Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Icons.Bell size={20} />
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${textPrimary}`}>Notifications</p>
                                        <p className={`text-xs ${textSecondary}`}>Alertes de statut</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => updateSettings.mutate({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className={`mt-8 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'} text-center`}>
                            <p className={`text-xs ${textSecondary}`}>LifeMap v1.3</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between ${textPrimary}`}>

                {/* Top-Left Search Bar */}
                <div className="absolute top-6 left-6 z-40 pointer-events-auto w-72 flex gap-3">
                    <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icons.Search className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-gray-400'} group-focus-within:text-indigo-500 transition-colors`} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
                            className={`block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm shadow-lg shadow-gray-900/5 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium ${inputClass}`}
                            placeholder="Rechercher..."
                        />

                        {/* Search Results Dropdown */}
                        {searchQuery && (
                            <div className={`absolute top-full left-0 w-full mt-2 border rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ${glassPanelClass}`}>
                                {searchResults.length > 0 ? (
                                    <div className="py-1">
                                        {searchResults.map((res) => (
                                            <button
                                                key={res.item.id}
                                                onClick={() => {
                                                    onSelect(res.categoryName, res.item);
                                                    setSearchQuery('');
                                                }}
                                                className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group ${isDark ? 'hover:bg-indigo-500/20' : 'hover:bg-indigo-50'}`}
                                            >
                                                <div>
                                                    <p className={`text-sm font-semibold group-hover:text-indigo-500 ${textPrimary}`}>{res.item.name}</p>
                                                    <p className={`text-xs uppercase font-bold tracking-wider ${textSecondary}`}>{res.categoryName}</p>
                                                </div>
                                                {getStatusBadge(res.item.status)}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`px-4 py-3 text-sm text-center ${textSecondary}`}>
                                        Aucun résultat
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile / Settings Button */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className={`flex items-center justify-center w-11 h-11 rounded-xl shadow-lg border transition-all active:scale-95 ${inputClass}`}
                    >
                        <Icons.User size={20} className={isDark ? 'text-slate-300' : 'text-gray-600'} />
                    </button>
                </div>

                {/* Top-Right Notification Widget */}
                <div className="absolute top-6 right-6 z-40 pointer-events-auto">
                    <NotificationWidget
                        categories={categories}
                        isDarkMode={isDark}
                        onItemClick={onSelect}
                    />
                </div>

                {/* Bottom Action Bar (Split into two groups) */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-auto pointer-events-auto z-40 flex items-center gap-4">

                    {/* Group 1: Connections */}
                    <div className={`flex items-center gap-2 border p-2 rounded-full shadow-xl ring-1 ring-gray-900/5 ${glassPanelClass}`}>

                        {/* TOGGLE CONNECTIONS BUTTON */}
                        <button
                            onClick={toggleConnections}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 whitespace-nowrap ${showConnections
                                ? (isDark ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200')
                                : (isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100')
                                }`}
                            title={showConnections ? "Masquer les liens" : "Afficher les liens"}
                        >
                            <Icons.Link2 size={18} />
                        </button>

                        <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>

                        {/* ADD CONNECTION BUTTON */}
                        <button
                            onClick={connectionMode === 'idle' ? () => startConnection(selection || undefined) : cancelConnection}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 whitespace-nowrap ${connectionMode !== 'idle'
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20'
                                : (isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-700')
                                }`}
                        >
                            {connectionMode !== 'idle' ? <Icons.X size={18} /> : <Icons.Network size={18} />}
                            <span>{connectionMode !== 'idle' ? 'Annuler' : 'Nouveau Lien'}</span>
                        </button>
                    </div>

                    {/* Group 2: Creation */}
                    <div className={`flex items-center gap-2 border p-2 rounded-full shadow-xl ring-1 ring-gray-900/5 ${glassPanelClass}`}>
                        {/* ADD CATEGORY BUTTON */}
                        <button
                            onClick={() => setModalMode('category')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 whitespace-nowrap ${isDark ? 'bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-300 text-slate-200' : 'bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700'}`}
                        >
                            <Icons.Layers size={18} />
                            <span>Nouvelle Île</span>
                        </button>

                        {/* ADD ITEM BUTTON */}
                        <button
                            onClick={() => setModalMode('item')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 whitespace-nowrap ${isDark ? 'bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-300 text-slate-200' : 'bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700'}`}
                        >
                            <Icons.Plus size={18} />
                            <span>Ajouter Bloc</span>
                        </button>
                    </div>
                </div>

                {/* Side Panel */}
                <div
                    className={`
            pointer-events-auto
            h-full w-80 sm:w-96
            absolute right-0 top-0
            border-l shadow-2xl
            transform transition-transform duration-500 ease-out
            ${selection ? 'translate-x-0' : 'translate-x-full'}
            flex flex-col
            z-40
            ${glassPanelClass}
            `}
                >
                    {activeData && (
                        <ItemDetailSidebar
                            categoryName={activeData.categoryName}
                            categoryColor={categories.find(c => c.name === activeData.categoryName)?.color || '#6366f1'}
                            item={activeData.item}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default UIOverlay;
