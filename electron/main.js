const { app, BrowserWindow, BrowserView, ipcMain, dialog, shell } = require('electron');
const { join, dirname } = require('path');
const { readdir, readFile, writeFile, mkdir, rm } = require('fs/promises');
const { existsSync } = require('fs');
const AdmZip = require('adm-zip');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;
const pluginViews = new Map();
let currentActivePlugin = null;

// When running in development, keep a separate userData folder so
// installed and dev instances don't share the same configs/plugins.
if (isDev) {
  try {
    const defaultUserData = app.getPath('userData');
    const devUserData = join(defaultUserData, 'noxa-dev');
    app.setPath('userData', devUserData);
    console.log('Using dev userData path:', devUserData);
  } catch (err) {
    console.warn('Could not set dev userData path', err);
  }
}

const PLUGINS_DIR = join(app.getPath('userData'), 'plugins');
const DEFAULT_PLUGINS_DIR = isDev
  ? join(__dirname, '../plugins')
  : join(process.resourcesPath || __dirname, 'plugins');


async function ensurePluginsDir() {
  if (!existsSync(PLUGINS_DIR)) {
    await mkdir(PLUGINS_DIR, { recursive: true });
    await copyDefaultPlugins();
  }
}

async function copyDefaultPlugins() {
  try {
    if (!existsSync(DEFAULT_PLUGINS_DIR)) return;

    const defaultPlugins = await readdir(DEFAULT_PLUGINS_DIR, { withFileTypes: true });
    
    for (const pluginDir of defaultPlugins) {
      if (pluginDir.isDirectory()) {
        const sourcePath = join(DEFAULT_PLUGINS_DIR, pluginDir.name);
        const targetPath = join(PLUGINS_DIR, pluginDir.name);
        
        if (!existsSync(targetPath)) {
          await copyDirectory(sourcePath, targetPath);
        }
      }
    }
  } catch (error) {
    console.error('Error copying default plugins:', error);
  }
}

async function copyDirectory(source, target) {
  await mkdir(target, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      const content = await readFile(sourcePath);
      await writeFile(targetPath, content);
    }
  }
}

async function getPluginIconPath(pluginId, iconPath) {
  if (!iconPath) return null;
  const iconFullPath = join(PLUGINS_DIR, pluginId, iconPath);
  if (existsSync(iconFullPath)) {
    try {
      // Lese Icon als Buffer und konvertiere zu base64 data URL
      const iconBuffer = await readFile(iconFullPath);
      const ext = iconPath.split('.').pop().toLowerCase();
      let mimeType = 'image/png';
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      else if (ext === 'gif') mimeType = 'image/gif';
      else if (ext === 'webp') mimeType = 'image/webp';
      
      const base64 = iconBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error(`Error reading icon ${iconFullPath}:`, error);
      return null;
    }
  }
  return null;
}

