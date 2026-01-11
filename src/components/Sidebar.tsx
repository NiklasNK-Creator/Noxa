import { useState, useRef } from 'react';
import { usePluginStore } from '../store/usePluginStore';
import { useAppStore } from '../store/useAppStore';
import PluginIcon from './PluginIcon';
import SettingsIcon from './icons/SettingsIcon';
import PluginsIcon from './icons/PluginsIcon';

export default function Sidebar() {
  const { plugins, activePlugin, setActivePlugin, setPlugins, loadPlugins } = usePluginStore();
  const { currentView, setView } = useAppStore();
  const [draggedPlugin, setDraggedPlugin] = useState<string | null>(null);
  const [dragOverPlugin, setDragOverPlugin] = useState<string | null>(null);
  const dragRef = useRef<{ pluginId: string; startIndex: number } | null>(null);

  const handleSettingsClick = () => {
    setView('settings');
    setActivePlugin(null);
  };

  const handlePluginsClick = () => {
    setView('plugins');
    setActivePlugin(null);
  };

  const handlePluginClick = (pluginId: string) => {
    setView('plugin');
    setActivePlugin(pluginId);
  };

  // Sort plugins by order and filter enabled (Extensions werden nicht in Sidebar angezeigt)
  const enabledPlugins = plugins
    .filter(p => p.enabled !== false && p.type !== 'extension')
    .sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });

  const handleDragStart = (e: React.DragEvent, pluginId: string, index: number) => {
    setDraggedPlugin(pluginId);
    dragRef.current = { pluginId, startIndex: index };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pluginId);
  };

  const handleDragOver = (e: React.DragEvent, pluginId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedPlugin && draggedPlugin !== pluginId) {
      setDragOverPlugin(pluginId);
    }
  };

  const handleDragLeave = () => {
    setDragOverPlugin(null);
  };

  const handleDrop = async (e: React.DragEvent, targetPluginId: string, targetIndex: number) => {
    e.preventDefault();
    setDragOverPlugin(null);
    setDraggedPlugin(null);

    if (!dragRef.current || draggedPlugin === targetPluginId) {
      dragRef.current = null;
      return;
    }

    const { startIndex: sourceIndex } = dragRef.current;
    dragRef.current = null;

    // Reorder plugins
    const newPlugins = [...enabledPlugins];
    const [removed] = newPlugins.splice(sourceIndex, 1);
    newPlugins.splice(targetIndex, 0, removed);

    // Update order property for all plugins
    const allPlugins = [...plugins];
    const updatedPlugins = allPlugins.map((plugin) => {
      const newIndex = newPlugins.findIndex(p => p.id === plugin.id);
      if (newIndex !== -1 && plugin.enabled !== false && plugin.type !== 'extension') {
        return { ...plugin, order: newIndex };
      }
      return plugin;
    });

    // Update local state
    setPlugins(updatedPlugins);

    // Save to backend
    try {
      const pluginOrders = newPlugins.map((p, idx) => ({ id: p.id, order: idx }));
      const result = await window.electronAPI.updatePluginOrder(pluginOrders);
      if (!result.success) {
        console.error(`Error updating plugin order: ${result.error}`);
        // Reload plugins to revert
        await loadPlugins();
      }
    } catch (err: any) {
      console.error(`Error: ${err}`);
      await loadPlugins();
    }
  };

  const handleDragEnd = () => {
    setDraggedPlugin(null);
    setDragOverPlugin(null);
    dragRef.current = null;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <button
            className={`sidebar-icon ${currentView === 'settings' ? 'active' : ''}`}
            onClick={handleSettingsClick}
            title="Settings"
          >
            <SettingsIcon />
          </button>
          <button
            className={`sidebar-icon ${currentView === 'plugins' ? 'active' : ''}`}
            onClick={handlePluginsClick}
            title="Plugins"
          >
            <PluginsIcon />
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section sidebar-plugins">
          {enabledPlugins.map((plugin, index) => (
            <button
              key={plugin.id}
              className={`sidebar-icon ${activePlugin === plugin.id && currentView === 'plugin' ? 'active' : ''} ${draggedPlugin === plugin.id ? 'dragging' : ''} ${dragOverPlugin === plugin.id ? 'drag-over' : ''}`}
              onClick={() => handlePluginClick(plugin.id)}
              title={plugin.name}
              draggable
              onDragStart={(e) => handleDragStart(e, plugin.id, index)}
              onDragOver={(e) => handleDragOver(e, plugin.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, plugin.id, index)}
              onDragEnd={handleDragEnd}
            >
              <PluginIcon plugin={plugin} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
