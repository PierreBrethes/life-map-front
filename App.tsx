
import React, { useState, useEffect, Suspense } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { SelectionState, Category, LifeItem, Dependency, UserSettings } from './types';
import { DATA as INITIAL_DATA, INITIAL_DEPENDENCIES } from './data';
import { ModalMode } from './components/CreationModal';

type ConnectionMode = 'idle' | 'selecting-source' | 'selecting-target';

const App: React.FC = () => {
  // --- PERSISTENCE LAYER ---
  const [data, setData] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('lifemap_data');
      return saved ? JSON.parse(saved) : INITIAL_DATA;
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
        }
      }
    }
  }, [data, selection]);

  // --- HANDLERS ---

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

    setData(prev => {
      return prev.map(cat => {
        if (cat.category === categoryName) {
          return {
            ...cat,
            items: cat.items.filter(i => i.id !== item.id)
          };
        }
        return cat;
      });
    });

    setDependencies(prev => prev.filter(dep => 
      !((dep.fromId === item.id) || (dep.toId === item.id))
    ));

    setSelection(null);
  };

  const handleDeleteDependency = (id: string) => {
      setDependencies(prev => prev.filter(d => d.id !== id));
      setSelectedDependencyId(null);
  };

  const isDarkMode = settings.theme === 'dark';

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f0f9ff]'}`}>
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">LOADING...</div>}>
          <Experience 
            data={data}
            dependencies={dependencies}
            selection={selection} 
            setSelection={(sel) => {
                if (!sel) {
                    // Only clear if not in connection mode to prevent accidental clears
                    if(connectionMode === 'idle') setSelection(null);
                } else {
                    setSelection(sel);
                }
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

      {/* 2D UI Layer */}
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
            // Connection Mode Props
            connectionMode={connectionMode}
            onStartConnection={() => {
                setConnectionMode('selecting-source');
                setSelection(null);
                setShowConnections(true);
            }}
            onCancelConnection={() => {
                setConnectionMode('idle');
                setConnectionSource(null);
            }}
         />
      </div>
      
      {/* Decorative Vignette */}
      <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]'}`} />
    </div>
  );
};

export default App;
