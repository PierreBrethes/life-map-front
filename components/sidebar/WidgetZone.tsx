import React, { useRef } from 'react';
import { useWidgetOrder } from '../../hooks/useWidgetOrder';
import { WidgetType, LifeItem } from '../../types';
import { WIDGET_REGISTRY } from '../../utils/widgetRegistry';
import * as Icons from 'lucide-react';
import WidgetRenderer from './WidgetRenderer';

interface WidgetZoneProps {
  item: LifeItem;
  isDark: boolean;
  availableWidgets: WidgetType[];
}

const WidgetZone: React.FC<WidgetZoneProps> = ({
  item,
  isDark,
  availableWidgets,
}) => {
  const {
    orderedWidgets,
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    isSaving,
  } = useWidgetOrder({
    itemId: item.id,
    savedOrder: item.widgetOrder,
    availableWidgets,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Icon Renderer
  const getWidgetIcon = (iconName: string, fallback: any) => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) return <IconComponent size={14} />;
    return fallback;
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between px-1">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Widgets
        </h3>
        {/* Saving Indicator */}
        {isSaving && (
          <span className="text-[10px] text-slate-500 animate-pulse">
            Enregistrement...
          </span>
        )}
      </div>

      <div className="space-y-4 min-h-[100px]">
        {orderedWidgets.map((widgetId, index) => {
          const registryEntry = WIDGET_REGISTRY.find(w => w.type === widgetId);
          if (!registryEntry) return null;

          const isDragging = dragState.draggingType === widgetId;
          const isDropTarget = dragState.dropTargetType === widgetId;

          return (
            <div
              key={widgetId}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                // We use the ID as data
                e.dataTransfer.setData('text/plain', widgetId); 
                handleDragStart(widgetId);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                handleDragOver(widgetId);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop();
              }}
              onDragEnd={handleDragEnd}
              className={`
                group relative transition-all duration-300
                ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
                cursor-grab active:cursor-grabbing
              `}
            >
              {/* Drop target indicator */}
              {isDropTarget && !isDragging && (
                <div className={`absolute -top-2 left-0 right-0 h-0.5 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
              )}

              {/* Drag Handle (Visible on Hover) */}
              <div className="absolute -left-3 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                <Icons.GripVertical size={14} />
              </div>

              {/* Widget Header with Icon */}
              <div className="mb-2 flex items-center gap-2 pl-1">
                <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>
                  {getWidgetIcon(registryEntry.icon, <Icons.Box size={14} />)}
                </span>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
                  {registryEntry.label}
                </span>
              </div>

              {/* Render the actual widget */}
              <WidgetRenderer
                widgetType={widgetId}
                item={item}
                isDark={isDark}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetZone;
