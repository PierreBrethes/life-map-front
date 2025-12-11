import React, { useState, useRef } from 'react';
import * as Icons from 'lucide-react';

interface DraggableWidgetContainerProps {
  widgetType: string;
  children: React.ReactNode;
  isDark: boolean;
  onDragStart: (type: string) => void;
  onDragOver: (type: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

const DraggableWidgetContainer: React.FC<DraggableWidgetContainerProps> = ({
  widgetType,
  children,
  isDark,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDropTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetType);
    onDragStart(widgetType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(widgetType);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  return (
    <div
      ref={containerRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      className={`
        relative transition-all duration-200
        ${isDragging ? 'opacity-50 scale-[0.98]' : ''}
        ${isDropTarget ? 'translate-y-1' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        className={`
          absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full
          opacity-0 group-hover:opacity-100 hover:opacity-100
          cursor-grab active:cursor-grabbing
          p-1 rounded transition-opacity
          ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}
        `}
      >
        <Icons.GripVertical size={14} />
      </div>

      {/* Drop indicator line */}
      {isDropTarget && (
        <div className={`
          absolute -top-1 left-0 right-0 h-0.5 rounded-full
          ${isDark ? 'bg-violet-500' : 'bg-violet-600'}
        `} />
      )}

      {/* Widget content */}
      <div className="group">
        {children}
      </div>
    </div>
  );
};

export default DraggableWidgetContainer;
