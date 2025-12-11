import { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/endpoints/items';
import { WidgetType } from '../types';

// Default widget order based on asset type patterns
const DEFAULT_WIDGET_ORDER: WidgetType[] = [
  'history',
  'recurring-flows',
  'property',
  'energy',
  'maintenance',
  'social-calendar',
  'birthdays',
  'contacts',
  'health-body',
  'health-appointments',
  'goals',
  'deadlines',
];

interface UseWidgetOrderProps {
  itemId: string;
  savedOrder?: string[];
  availableWidgets: WidgetType[];
}

interface UseWidgetOrderReturn {
  orderedWidgets: WidgetType[];
  dragState: {
    draggingType: string | null;
    dropTargetType: string | null;
  };
  handleDragStart: (type: string) => void;
  handleDragOver: (type: string) => void;
  handleDrop: () => void;
  handleDragEnd: () => void;
  isSaving: boolean;
}

export const useWidgetOrder = ({
  itemId,
  savedOrder,
  availableWidgets,
}: UseWidgetOrderProps): UseWidgetOrderReturn => {
  const queryClient = useQueryClient();
  
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [dropTargetType, setDropTargetType] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<WidgetType[] | null>(null);

  // Mutation to save order
  const saveOrderMutation = useMutation({
    mutationFn: (order: string[]) => itemsApi.updateWidgetOrder(itemId, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      console.error('[WidgetOrder] Failed to save:', err);
      setLocalOrder(null); // Revert to saved order on error
    },
  });

  // Compute ordered widgets from saved order or default
  const orderedWidgets = useMemo(() => {
    const order = localOrder || savedOrder || DEFAULT_WIDGET_ORDER;
    
    // Filter to only available widgets and maintain order
    const available = new Set(availableWidgets);
    const ordered = order.filter(type => available.has(type as WidgetType)) as WidgetType[];
    
    // Add any available widgets not in the order (new widgets)
    availableWidgets.forEach(widget => {
      if (!ordered.includes(widget)) {
        ordered.push(widget);
      }
    });
    
    return ordered;
  }, [localOrder, savedOrder, availableWidgets]);

  const handleDragStart = useCallback((type: string) => {
    setDraggingType(type);
  }, []);

  const handleDragOver = useCallback((type: string) => {
    if (type !== draggingType) {
      setDropTargetType(type);
    }
  }, [draggingType]);

  const handleDrop = useCallback(() => {
    if (!draggingType || !dropTargetType || draggingType === dropTargetType) {
      return;
    }

    // Calculate new order
    const newOrder = [...orderedWidgets];
    const dragIndex = newOrder.indexOf(draggingType as WidgetType);
    const dropIndex = newOrder.indexOf(dropTargetType as WidgetType);

    if (dragIndex !== -1 && dropIndex !== -1) {
      // Remove from current position
      newOrder.splice(dragIndex, 1);
      // Insert at new position
      newOrder.splice(dropIndex, 0, draggingType as WidgetType);

      // Update local state immediately
      setLocalOrder(newOrder);

      // Save to backend
      saveOrderMutation.mutate(newOrder);
    }

    // Reset drag state
    setDraggingType(null);
    setDropTargetType(null);
  }, [draggingType, dropTargetType, orderedWidgets, saveOrderMutation]);

  const handleDragEnd = useCallback(() => {
    // If dropped outside valid target, just reset
    if (dropTargetType) {
      handleDrop();
    } else {
      setDraggingType(null);
      setDropTargetType(null);
    }
  }, [dropTargetType, handleDrop]);

  return {
    orderedWidgets,
    dragState: {
      draggingType,
      dropTargetType,
    },
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    isSaving: saveOrderMutation.isPending,
  };
};
