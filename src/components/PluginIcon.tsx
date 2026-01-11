import { useEffect, useState } from 'react';
import type { Plugin } from '@/types/electron';
import type { StorePlugin } from '@/types/electron';

interface PluginIconProps {
  plugin: Plugin | StorePlugin;
}

export default function PluginIcon({ plugin }: PluginIconProps) {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Check if plugin is StorePlugin with iconUrl (from server)
    const storePlugin = plugin as StorePlugin;
    if (storePlugin.iconUrl) {
      // Use server icon URL directly
      setIconSrc(storePlugin.iconUrl);
      setIsLoading(false);
      return;
    }

    // For installed plugins, check if icon is already a data URL
    const regularPlugin = plugin as Plugin;
    if (regularPlugin.icon && (regularPlugin.icon.startsWith('data:') || regularPlugin.icon.startsWith('file://'))) {
      setIconSrc(regularPlugin.icon);
      setIsLoading(false);
      return;
    }

    // For installed plugins, get icon path from Electron
    if (regularPlugin.icon) {
      window.electronAPI.getPluginIconPath(regularPlugin.id, regularPlugin.icon).then((path) => {
        if (path) {
          setIconSrc(path);
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIconSrc(null);
      setIsLoading(false);
    }
  }, [plugin.icon, plugin.id, (plugin as StorePlugin).iconUrl]);

  if (isLoading) {
    return (
      <div className="plugin-icon-letter plugin-icon-loading">
        <div className="plugin-icon-spinner"></div>
      </div>
    );
  }

  if (iconSrc) {
    return <img src={iconSrc} alt={plugin.name} className="plugin-icon-image" onError={() => setIconSrc(null)} />;
  }

  return (
    <div className="plugin-icon-letter">
      {plugin.name.charAt(0).toUpperCase()}
    </div>
  );
}
