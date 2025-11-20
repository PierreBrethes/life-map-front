
import React, { useState, useEffect, Suspense } from 'react';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';
import { SelectionState, Category, LifeItem, Dependency } from './types';
import { DATA as INITIAL_DATA, INITIAL_DEPENDENCIES } from './data';
import { ModalMode } from './components/CreationModal';

const App: React.FC = () => {
  // --- PERSISTENCE LAYER ---
  // Initialize state from LocalStorage if available
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

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('lifemap_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('lifemap_deps', JSON.stringify(dependencies));
  }, [dependencies]);

  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [showConnections, setShowConnections] = useState(true);

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

  const handleDeleteElement = () => {
    if (!selection) return;

    const { categoryName, item } = selection;

    // Confirm deletion
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

    // Clean up dependencies involving this item
    setDependencies(prev => prev.filter(dep => 
      !((dep.fromCategory === categoryName && dep.fromItem === item.name) ||
        (dep.toCategory === categoryName && dep.toItem === item.name))
    ));

    setSelection(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#f0f9ff] overflow-hidden">
      {/* 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">LOADING...</div>}>
          <Experience 
            data={data}
            dependencies={dependencies}
            selection={selection} 
            setSelection={setSelection} 
            showConnections={showConnections}
          />
        </Suspense>
      </div>

      {/* 2D UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         <UIOverlay 
            selection={selection} 
            categories={data}
            onClose={() => setSelection(null)}
            onSaveNewElement={handleSaveNewElement}
            onDelete={handleDeleteElement}
            showConnections={showConnections}
            onToggleConnections={() => setShowConnections(!showConnections)}
         />
      </div>
      
      {/* Optional: Decorative Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)]" />
    </div>
  );
};

export default App;
