
import React, { Suspense, useEffect } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import OnboardingWizard from './components/OnboardingWizard';
import { Category, LifeItem, Dependency, UserSettings } from './types';
import { ModalMode } from './components/CreationModal';
import { useStore } from './store/useStore';
import { useLifeMapMutations } from './hooks/useLifeMapMutations';
import { useCategories, useDependencies, useSettings } from './hooks/useLifeMapData';
import api from './api/axios';

const App: React.FC = () => {
  // --- GLOBAL STORE ---
  const {
    selection, setSelection,
    connectionMode, startConnection, setConnectionTarget, cancelConnection, connectionSource,
    selectedDependencyId, selectDependency,
    showConnections, toggleConnections,
  } = useStore();

  // --- DATA FETCHING ---
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: dependencies = [] } = useDependencies();
  const { data: settings } = useSettings();

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

  // Keep selection in sync with data updates
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

  // --- HANDLERS ---

  const handleOnboardingFinish = async (newData: Category[]) => {
    try {
      // Iterate through generated categories and create them + their items
      for (const cat of newData) {
        // 1. Create Category
        await createCategory.mutateAsync({
          name: cat.name, // Use 'name' not 'category' field
          color: cat.color,
          icon: typeof cat.icon === 'string' ? cat.icon : 'HelpCircle' // Ensure icon is string
        });

        // 2. Create Items for this category
        // Note: In a real app we'd need the ID of the created category from the backend response
        // but our current mock/implementation flow might be relying on name refetching or similar.
        // HOWEVER, since we don't have the new ID yet, and our createItem endpoint likely needs it...

        // Wait, standard flow:
        // We really should wait for the category ID. 
        // Let's assume createCategory returns the created object with ID.
        // We'll fetch the fresh category list to get the ID, OR relies on the mutation result.
        // But `createCategory.mutateAsync` returns the response data.

        // Let's rely on name matching for now if we can't get ID easily or just re-fetch logic.
        // Actually, let's look at `useLifeMapMutations`... it invalidates queries.
        // But we need the ID to create items *in* that category.

        // Improvement: We will fetch the category via API or filter from updated list? 
        // Better: `createCategory` returns the created category.

        const createdCat = await api.get<Category[]>(`/categories`).then(res => res.data.find(c => c.name === cat.name));

        if (createdCat) {
          for (const item of cat.items) {
            await createItem.mutateAsync({
              categoryId: createdCat.id,
              name: item.name,
              value: item.value || "0",
              type: item.type || "text",
              status: item.status || "ok",
              assetType: (item.assetType as any) || "finance", // Fallback and cast needed temporarily
            });
          }
        }
      }

      // Force refresh of all data
      window.location.reload(); // Simple way to reset state for now

    } catch (e) {
      console.error("Error saving onboarding data", e);
      alert("Erreur lors de la sauvegarde de votre univers. Veuillez réessayer.");
    }
  };

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
  // Show onboarding if there is absolutely no data
  const showOnboarding = !isLoadingCategories && categories.length === 0;

  if (isLoadingCategories) return <div className="w-full h-screen flex items-center justify-center">Loading LifeMap...</div>;

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-[#f0f9ff]'}`}>

      {/* Onboarding Wizard (Only shown if data is empty) */}
      {showOnboarding && <OnboardingWizard onFinish={handleOnboardingFinish} />}

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
          />
        </Suspense>
      </div>

      {/* 2D UI Layer */}
      {!showOnboarding && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <UIOverlay
            selection={selection}
            categories={categories}
            onClose={() => setSelection(null)}
            onSelect={handleBlockClick}
            onUpdateItem={handleUpdateItem}
            onDelete={handleDeleteElement}
            showConnections={showConnections}
            onToggleConnections={toggleConnections}
            settings={settings || { theme: 'light', notificationsEnabled: true }}
            connectionMode={connectionMode}
            onStartConnection={() => startConnection(selection || undefined)}
            onCancelConnection={cancelConnection}
          />
        </div>
      )}
    </div>
  );
};

export default App;
