import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem } from '../../types';
import SidebarHeader from './SidebarHeader';
import StatCard from './StatCard';
import InfoSection from './InfoSection';
import NotificationsPanel from './NotificationsPanel';
import WidgetsPanel from './WidgetsPanel';
import QuickActions from './QuickActions';

interface ItemDetailSidebarProps {
  categoryName: string;
  categoryColor: string;
  item: LifeItem;
  isDark: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdateItem: (updates: Partial<LifeItem>) => void;
}

const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
  categoryName,
  categoryColor,
  item,
  isDark,
  onClose,
  onDelete,
  onUpdateItem
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(!item.notificationDismissed);

  // Update local state when item changes
  useEffect(() => {
    setNotificationsEnabled(!item.notificationDismissed);
  }, [item.notificationDismissed]);

  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  // Mock data for stats (as per user request - fake data for now)
  const healthValue = 85;
  const activityCount = 12;

  // Build notifications list based on item status
  const notifications = [];
  if (item.status === 'warning' || item.status === 'critical') {
    notifications.push({
      id: '1',
      label: 'Surveillance active',
      type: 'active' as const
    });
    if (item.status === 'critical') {
      notifications.push({
        id: '2',
        label: 'Attention requise',
        type: 'attention' as const
      });
    }
  }

  const handleToggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    onUpdateItem({ notificationDismissed: !newState });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SidebarHeader
        categoryName={categoryName}
        categoryColor={categoryColor}
        itemName={item.name}
        itemStatus={item.status}
        onDelete={onDelete}
        onClose={onClose}
        isDark={isDark}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stats Cards Row */}
        <div className="flex gap-3">
          <StatCard
            label="Santé"
            icon={<Icons.Activity size={12} />}
            value={`${healthValue}%`}
            progress={healthValue}
            variant="gradient"
            isDark={isDark}
          />
          <StatCard
            label="Activité"
            icon={<Icons.TrendingUp size={12} />}
            value={activityCount}
            unit="événements"
            variant="dark"
            isDark={isDark}
          />
        </div>

        {/* Information Section */}
        <InfoSection
          type={categoryName}
          description={item.notificationLabel || undefined}
          value={item.value}
          onEdit={() => {
            // Will trigger edit mode - for now just log
            console.log('Edit clicked');
          }}
          isDark={isDark}
        />

        {/* Notifications Panel */}
        <NotificationsPanel
          notifications={notifications}
          enabled={notificationsEnabled}
          onToggle={handleToggleNotifications}
          onAddAlert={() => {
            // Add alert functionality
            onUpdateItem({
              status: 'warning',
              notificationDismissed: false
            });
          }}
          isDark={isDark}
        />

        {/* Widgets Panel */}
        <WidgetsPanel
          onSelectWidget={(id) => console.log('Widget selected:', id)}
          isDark={isDark}
        />

        {/* Quick Actions */}
        <QuickActions isDark={isDark} />
      </div>

      {/* Footer */}
      <div className={`p-4 border-t text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
        <span className={`text-[10px] font-mono uppercase ${textSecondary}`}>
          ID: {item.id || 'LEGACY'}
        </span>
      </div>
    </div>
  );
};

export default ItemDetailSidebar;