async function loadPlugins() {
  await ensurePluginsDir();
  const plugins = [];
  
  try {
    const entries = await readdir(PLUGINS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = join(PLUGINS_DIR, entry.name, 'manifest.json');
        if (existsSync(manifestPath)) {
          try {
            const manifestContent = await readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);
            const plugin = { ...manifest, id: entry.name };
            
            // Ensure order property exists (default to 999 if not set)
            if (plugin.order === undefined || plugin.order === null) {
              plugin.order = 999;
            }
            
            // Konvertiere Icon zu base64 data URL wenn vorhanden
            if (plugin.icon) {
              plugin.icon = await getPluginIconPath(entry.name, plugin.icon);
            }
            
            plugins.push(plugin);
          } catch (error) {
            console.error(`Error loading plugin ${entry.name}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading plugins directory:', error);
  }
  
  return plugins;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1e1e1e',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.center();
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    pluginViews.forEach(view => {
      view.webContents.destroy();
    });
    pluginViews.clear();
  });
}

// Helper function to load and execute extensions
async function loadExtension(pluginId, manifest) {
  try {
    const extensionPath = join(PLUGINS_DIR, pluginId, manifest.entry);
    if (existsSync(extensionPath)) {
      const extensionCode = await readFile(extensionPath, 'utf-8');
      if (mainWindow && mainWindow.webContents) {
        // Prüfe ob Extension bereits geladen ist (verhindert doppelte Ausführung)
        const isAlreadyLoaded = await mainWindow.webContents.executeJavaScript(`
          (function() {
            // Prüfe ob Extension bereits existiert (abhängig vom Extension-ID)
            const extensionId = '${pluginId}';
            const checkSelectors = {
              'galaxy-theme': document.getElementById('galaxy-theme-styles'),
              'multi-theme-pack': document.getElementById('multi-theme-pack-styles'),
              'advanced-settings': document.getElementById('advanced-settings-container')
            };
            return !!checkSelectors[extensionId];
          })();
        `);
        
        if (isAlreadyLoaded) {
          console.log(`Extension ${pluginId} already loaded, skipping`);
          return;
        }
        
        // Warte bis das Hauptfenster geladen ist
        await mainWindow.webContents.executeJavaScript(`
          (function() {
            try {
              ${extensionCode}
            } catch (error) {
              console.error('Error executing extension ${pluginId}:', error);
            }
          })();
        `);
        console.log(`Extension ${pluginId} loaded and executed`);
      }
    }
  } catch (error) {
    console.error(`Error loading extension ${pluginId}:`, error);
  }
}

async function createPluginView(pluginId, manifest) {
  // Extensions werden direkt im Hauptfenster ausgeführt, nicht als separate View
  if (manifest.type === 'extension') {
    await loadExtension(pluginId, manifest);
    // Extensions brauchen keine View, geben null zurück
    return null;
  }

  // Lade Manifest um Permissions zu prüfen
  let grantedPermissions = [];
  try {
    const manifestPath = join(PLUGINS_DIR, pluginId, 'manifest.json');
    if (existsSync(manifestPath)) {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      grantedPermissions = manifest.grantedPermissions || [];
    }
  } catch (e) {
    console.warn(`Could not load permissions for ${pluginId}:`, e);
  }

  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      // Erlaube Media-Zugriff für Plugins mit entsprechenden Permissions
      allowRunningInsecureContent: false,
    },
  });

  // Erlaube Media-Zugriff (Mikrofon, Kamera) für Plugins mit media Permission
  if (grantedPermissions.includes('media') || grantedPermissions.includes('microphone') || grantedPermissions.includes('camera')) {
    view.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') {
        callback(grantedPermissions.includes('media') || grantedPermissions.includes('microphone') || grantedPermissions.includes('camera'));
      } else if (permission === 'microphone') {
        callback(grantedPermissions.includes('microphone') || grantedPermissions.includes('media'));
      } else if (permission === 'camera') {
        callback(grantedPermissions.includes('camera') || grantedPermissions.includes('media'));
      } else {
        callback(false);
      }
    });

    // Erlaube Feature Policy für Media
    view.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
      if (permission === 'media' || permission === 'microphone' || permission === 'camera') {
        return grantedPermissions.includes('media') || 
               grantedPermissions.includes('microphone') || 
               grantedPermissions.includes('camera');
      }
      return false;
    });
  }

  if (manifest.type === 'web') {
    view.webContents.loadURL(manifest.entry);
  } else {
    const htmlPath = join(PLUGINS_DIR, pluginId, manifest.entry);
    view.webContents.loadFile(htmlPath);
  }

  view.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  return view;
}

async function preloadPlugins(plugins) {
  for (const plugin of plugins) {
    // Nur laden wenn enabled !== false (Extensions werden separat geladen)
    if (plugin.enabled !== false) {
      try {
        if (plugin.type === 'extension') {
          // Extensions werden direkt geladen, nicht preloaded
          // Sie werden beim did-finish-load des Hauptfensters geladen
          continue;
        }
        
        const view = await createPluginView(plugin.id, plugin);
        // Nur Views speichern (nicht Extensions)
        if (view) {
          pluginViews.set(plugin.id, view);
          
          view.webContents.on('did-finish-load', () => {
            view.webContents.executeJavaScript(`
              document.addEventListener('DOMContentLoaded', () => {
                document.body.style.opacity = '0';
              });
            `);
          });
        }
      } catch (error) {
        console.error(`Error preloading plugin ${plugin.id}:`, error);
      }
    }
  }
}

function showPlugin(pluginId) {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  const titleBarHeight = 40;
  const sidebarWidth = 80;
  
  const viewBounds = {
    x: sidebarWidth,
    y: titleBarHeight,
    width: bounds.width - sidebarWidth,
    height: bounds.height - titleBarHeight,
  };

  if (currentActivePlugin && pluginViews.has(currentActivePlugin)) {
    const previousView = pluginViews.get(currentActivePlugin);
    if (previousView) {
      previousView.webContents.executeJavaScript(`
        document.body.style.opacity = '0';
      `);
      mainWindow.removeBrowserView(previousView);
    }
  }

  currentActivePlugin = pluginId;

  if (pluginId && pluginViews.has(pluginId)) {
    const view = pluginViews.get(pluginId);
    if (view) {
      mainWindow.addBrowserView(view);
      view.setBounds(viewBounds);
      view.webContents.executeJavaScript(`
        document.body.style.opacity = '1';
      `);
    }
  } else       if (pluginId) {
        loadPlugins().then(async (plugins) => {
          const plugin = plugins.find(p => p.id === pluginId);
          if (plugin) {
            // Extensions werden nicht als View angezeigt
            if (plugin.type === 'extension') {
              console.log(`Extension ${pluginId} cannot be displayed as a view`);
              currentActivePlugin = null;
              return;
            }
            const view = await createPluginView(pluginId, plugin);
            if (view) {
              pluginViews.set(pluginId, view);
              mainWindow?.addBrowserView(view);
              view.setBounds(viewBounds);
              view.webContents.executeJavaScript(`
                document.body.style.opacity = '1';
              `);
            }
          }
        });
      }
}

function updateViewBounds() {
  if (!mainWindow) return;

  const bounds = mainWindow.getBounds();
  const titleBarHeight = 40;
  const sidebarWidth = 80;
  
  const viewBounds = {
    x: sidebarWidth,
    y: titleBarHeight,
    width: bounds.width - sidebarWidth,
    height: bounds.height - titleBarHeight,
  };

  if (currentActivePlugin && pluginViews.has(currentActivePlugin)) {
    const view = pluginViews.get(currentActivePlugin);
    if (view) {
      view.setBounds(viewBounds);
    }
  }
}

app.whenReady().then(async () => {
  await ensurePluginsDir();
  const plugins = await loadPlugins();
  await preloadPlugins(plugins);
  createWindow();

  if (mainWindow) {
    mainWindow.webContents.on('did-finish-load', async () => {
      mainWindow?.webContents.send('plugins-loaded', plugins);
      
      // Lade Extensions nachdem das Fenster vollständig geladen ist
      // Warte bis React vollständig initialisiert ist (mehrere Versuche)
      let attempts = 0;
      const maxAttempts = 20; // 4 Sekunden total
      
      const tryLoadExtensions = setInterval(async () => {
        attempts++;
        
        // Prüfe ob React bereit ist (root element existiert)
        const isReady = await mainWindow.webContents.executeJavaScript(`
          (function() {
            return !!document.getElementById('root') && 
                   !!document.querySelector('.app, .settings-view, .sidebar');
          })();
        `);
        
        if (isReady || attempts >= maxAttempts) {
          clearInterval(tryLoadExtensions);
          
          // Lade Extensions
          for (const plugin of plugins) {
            if (plugin.enabled !== false && plugin.type === 'extension') {
              try {
                await loadExtension(plugin.id, plugin);
              } catch (error) {
                console.error(`Error loading extension ${plugin.id}:`, error);
              }
            }
          }
        }
      }, 200);
    });

    mainWindow.on('resize', () => {
      updateViewBounds();
    });

    mainWindow.on('move', () => {
      updateViewBounds();
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-plugins', async () => {
  return await loadPlugins();
});

ipcMain.handle('show-plugin', async (_, pluginId) => {
  showPlugin(pluginId);
});

ipcMain.handle('read-plugin-manifest', async (_, pluginPath) => {
  try {
    const zip = new AdmZip(pluginPath);
    const entries = zip.getEntries();
    const manifestEntry = entries.find(e => e.entryName.endsWith('manifest.json'));
    
    if (!manifestEntry) {
      throw new Error('No manifest.json found in plugin package');
    }

    const manifestContent = manifestEntry.getData().toString('utf-8');
    const manifest = JSON.parse(manifestContent);
    
    if (!manifest.id || !manifest.name) {
      throw new Error('Invalid manifest: missing id or name');
    }
    
    return { success: true, manifest };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
// Helper to perform plugin installation (used by both handlers)
async function performInstall(pluginPath, grantedPermissions) {
  try {
    const zip = new AdmZip(pluginPath);
    const entries = zip.getEntries();
    const manifestEntry = entries.find(e => e.entryName.endsWith('manifest.json'));
    
    if (!manifestEntry) {
      throw new Error('No manifest.json found in plugin package');
    }

    const manifestContent = manifestEntry.getData().toString('utf-8');
    const manifest = JSON.parse(manifestContent);
    
    if (!manifest.id || !manifest.name) {
      throw new Error('Invalid manifest: missing id or name');
    }

    // Save granted permissions in manifest
    manifest.grantedPermissions = grantedPermissions || [];

    const pluginDir = join(PLUGINS_DIR, manifest.id);
    
    if (existsSync(pluginDir)) {
      await rm(pluginDir, { recursive: true, force: true });
    }
    
    await mkdir(pluginDir, { recursive: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory) {
        let targetPath = join(pluginDir, entry.entryName);
        
        // Replace manifest.json with the updated version
        if (entry.entryName.endsWith('manifest.json')) {
          await writeFile(targetPath, JSON.stringify(manifest, null, 2));
        } else {
          const targetDir = dirname(targetPath);
          
          if (!existsSync(targetDir)) {
            await mkdir(targetDir, { recursive: true });
          }
          
          await writeFile(targetPath, entry.getData());
        }
      }
    }

    const plugins = await loadPlugins();
    const newPlugin = plugins.find(p => p.id === manifest.id);
    
    if (newPlugin && newPlugin.enabled !== false) {
      const view = await createPluginView(newPlugin.id, newPlugin);
      // Nur Views speichern (nicht Extensions)
      if (view) {
        pluginViews.set(newPlugin.id, view);
      }
    }
    
    // Notify renderer(s) that plugins changed
    try {
      const refreshed = await loadPlugins();
      if (mainWindow) mainWindow.webContents.send('plugins-loaded', refreshed);
    } catch (e) {
      console.warn('Could not notify renderer about plugin install', e);
    }

    return { success: true, plugin: newPlugin };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

ipcMain.handle('confirm-install-plugin', async (_, pluginPath, grantedPermissions) => {
  return await performInstall(pluginPath, grantedPermissions);
});

ipcMain.handle('install-plugin', async (_, pluginPath) => {
  // Legacy support - install without permissions check
  return await performInstall(pluginPath, []);
});

ipcMain.handle('delete-plugin', async (_, pluginId) => {
  try {
    if (pluginViews.has(pluginId)) {
      const view = pluginViews.get(pluginId);
      if (view) {
        view.webContents.destroy();
      }
      pluginViews.delete(pluginId);
    }

    if (currentActivePlugin === pluginId) {
      showPlugin(null);
      currentActivePlugin = null;
    }

    const pluginDir = join(PLUGINS_DIR, pluginId);
    if (existsSync(pluginDir)) {
      await rm(pluginDir, { recursive: true, force: true });
    }

    // Notify renderer(s) that plugins changed
    try {
      const refreshed = await loadPlugins();
      if (mainWindow) mainWindow.webContents.send('plugins-loaded', refreshed);
    } catch (e) {
      console.warn('Could not notify renderer about plugin delete', e);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-plugin', async (_, pluginId, enabled) => {
  try {
    const manifestPath = join(PLUGINS_DIR, pluginId, 'manifest.json');
    if (existsSync(manifestPath)) {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      if (enabled) {
        // Extension aktivieren
        if (manifest.type === 'extension') {
          // Extension wird direkt geladen - warte auf React Ready
          if (mainWindow && mainWindow.webContents) {
            const isReady = await mainWindow.webContents.executeJavaScript(`
              (function() {
                return !!document.getElementById('root') && 
                       !!document.querySelector('.app, .settings-view, .sidebar');
              })();
            `);
            
            if (isReady) {
              await loadExtension(pluginId, manifest);
            } else {
              // Warte bis React bereit ist
              setTimeout(async () => {
                await loadExtension(pluginId, manifest);
              }, 500);
            }
          }
        } else if (!pluginViews.has(pluginId)) {
          // Normale Plugins
          const view = await createPluginView(pluginId, manifest);
          if (view) {
            pluginViews.set(pluginId, view);
          }
        }
        manifest.enabled = true;
      } else {
        // Extension deaktivieren
        if (manifest.type === 'extension' && mainWindow) {
          // Extension cleanup - rufe die Cleanup-Funktion auf
          const cleanupFunctionName = `${pluginId.replace(/-/g, '')}Cleanup`; // z.B. galaxythemeCleanup
          await mainWindow.webContents.executeJavaScript(`
            (function() {
              // Versuche verschiedene Cleanup-Funktionsnamen
              const cleanupFunctions = [
                window.${cleanupFunctionName},
                window.galaxyThemeCleanup,
                window['${pluginId}Cleanup'],
                window['${pluginId.replace(/-/g, '_')}_cleanup']
              ];
              
              for (const cleanup of cleanupFunctions) {
                if (cleanup && typeof cleanup === 'function') {
                  try {
                    cleanup();
                    break;
                  } catch (e) {
                    console.error('Error in extension cleanup:', e);
                  }
                }
              }
              
              // Entferne auch alle Extension-spezifischen Styles
              const extensionStyles = document.querySelectorAll('style[id*="${pluginId}"], style[id*="galaxy-theme"], style[id*="galaxy"]');
              extensionStyles.forEach(style => style.remove());
              
              // Entferne Extension-spezifische Container
              const extensionContainers = document.querySelectorAll('[id*="${pluginId}"], [id*="galaxy-stars"], [id*="galaxy-theme"]');
              extensionContainers.forEach(container => {
                if (container.id && (container.id.includes('${pluginId}') || container.id.includes('galaxy'))) {
                  container.remove();
                }
              });
              
              // Entferne alle star-float Animation Styles
              const allStyles = Array.from(document.querySelectorAll('style'));
              allStyles.forEach(style => {
                if (style.textContent && style.textContent.includes('star-float')) {
                  style.remove();
                }
              });
            })();
          `);
          
          // Warte kurz, damit Cleanup abgeschlossen ist
          await new Promise(resolve => setTimeout(resolve, 100));
        } else if (pluginViews.has(pluginId)) {
          // Normale Plugins
          const view = pluginViews.get(pluginId);
          if (view) {
            view.webContents.destroy();
          }
          pluginViews.delete(pluginId);
        }
        manifest.enabled = false;
      }
      
      // Speichere aktualisiertes Manifest
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // Notify renderer(s) that plugins changed
      try {
        const refreshed = await loadPlugins();
        if (mainWindow) mainWindow.webContents.send('plugins-loaded', refreshed);
      } catch (e) {
        console.warn('Could not notify renderer about plugin toggle', e);
      }

      return { success: true };
    }
    return { success: false, error: 'Plugin not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-discord', () => {
  shell.openExternal('https://discord.gg/your-plugin-discord');
});

ipcMain.handle('check-plugin-permission', async (_, pluginId, permission) => {
  try {
    const manifestPath = join(PLUGINS_DIR, pluginId, 'manifest.json');
    if (existsSync(manifestPath)) {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      const grantedPermissions = manifest.grantedPermissions || [];
      return { granted: grantedPermissions.includes(permission) };
    }
    return { granted: false };
  } catch (error) {
    return { granted: false };
  }
});

ipcMain.handle('get-plugin-icon-path', async (_, pluginId, iconPath) => {
  return await getPluginIconPath(pluginId, iconPath);
});

ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Plugin Packages', extensions: ['zip'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

// Default Plugin Server URL (use 127.0.0.1 instead of localhost to avoid IPv6 issues)
const DEFAULT_STORE_SERVER = process.env.PLUGIN_SERVER_URL || 'https://noxa-store.onrender.com';

// Helper function to fetch from GitHub API
function fetchFromGitHub(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Noxa-Client',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, (res) => {
      // Handle HTTP errors
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        // Follow redirect
        return fetchFromGitHub(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode === 404) {
        return reject(new Error('Repository not found. Please check if the repository exists and is public.'));
      }
      
      if (res.statusCode === 403) {
        // Check rate limit headers
        const rateLimitRemaining = res.headers['x-ratelimit-remaining'];
        const rateLimitReset = res.headers['x-ratelimit-reset'];
        if (rateLimitRemaining === '0') {
          const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'später';
          return reject(new Error(`GitHub Rate Limit erreicht. Bitte versuche es ${resetDate} erneut. Das Repository könnte auch privat sein.`));
        }
        return reject(new Error('Zugriff verweigert. Das Repository könnte privat sein oder nicht existieren.'));
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub API returned status ${res.statusCode}: ${res.statusMessage}`));
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Check if it's an error message from GitHub
          if (parsed.message) {
            reject(new Error(`GitHub API Error: ${parsed.message}`));
            return;
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse JSON response: ${e.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });
  });
}

