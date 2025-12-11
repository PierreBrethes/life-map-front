import React, { useMemo, ReactNode } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem, WidgetType } from '../../types';
import { useWidgetOrder } from '../../hooks/useWidgetOrder';

interface WidgetZoneProps {
  item: LifeItem;
  isDark: boolean;
  availableWidgets: WidgetType[];
  renderWidget: (widgetType: WidgetType) => ReactNode | null;
}

/**
 * WidgetZone - Manages drag and drop ordering for sidebar widgets
 */
const WidgetZone: React.FC<WidgetZoneProps> = ({
  item,
  isDark,
  availableWidgets,
  renderWidget,
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

  return (
    <div className="space-y-4 relative">
      {/* Saving indicator */}
      {isSaving && (
        <div className={`absolute -top-2 right-0 flex items-center gap-1 text-xs ${
          isDark ? 'text-slate-400' : 'text-gray-500'
        }`}>
          <Icons.Loader2 size={10} className="animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {/* Render widgets in order */}
      {orderedWidgets.map(widgetType => {
        const widget = renderWidget(widgetType);
        if (!widget) return null;

        const isDragging = dragState.draggingType === widgetType;
        const isDropTarget = dragState.dropTargetType === widgetType;

        return (
          <div
            key={widgetType}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', widgetType);
              handleDragStart(widgetType);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              handleDragOver(widgetType);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop();
            }}
            onDragEnd={handleDragEnd}
            className={`
              relative transition-all duration-200 group cursor-grab active:cursor-grabbing
              ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
            `}
          >
            {/* Drop indicator line */}
            {isDropTarget && (
              <div className={`
                absolute -top-2 left-0 right-0 h-0.5 rounded-full z-10
                ${isDark ? 'bg-violet-500' : 'bg-violet-600'}
              `} />
            )}

            {/* Drag handle indicator */}
            <div
              className={`
                absolute -left-0.5 top-1/2 -translate-y-1/2 -translate-x-full
                opacity-0 group-hover:opacity-100
                p-1.5 rounded-l transition-opacity
                ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-gray-300 hover:text-gray-500'}
              `}
            >
              <Icons.GripVertical size={12} />
            </div>

            {/* Widget content */}
            {widget}
          </div>
        );
      })}
    </div>
  );
};

export default WidgetZone;
