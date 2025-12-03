
import React, { useState, useEffect, Suspense } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import OnboardingWizard from './components/OnboardingWizard';
import { SelectionState, Category, LifeItem, Dependency, UserSettings } from './types';
import { DATA as INITIAL_DATA, INITIAL_DEPENDENCIES } from './data';
import { ModalMode } from './components/CreationModal';

type ConnectionMode = 'idle' | 'selecting-source' | 'selecting-target';

const App: React.FC = () => {
  // --- PERSISTENCE LAYER ---
  const [data, setData] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('lifemap_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      return INITIAL_DATA;
    } catch (e) {
      console.error("Failed to load data", e);
      return INITIAL_DATA;
    }
  });

  const [dependencies, setDependencies] = useState<Dependency[]>(() => {
    try {
      const saved = localStorage.getItem('lifemap_deps');
      return saved ? JSON.parse(saved) : INITIAL_DEPENDENCIES;
    } catch (e) {
      return INITIAL_DEPENDENCIES;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('lifemap_settings');
      return saved ? JSON.parse(saved) : { theme: 'light', notificationsEnabled: true };
    } catch (e) {
      return { theme: 'light', notificationsEnabled: true };
    }
  });

  useEffect(() => {
    localStorage.setItem('lifemap_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('lifemap_deps', JSON.stringify(dependencies));
  }, [dependencies]);

  useEffect(() => {
    localStorage.setItem('lifemap_settings', JSON.stringify(settings));
    document.body.style.backgroundColor = settings.theme === 'dark' ? '#0f172a' : '#e4e4e7';
  }, [settings]);

  // --- STATE ---
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [showConnections, setShowConnections] = useState(true);

  // Connection Creation State
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('idle');
  const [connectionSource, setConnectionSource] = useState<SelectionState | null>(null);
  const [selectedDependencyId, setSelectedDependencyId] = useState<string | null>(null);

  // Keep selection in sync with data updates
  useEffect(() => {
    if (selection) {
      const cat = data.find(c => c.category === selection.categoryName);
      if (cat) {
        const item = cat.items.find(i => i.id === selection.item.id);
        if (item) {
          if (JSON.stringify(selection.item) !== JSON.stringify(item)) {
            setSelection({ categoryName: selection.categoryName, item });
          }
        } else {
          // Item no longer exists (was deleted), clear selection if not already done
          setSelection(null);
        }
      } else {
        // Category no longer exists
        setSelection(null);
      }
    }
  }, [data, selection]);

  // --- HANDLERS ---

  const handleOnboardingFinish = (newData: Category[]) => {
    setData(newData);
  };

  // Unified Block Click Handler
  const handleBlockClick = (categoryName: string, item: LifeItem) => {
    // Mode: Connection Creation
    if (connectionMode === 'selecting-source') {
      setConnectionSource({ categoryName, item });
      setConnectionMode('selecting-target');
      return;
    }

    if (connectionMode === 'selecting-target') {
      if (connectionSource && connectionSource.item.id !== item.id) {
        // Create the dependency
        const newDep: Dependency = {
          id: Math.random().toString(36).substr(2, 9),
          fromCategory: connectionSource.categoryName,
          fromItem: connectionSource.item.name,
          fromId: connectionSource.item.id,
          toCategory: categoryName,
          toItem: item.name,
          toId: item.id
        };
        setDependencies(prev => [...prev, newDep]);
      }
      // Reset mode
      setConnectionMode('idle');
      setConnectionSource(null);
      return;
    }

    // Mode: Normal Selection
    setSelection({ categoryName, item });
    setSelectedDependencyId(null); // Deselect line if clicking a block
  };

  const handleSelectFromUI = (categoryName: string, item: LifeItem) => {
    handleBlockClick(categoryName, item);
  };

  const handleSaveNewElement = (formData: any, mode: ModalMode) => {
    if (mode === 'category') {
      const newCategory: Category = formData;
      setData(prev => [...prev, newCategory]);
    } else if (mode === 'item') {
      const { categoryName, item } = formData;
      setData(prev => prev.map(cat => {
        if (cat.category === categoryName) {
          return {
            ...cat,
            items: [...cat.items, item]
          };
        }
        return cat;
      }));
    }
  };

  const handleUpdateItem = (categoryName: string, itemId: string, updates: Partial<LifeItem>) => {
    setData(prev => prev.map(cat => {
      if (cat.category === categoryName) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updates };
            }
            return item;
          })
        };
      }
      return cat;
    }));
  };

  const handleDeleteElement = () => {
    if (!selection) return;

    const { categoryName, item } = selection;
    if (!window.confirm(`Supprimer ${item.name} ?`)) return;

    // 1. Close the sidebar immediately
    setSelection(null);

    // 2. Remove from Data (Immutable update)
    setData(prevData => {
      const newData = prevData.map(cat => {
        if (cat.category !== categoryName) return cat;

        // Filter out the item
        const newItems = cat.items.filter(i => {
          // Priority: Check ID (for new/migrated items)
          if (i.id && item.id) return i.id !== item.id;
          // Fallback: Check Name (for legacy items)
          return i.name !== item.name;
        });

        return { ...cat, items: newItems };
      });

      // Remove categories that have become empty
      return newData.filter(cat => cat.items.length > 0);
    });

    // 3. Remove associated dependencies
    setDependencies(prev => prev.filter(dep => {
      // Check if dependency is linked to the deleted item (From or To)
      // We check both ID and Name to cover all legacy/new mixed cases
      const isFromMatch = (item.id && dep.fromId === item.id) || (dep.fromItem === item.name);
      const isToMatch = (item.id && dep.toId === item.id) || (dep.toItem === item.name);

      return !(isFromMatch || isToMatch);
    }));
  };

  const handleDeleteDependency = (id: string) => {
    setDependencies(prev => prev.filter(d => d.id !== id));
    setSelectedDependencyId(null);
  };

  const isDarkMode = settings.theme === 'dark';
  // Show onboarding if there is absolutely no data
  const showOnboarding = data.length === 0;

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950' : 'bg-[#f0f9ff]'}`}>

      {/* Onboarding Wizard (Only shown if data is empty) */}
      {showOnboarding && <OnboardingWizard onFinish={handleOnboardingFinish} />}

      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">LOADING...</div>}>
          <Experience
            data={data}
            dependencies={dependencies}
            selection={selection}
            setSelection={(sel) => {
              // Prevent deselecting if clicking UI elements (handled via propagation usually, but safe guard here)
              // If sel is null, it means we clicked empty space.
              if (!sel && connectionMode !== 'idle') return;
              setSelection(sel);
            }}
            onBlockClick={handleBlockClick}
            showConnections={showConnections}
            isDarkMode={isDarkMode}
            selectedDependencyId={selectedDependencyId}
            onSelectDependency={setSelectedDependencyId}
            onDeleteDependency={handleDeleteDependency}
          />
        </Suspense>
      </div>

      {/* 2D UI Layer (Hidden during onboarding) */}
      {!showOnboarding && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <UIOverlay
            selection={selection}
            categories={data}
            onClose={() => setSelection(null)}
            onSelect={handleSelectFromUI}
            onSaveNewElement={handleSaveNewElement}
            onUpdateItem={handleUpdateItem}
            onDelete={handleDeleteElement}
            showConnections={showConnections}
            onToggleConnections={() => setShowConnections(!showConnections)}
            settings={settings}
            onUpdateSettings={setSettings}
            connectionMode={connectionMode}
            onStartConnection={() => {
              if (selection) {
                setConnectionSource(selection);
                setConnectionMode('selecting-target');
              } else {
                setConnectionMode('selecting-source');
              }
            }}
            onCancelConnection={() => {
              setConnectionMode('idle');
              setConnectionSource(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
