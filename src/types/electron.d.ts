export interface ElectronAPI {
  getPlugins: () => Promise<any[]>;
  showPlugin: (pluginId: string | null) => Promise<void>;
  installPlugin: (pluginPath: string) => Promise<{ success: boolean; plugin?: any; error?: string }>;
  readPluginManifest: (pluginPath: string) => Promise<{ success: boolean; manifest?: any; error?: string }>;
  confirmInstallPlugin: (pluginPath: string, grantedPermissions: string[]) => Promise<{ success: boolean; plugin?: any; error?: string }>;
  deletePlugin: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
  togglePlugin: (pluginId: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
  openDiscord: () => Promise<void>;
  openFileDialog: () => Promise<string | null>;
  getPluginIconPath: (pluginId: string, iconPath: string) => Promise<string | null>;
  checkPermission: (permission: string) => Promise<{ granted: boolean }>;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  onPluginsLoaded: (callback: (plugins: any[]) => void) => void;
  getStorePlugins: (repoUrl?: string) => Promise<{ success: boolean; plugins?: any[]; error?: string }>;
  installStorePlugin: (pluginId: string, manifestUrl: string, contentUrl: string, pluginType: string, folderContentsUrl?: string) => Promise<{ success: boolean; error?: string }>;
  updateStorePlugin: (pluginId: string, manifestUrl: string, contentUrl: string, folderContentsUrl?: string) => Promise<{ success: boolean; error?: string }>;
  updatePluginOrder: (pluginOrders: { id: string; order: number }[]) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface Plugin {
  id: string;
  name: string;
  icon?: string;
  type: 'web' | 'app' | 'extension';
  entry: string;
  enabled?: boolean;
  order?: number;
  version?: string;
  description?: string;
  manifestPath?: string;
}

export interface StorePlugin {
  id: string;
  name: string;
  icon?: string;
  iconUrl?: string; // Full URL for server icons (for non-installed plugins)
  type: 'web' | 'app' | 'extension';
  entry: string;
  version?: string;
  description?: string;
  manifestUrl?: string;
  contentUrl?: string;
  folderName?: string;
  folderContentsUrl?: string;
}
