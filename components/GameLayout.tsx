
import React, { Suspense, useEffect, useRef, useState } from 'react';
import Experience from './Experience';
import UIOverlay from './UIOverlay';
import { Category, LifeItem, Dependency } from '../types';
import { useStore } from '../store/useStore';
import { useLifeMapMutations } from '../hooks/useLifeMapMutations';
import { useCategories, useDependencies, useSettings, useSyncRecurring, useAssetConfigs } from '../hooks/useLifeMapData';
import api from '../api/axios';
import { ItemDetailSidebar } from './sidebar';

const GameLayout: React.FC = () => {
  // --- ONBOARDING STATE ---
  const [isOnboarding, setIsOnboarding] = useState(true);

  const handleOnboardingComplete = () => {
    setIsOnboarding(false);
  };
  // --- GLOBAL STORE ---
  const {
    selection, setSelection,
    connectionMode, startConnection, setConnectionTarget, connectionSource,
    selectedDependencyId, selectDependency,
    showConnections
  } = useStore();

  const [activeSidebarData, setActiveSidebarData] = React.useState<typeof selection>(null);

  // Preserve sidebar data during close animation (prevents content flash)
  useEffect(() => {
    if (selection) {
      setActiveSidebarData(selection);
    }
  }, [selection]);

  // --- DATA FETCHING ---
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: dependencies = [] } = useDependencies();
  const { data: settings } = useSettings();
  const { data: assetConfigs } = useAssetConfigs();

  const { setAssetConfigs } = useStore();

  useEffect(() => {
    if (assetConfigs) {
      setAssetConfigs(assetConfigs);
    }
  }, [assetConfigs, setAssetConfigs]);

  // --- RECURRING SYNC ---
  const syncRecurring = useSyncRecurring();
  const hasSyncedRef = useRef(false);

  // Sync recurring transactions on first load (after categories are loaded)
  useEffect(() => {
    if (!isLoadingCategories && categories.length > 0 && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncRecurring.mutate(undefined, {
        onSuccess: (result) => {
          if (result.processedCount > 0) {
            console.log(`[LifeMap] Synced ${result.processedCount} recurring transactions`);
          }
        },
        onError: (err) => {
          console.debug('[LifeMap] Recurring sync skipped:', err);
        },
      });
    }
  }, [isLoadingCategories, categories.length]);

  // --- MUTATIONS ---
  const {
    createItem, updateItem, deleteItem,
    createCategory,
    createDependency, deleteDependency
  } = useLifeMapMutations();

  // --- SETTINGS SIDE EFFECTS ---
  useEffect(() => {
    if (settings) {
      document.body.style.backgroundColor = settings.theme === 'dark' ? '#0f172a' : '#e4e4e7';
    }
  }, [settings]);

  // Auto-update selection when backend data changes (e.g., after mutation)
  useEffect(() => {
    if (selection) {
      const cat = categories.find(c => c.name === selection.categoryName);
      if (cat) {
        const item = cat.items.find(i => i.id === selection.item.id);
        if (item) {
          if (JSON.stringify(selection.item) !== JSON.stringify(item)) {
            setSelection({ categoryName: selection.categoryName, item });
          }
        } else {
          setSelection(null);
        }
      } else {
        setSelection(null);
      }
    }
  }, [categories, selection, setSelection]);



  // Unified Block Click Handler
  const handleBlockClick = (categoryName: string, item: LifeItem) => {
    if (connectionMode === 'selecting-source') {
      startConnection({ categoryName, item });
      return;
    }

    if (connectionMode === 'selecting-target') {
      if (connectionSource && connectionSource.item.id !== item.id) {
        // Resolve Category IDs
        const fromCat = categories.find(c => c.name === connectionSource.categoryName);
        const toCat = categories.find(c => c.name === categoryName);

        if (fromCat && toCat) {
          createDependency.mutate({
            fromCategoryId: fromCat.id,
            fromItemId: connectionSource.item.id,
            toCategoryId: toCat.id,
            toItemId: item.id
          });
        } else {
          console.error("Could not resolve category IDs for dependency creation");
        }
      }
      // Reset mode (handled by store usually, but let's be explicit if needed or rely on store actions)
      setConnectionTarget({ categoryName, item }); // This resets mode in store
      return;
    }

    // Mode: Normal Selection
    setSelection({ categoryName, item });
  };

  const handleUpdateItem = (categoryName: string, itemId: string, updates: Partial<LifeItem>) => {
    updateItem.mutate({ id: itemId, payload: updates });
  };

  const handleDeleteElement = () => {
    if (!selection) return;
    const { item } = selection;
    if (!window.confirm(`Supprimer ${item.name} ?`)) return;

    deleteItem.mutate(item.id);
    setSelection(null);
  };

  const handleDeleteDependency = (id: string) => {
    deleteDependency.mutate(id);
    selectDependency(null);
  };

  const isDarkMode = settings?.theme === 'dark';



  if (isLoadingCategories) return <div className="w-full h-screen flex items-center justify-center">Loading LifeMap...</div>;

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-[#f0f9ff]'}`}>

      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">LOADING...</div>}>
          <Experience
            data={categories}
            dependencies={dependencies}
            selection={selection}
            setSelection={(sel) => {
              if (!sel && connectionMode !== 'idle') return;
              setSelection(sel);
            }}
            onBlockClick={handleBlockClick}
            showConnections={showConnections}
            isDarkMode={isDarkMode}
            selectedDependencyId={selectedDependencyId}
            onSelectDependency={selectDependency}
            onDeleteDependency={handleDeleteDependency}
            isOnboarding={isOnboarding && categories.length === 0}
            onOnboardingComplete={handleOnboardingComplete}
          />
        </Suspense>
      </div>

      {/* 2D UI Layer (HUD) - hidden during onboarding with fade-in animation */}
      <div
        className={`
          absolute inset-0 z-10 pointer-events-none
          transition-all duration-700 ease-out
          ${(isOnboarding && categories.length === 0)
            ? 'opacity-0 translate-y-4'
            : 'opacity-100 translate-y-0'}
        `}
      >
        <UIOverlay
          categories={categories}
          onSelect={handleBlockClick}
          onUpdateItem={handleUpdateItem}
          onDelete={handleDeleteElement}
        />
      </div>

      {/* Sidebar (Overlay on the right) */}
      <div
        className={`
          pointer-events-auto
          absolute right-0 top-0 h-full w-96
          border-l shadow-2xl flex flex-col
          transform transition-transform duration-500 ease-out z-40
          ${selection ? 'translate-x-0' : 'translate-x-full'}
          ${isDarkMode ? "bg-slate-900/95 backdrop-blur-xl border-slate-700/50 text-white" : "bg-white/95 backdrop-blur-xl border-gray-200/80 text-gray-800"}
        `}
      >
        {activeSidebarData && (
          <ItemDetailSidebar
            categoryName={activeSidebarData.categoryName}
            categoryColor={categories.find(c => c.name === activeSidebarData.categoryName)?.color || '#6366f1'}
            item={activeSidebarData.item}
          />
        )}
      </div>

    </div>
  );
};

export default GameLayout;