// Helper function to fetch JSON from URL (supports both HTTP and HTTPS)
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      protocol.get(url, {
        headers: { 'User-Agent': 'Noxa-Client', 'Accept': 'application/json' },
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          return fetchJSON(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to fetch: ${res.statusCode} ${res.statusMessage}`));
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${e.message}`));
          }
        });
      }).on('error', reject);
    } catch (e) {
      reject(new Error(`Invalid URL: ${e.message}`));
    }
  });
}

// Helper function to fetch text content from URL (supports both HTTP and HTTPS)
function fetchTextContent(url) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      protocol.get(url, {
        headers: { 'User-Agent': 'Noxa-Client' },
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          return fetchTextContent(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to fetch: ${res.statusCode} ${res.statusMessage}`));
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    } catch (e) {
      reject(new Error(`Invalid URL: ${e.message}`));
    }
  });
}

// Helper function to download file from URL (supports both HTTP and HTTPS)
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      protocol.get(url, {
        headers: {
          'User-Agent': 'Noxa-Client',
        },
      }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301 || res.statusCode === 307 || res.statusCode === 308) {
          return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
        }
        const fileStream = require('fs').createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(destPath);
        });
        fileStream.on('error', reject);
      }).on('error', reject);
    } catch (e) {
      reject(new Error(`Invalid URL: ${e.message}`));
    }
  });
}

// Get store plugins from server
ipcMain.handle('get-store-plugins', async (_, serverUrl) => {
  try {
    // Normalisiere Server-URL (entferne Leerzeichen und trailing slash)
    let serverApiUrl = (serverUrl || DEFAULT_STORE_SERVER).trim().replace(/\s+/g, '');
    if (serverApiUrl.endsWith('/')) {
      serverApiUrl = serverApiUrl.slice(0, -1);
    }
    
    // Konstruiere API URL
    const apiUrl = new URL('/api/plugins', serverApiUrl).href;
    
    console.log(`Fetching plugins from server: ${apiUrl}`);
    
    try {
      const response = await fetchJSON(apiUrl);
      
      if (!response.success) {
        console.warn('Server returned error:', response.error);
        return { success: true, plugins: [] };
      }
      
      if (!response.plugins || !Array.isArray(response.plugins)) {
        console.warn('Server returned invalid plugins array');
        return { success: true, plugins: [] };
      }

      // Transform server response to client format
      const plugins = response.plugins.map(plugin => {
        const baseUrl = new URL(`/api/plugins/${plugin.id}`, serverApiUrl).href;
        const manifestUrl = baseUrl + '/manifest';
        const folderContentsUrl = baseUrl + '/folder';
        
        // Build content URL (folder endpoint for downloading all files)
        const contentUrl = folderContentsUrl;
        
        // Build icon URL if icon is specified
        const iconUrl = plugin.icon ? baseUrl + '/files/' + plugin.icon : undefined;

        return {
          id: plugin.id,
          name: plugin.name,
          icon: plugin.icon, // Keep icon filename for local use after install
          iconUrl: iconUrl, // Full URL for server icons
          type: plugin.type || 'app',
          entry: plugin.entry,
          version: plugin.version || '1.0.0',
          description: plugin.description || '',
          manifestUrl: manifestUrl,
          contentUrl: contentUrl,
          folderName: plugin.folderName || plugin.id,
          folderContentsUrl: folderContentsUrl,
        };
      });

      console.log(`Successfully fetched ${plugins.length} plugins from server`);
      return { success: true, plugins };
    } catch (fetchError) {
      console.warn('Could not fetch from server:', fetchError.message);
      return { success: true, plugins: [] };
    }
  } catch (error) {
    console.error('Error loading store plugins:', error);
    return { success: false, error: error.message };
  }
});

// Install plugin from store
ipcMain.handle('install-store-plugin', async (_, pluginId, manifestUrl, contentUrl, pluginType, folderContentsUrl) => {
  try {
    return await performStoreInstall(pluginId, manifestUrl, contentUrl, folderContentsUrl, false);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update plugin from store
ipcMain.handle('update-store-plugin', async (_, pluginId, manifestUrl, contentUrl, folderContentsUrl) => {
  try {
    // Same as install, but for update
    return await performStoreInstall(pluginId, manifestUrl, contentUrl, folderContentsUrl, true);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper function for store install/update
async function performStoreInstall(pluginId, manifestUrl, contentUrl, folderContentsUrl, isUpdate = false) {
  try {
    // Validate manifestUrl
    if (!manifestUrl || manifestUrl.trim() === '') {
      throw new Error(`Invalid manifestUrl: ${manifestUrl}`);
    }
    
    // Extract base server URL from folderContentsUrl or manifestUrl
    const baseServerUrl = folderContentsUrl 
      ? new URL(folderContentsUrl).origin
      : new URL(manifestUrl).origin;
    
    // Download manifest from server (returns JSON)
    console.log(`Fetching manifest from ${manifestUrl} for plugin ${pluginId}`);
    let manifest;
    try {
      const manifestResponse = await fetchJSON(manifestUrl);
      manifest = manifestResponse.manifest || manifestResponse;
      console.log(`Successfully fetched manifest for ${pluginId}`);
    } catch (e) {
      console.warn(`Failed to fetch manifest as JSON, trying as text: ${e.message}`);
      // Fallback: versuche als Text zu laden
      const manifestContent = await fetchTextContent(manifestUrl);
      manifest = JSON.parse(manifestContent);
    }
    
    if (!manifest.id || !manifest.name) {
      throw new Error('Invalid manifest: missing id or name');
    }

    const pluginDir = join(PLUGINS_DIR, pluginId);
    const existingManifestPath = join(pluginDir, 'manifest.json');
    let existingOrder = 0;
    
    if (isUpdate && existsSync(existingManifestPath)) {
      try {
        const existingManifest = JSON.parse(await readFile(existingManifestPath, 'utf-8'));
        existingOrder = existingManifest.order ?? 0;
      } catch (e) {
        console.warn('Could not read existing manifest for order:', e);
      }
    } else {
      const plugins = await loadPlugins();
      existingOrder = plugins.length;
    }
    
    if (existsSync(pluginDir) && isUpdate) {
      await rm(pluginDir, { recursive: true, force: true });
    }
    
    if (!existsSync(pluginDir)) {
      await mkdir(pluginDir, { recursive: true });
    }

    // Download content - prüfe ob es eine ZIP oder ein Ordner ist
    if (contentUrl && (contentUrl.endsWith('.zip') || contentUrl.includes('.zip'))) {
      // ZIP-Datei downloaden
      const tempZipPath = join(pluginDir, 'temp.zip');
      await downloadFile(contentUrl, tempZipPath);
      
      const zip = new AdmZip(tempZipPath);
      zip.extractAllTo(pluginDir, true);
      
      await rm(tempZipPath, { force: true });
      
      // Update manifest mit order
      const manifestPath = join(pluginDir, 'manifest.json');
      if (existsSync(manifestPath)) {
        const extractedManifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
        extractedManifest.order = existingOrder;
        await writeFile(manifestPath, JSON.stringify(extractedManifest, null, 2));
      }
    } else {
      // Alle Dateien aus dem Plugin-Ordner downloaden
      // Speichere Manifest zuerst
      const manifestPath = join(pluginDir, 'manifest.json');
      manifest.order = existingOrder;
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      
      // Lade alle Dateien aus dem Ordner, wenn folderContentsUrl vorhanden ist
      if (folderContentsUrl) {
        try {
          // Fetch folder contents from server
          const folderResponse = await fetchJSON(folderContentsUrl);
          
          if (folderResponse.success && Array.isArray(folderResponse.files)) {
            // Download alle Dateien aus dem Ordner
            for (const file of folderResponse.files) {
              if (file.type === 'file' && file.downloadUrl && file.name !== 'manifest.json') {
                // Überspringe manifest.json (wurde bereits geschrieben)
                try {
                  const filePath = join(pluginDir, file.name);
                  
                  // Erstelle Verzeichnisse falls nötig
                  const fileDir = dirname(filePath);
                  if (!existsSync(fileDir)) {
                    await mkdir(fileDir, { recursive: true });
                  }
                  
                  // Convert relative downloadUrl to absolute URL
                  const fileDownloadUrl = file.downloadUrl.startsWith('http')
                    ? file.downloadUrl
                    : new URL(file.downloadUrl, baseServerUrl).href;
                  
                  // Download file from server
                  console.log(`Downloading ${file.name} from ${fileDownloadUrl}`);
                  await downloadFile(fileDownloadUrl, filePath);
                  console.log(`Downloaded ${file.name} for plugin ${pluginId}`);
                } catch (fileError) {
                  console.warn(`Could not download file ${file.name}: ${fileError.message}`);
                }
              }
            }
          }
        } catch (folderError) {
          console.warn(`Could not fetch folder contents for ${pluginId}: ${folderError.message}`);
          // Fallback: Versuche entry file und icon einzeln zu downloaden
          if (manifest.entry) {
            try {
              const entryUrl = `${baseServerUrl}/api/plugins/${pluginId}/files/${manifest.entry}`;
              const entryPath = join(pluginDir, manifest.entry);
              await downloadFile(entryUrl, entryPath);
            } catch (e) {
              console.warn(`Could not download entry file: ${e.message}`);
            }
          }
          if (manifest.icon) {
            try {
              const iconUrl = `${baseServerUrl}/api/plugins/${pluginId}/files/${manifest.icon}`;
              const iconPath = join(pluginDir, manifest.icon);
              await downloadFile(iconUrl, iconPath);
            } catch (e) {
              console.warn(`Could not download icon: ${e.message}`);
            }
          }
        }
      } else {
        // Fallback ohne folderContentsUrl: Lade nur entry und icon
        if (manifest.entry) {
          const baseDir = contentUrl ? contentUrl.substring(0, contentUrl.lastIndexOf('/')) : manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));
          const entryUrl = `${baseDir}/${manifest.entry}`;
          const entryPath = join(pluginDir, manifest.entry);
          try {
            await downloadFile(entryUrl, entryPath);
          } catch (e) {
            console.warn(`Could not download entry file: ${e.message}`);
          }
        }
        if (manifest.icon) {
          const baseDir = contentUrl ? contentUrl.substring(0, contentUrl.lastIndexOf('/')) : manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));
          const iconUrl = `${baseDir}/${manifest.icon}`;
          const iconPath = join(pluginDir, manifest.icon);
          try {
            await downloadFile(iconUrl, iconPath);
          } catch (e) {
            console.warn(`Could not download icon: ${e.message}`);
          }
        }
      }
    }

    // Für Extensions: Lade und führe die Extension sofort aus
    if (manifest.type === 'extension') {
      try {
        // Warte kurz, damit React bereit ist
        if (mainWindow && mainWindow.webContents) {
          const isReady = await mainWindow.webContents.executeJavaScript(`
            (function() {
              return !!document.getElementById('root') && 
                     !!document.querySelector('.app, .settings-view, .sidebar');
            })();
          `);
          
          if (isReady) {
            await loadExtension(pluginId, manifest);
          } else {
            // Warte bis React bereit ist
            setTimeout(async () => {
              await loadExtension(pluginId, manifest);
            }, 500);
          }
        }
      } catch (e) {
        console.error(`Error loading extension ${pluginId} after install:`, e);
        // Extension sollte trotzdem installiert bleiben
      }
    } else {
      // Reload plugin if it was enabled (nur für Web/App Plugins)
      if (pluginViews.has(pluginId)) {
        const view = pluginViews.get(pluginId);
        if (view) {
          view.webContents.destroy();
        }
        pluginViews.delete(pluginId);
        
        const plugins = await loadPlugins();
        const updatedPlugin = plugins.find(p => p.id === pluginId);
        if (updatedPlugin && updatedPlugin.enabled !== false) {
          const view = await createPluginView(pluginId, updatedPlugin);
          if (view) {
            pluginViews.set(pluginId, view);
          }
        }
      }
    }

    // Notify renderer(s)
    try {
      const refreshed = await loadPlugins();
      if (mainWindow) mainWindow.webContents.send('plugins-loaded', refreshed);
    } catch (e) {
      console.warn('Could not notify renderer about plugin update', e);
    }

    return { success: true };
  } catch (error) {
    console.error('Error performing store install/update:', error);
    return { success: false, error: error.message };
  }
}

// Update plugin order
ipcMain.handle('update-plugin-order', async (_, pluginOrders) => {
  try {
    for (const { id, order } of pluginOrders) {
      const manifestPath = join(PLUGINS_DIR, id, 'manifest.json');
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
        manifest.order = order;
        await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      }
    }

    // Notify renderer(s)
    try {
      const refreshed = await loadPlugins();
      if (mainWindow) mainWindow.webContents.send('plugins-loaded', refreshed);
    } catch (e) {
      console.warn('Could not notify renderer about order update', e);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
