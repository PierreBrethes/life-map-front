import React, { useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import { useCategories, useSettings } from '../hooks/useLifeMapData';

const IslandContextMenu: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);

  const { islandContextMenu, setIslandContextMenu, setPendingDeleteIsland } = useStore();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();

  const isDark = settings?.theme === 'dark';

  // Find the category
  const category = categories.find(c => c.id === islandContextMenu?.categoryId);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIslandContextMenu(null);
      }
    };

    if (islandContextMenu) {
      // Use setTimeout to prevent immediate closure when opening via right-click
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [islandContextMenu, setIslandContextMenu]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIslandContextMenu(null);
      }
    };

    if (islandContextMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [islandContextMenu, setIslandContextMenu]);

  if (!islandContextMenu || !category) return null;

  const handleDelete = () => {
    setPendingDeleteIsland({
      id: category.id,
      name: category.name,
      itemCount: category.items.length
    });
    setIslandContextMenu(null);
  };

  const menuItems = [
    {
      icon: Icons.Trash2,
      label: 'Supprimer l\'île',
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      className={`fixed z-[100] min-w-[180px] py-1 rounded-xl shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 pointer-events-auto ${isDark
        ? 'bg-slate-900/95 border-slate-700/50'
        : 'bg-white/95 border-gray-200'
        }`}
      style={{
        left: islandContextMenu.x,
        top: islandContextMenu.y,
      }}
    >
      {/* Header */}
      <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {category.name}
          </span>
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            ({category.items.length} blocs)
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors cursor-pointer ${item.danger
              ? isDark
                ? 'text-red-400 hover:bg-red-500/20'
                : 'text-red-600 hover:bg-red-50'
              : isDark
                ? 'text-slate-300 hover:bg-slate-700/50'
                : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <item.icon size={14} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IslandContextMenu;
