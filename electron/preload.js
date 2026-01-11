const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  showPlugin: (pluginId) => ipcRenderer.invoke('show-plugin', pluginId),
  installPlugin: (pluginPath) => ipcRenderer.invoke('install-plugin', pluginPath),
  readPluginManifest: (pluginPath) => ipcRenderer.invoke('read-plugin-manifest', pluginPath),
  confirmInstallPlugin: (pluginPath, grantedPermissions) => ipcRenderer.invoke('confirm-install-plugin', pluginPath, grantedPermissions),
  deletePlugin: (pluginId) => ipcRenderer.invoke('delete-plugin', pluginId),
  togglePlugin: (pluginId, enabled) => ipcRenderer.invoke('toggle-plugin', pluginId, enabled),
  openDiscord: () => ipcRenderer.invoke('open-discord'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getPluginIconPath: (pluginId, iconPath) => ipcRenderer.invoke('get-plugin-icon-path', pluginId, iconPath),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  checkPermission: (pluginId, permission) => ipcRenderer.invoke('check-plugin-permission', pluginId, permission),
  onPluginsLoaded: (callback) => {
    ipcRenderer.on('plugins-loaded', (_, plugins) => callback(plugins));
  },
  getStorePlugins: (repoUrl) => ipcRenderer.invoke('get-store-plugins', repoUrl),
  installStorePlugin: (pluginId, manifestUrl, contentUrl, pluginType, folderContentsUrl) => ipcRenderer.invoke('install-store-plugin', pluginId, manifestUrl, contentUrl, pluginType, folderContentsUrl),
  updateStorePlugin: (pluginId, manifestUrl, contentUrl, folderContentsUrl) => ipcRenderer.invoke('update-store-plugin', pluginId, manifestUrl, contentUrl, folderContentsUrl),
  updatePluginOrder: (pluginOrders) => ipcRenderer.invoke('update-plugin-order', pluginOrders),
});

