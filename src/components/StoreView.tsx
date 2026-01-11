import { useState, useEffect } from 'react';
import { usePluginStore } from '../store/usePluginStore';
import { useSettingsStore } from '../store/useSettingsStore';
import PluginIcon from './PluginIcon';
import InstallDialog from './InstallDialog';
import ExtensionWarningDialog from './ExtensionWarningDialog';
import type { StorePlugin } from '../types/electron';

const translations: Record<string, Record<string, string>> = {
  en: {
    store: 'Store',
    reload: 'Reload',
    loading: 'Loading store...',
    error: 'Error loading store',
    install: 'Install',
    uninstall: 'Uninstall',
    update: 'Update',
    installed: 'Installed',
    noStorePlugins: 'No plugins available in store',
    extension: 'Extension',
    web: 'Web',
    app: 'App',
    type: 'Type',
  },
  de: {
    store: 'Store',
    reload: 'Neu laden',
    loading: 'Store wird geladen...',
    error: 'Fehler beim Laden des Stores',
    install: 'Installieren',
    uninstall: 'Deinstallieren',
    update: 'Aktualisieren',
    installed: 'Installiert',
    noStorePlugins: 'Keine Plugins im Store verfügbar',
    extension: 'Extension',
    web: 'Web',
    app: 'App',
    type: 'Typ',
  },
  es: {
    store: 'Tienda',
    reload: 'Recargar',
    loading: 'Cargando tienda...',
    error: 'Error al cargar la tienda',
    install: 'Instalar',
    uninstall: 'Desinstalar',
    update: 'Actualizar',
    installed: 'Instalado',
    noStorePlugins: 'No hay complementos disponibles en la tienda',
    extension: 'Extensión',
    web: 'Web',
    app: 'App',
    type: 'Tipo',
  },
  fr: {
    store: 'Boutique',
    reload: 'Recharger',
    loading: 'Chargement de la boutique...',
    error: 'Erreur lors du chargement de la boutique',
    install: 'Installer',
    uninstall: 'Désinstaller',
    update: 'Mettre à jour',
    installed: 'Installé',
    noStorePlugins: 'Aucun plugin disponible dans la boutique',
    extension: 'Extension',
    web: 'Web',
    app: 'App',
    type: 'Type',
  },
  ja: {
    store: 'ストア',
    reload: '再読み込み',
    loading: 'ストアを読み込んでいます...',
    error: 'ストアの読み込みエラー',
    install: 'インストール',
    uninstall: 'アンインストール',
    update: '更新',
    installed: 'インストール済み',
    noStorePlugins: 'ストアにプラグインがありません',
    extension: '拡張機能',
    web: 'Web',
    app: 'App',
    type: 'タイプ',
  },
  zh: {
    store: '商店',
    reload: '重新加载',
    loading: '正在加载商店...',
    error: '加载商店时出错',
    install: '安装',
    uninstall: '卸载',
    update: '更新',
    installed: '已安装',
    noStorePlugins: '商店中没有可用的插件',
    extension: '扩展',
    web: 'Web',
    app: 'App',
    type: '类型',
  },
  ru: {
    store: 'Магазин',
    reload: 'Перезагрузить',
    loading: 'Загрузка магазина...',
    error: 'Ошибка загрузки магазина',
    install: 'Установить',
    uninstall: 'Удалить',
    update: 'Обновить',
    installed: 'Установлено',
    noStorePlugins: 'В магазине нет доступных плагинов',
    extension: 'Расширение',
    web: 'Web',
    app: 'App',
    type: 'Тип',
  },
  pt: {
    store: 'Loja',
    reload: 'Recarregar',
    loading: 'Carregando loja...',
    error: 'Erro ao carregar loja',
    install: 'Instalar',
    uninstall: 'Desinstalar',
    update: 'Atualizar',
    installed: 'Instalado',
    noStorePlugins: 'Nenhum plugin disponível na loja',
    extension: 'Extensão',
    web: 'Web',
    app: 'App',
    type: 'Tipo',
  },
  it: {
    store: 'Negozio',
    reload: 'Ricarica',
    loading: 'Caricamento negozio...',
    error: 'Errore nel caricamento del negozio',
    install: 'Installa',
    uninstall: 'Disinstalla',
    update: 'Aggiorna',
    installed: 'Installato',
    noStorePlugins: 'Nessun plugin disponibile nel negozio',
    extension: 'Estensione',
    web: 'Web',
    app: 'App',
    type: 'Tipo',
  },
  nl: {
    store: 'Winkel',
    reload: 'Vernieuwen',
    loading: 'Winkel laden...',
    error: 'Fout bij laden winkel',
    install: 'Installeren',
    uninstall: 'Deïnstalleren',
    update: 'Bijwerken',
    installed: 'Geïnstalleerd',
    noStorePlugins: 'Geen plugins beschikbaar in de winkel',
    extension: 'Extensie',
    web: 'Web',
    app: 'App',
    type: 'Type',
  },
  pl: {
    store: 'Sklep',
    reload: 'Odśwież',
    loading: 'Ładowanie sklepu...',
    error: 'Błąd ładowania sklepu',
    install: 'Zainstaluj',
    uninstall: 'Odinstaluj',
    update: 'Aktualizuj',
    installed: 'Zainstalowano',
    noStorePlugins: 'Brak dostępnych pluginów w sklepie',
    extension: 'Rozszerzenie',
    web: 'Web',
    app: 'App',
    type: 'Typ',
  },
  tr: {
    store: 'Mağaza',
    reload: 'Yenile',
    loading: 'Mağaza yükleniyor...',
    error: 'Mağaza yükleme hatası',
    install: 'Yükle',
    uninstall: 'Kaldır',
    update: 'Güncelle',
    installed: 'Yüklü',
    noStorePlugins: 'Mağazada eklenti bulunamadı',
    extension: 'Uzantı',
    web: 'Web',
    app: 'App',
    type: 'Tür',
  },
};

export default function StoreView() {
  const { plugins, loadPlugins } = usePluginStore();
  const { language } = useSettingsStore();
  const t = translations[language] || translations.en;
  
  const [storePlugins, setStorePlugins] = useState<StorePlugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installDialog, setInstallDialog] = useState<{ manifest: any; plugin: StorePlugin } | null>(null);
  const [extensionWarningDialog, setExtensionWarningDialog] = useState<{ plugin: StorePlugin; manifest: any } | null>(null);
  const [installingPlugins, setInstallingPlugins] = useState<Set<string>>(new Set());

  const loadStore = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getStorePlugins();
      if (result.success && result.plugins) {
        setStorePlugins(result.plugins);
        // Wenn keine Plugins gefunden wurden, zeige eine Info-Meldung
        if (result.plugins.length === 0) {
          setError(null); // Kein Fehler, nur keine Plugins
        }
      } else {
        const errorMsg = result.error || t.error;
        setError(errorMsg);
        console.error('Store loading error:', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || t.error;
      setError(errorMsg);
      console.error('Store loading exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const getPluginStatus = (storePlugin: StorePlugin) => {
    const installedPlugin = plugins.find(p => p.id === storePlugin.id);
    if (!installedPlugin) return 'install';
    
    // Check if update is needed (simple version comparison or manifest comparison)
    if (installedPlugin.version !== storePlugin.version) {
      return 'update';
    }
    
    return 'uninstall';
  };

  const handleInstall = async (storePlugin: StorePlugin) => {
    try {
      if (storePlugin.type === 'extension') {
        // For extensions, show warning dialog first
        setExtensionWarningDialog({ plugin: storePlugin, manifest: storePlugin });
      } else {
        // For regular plugins, show install dialog with permissions
        setInstallDialog({ manifest: storePlugin, plugin: storePlugin });
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const handleExtensionWarningAccept = async () => {
    if (!extensionWarningDialog) return;
    
    const { plugin } = extensionWarningDialog;
    setExtensionWarningDialog(null);
    
    try {
      if (!plugin.manifestUrl || !plugin.contentUrl) {
        alert('Error: Missing manifest or content URL');
        return;
      }
      
      // Set installing state
      setInstallingPlugins(prev => new Set(prev).add(plugin.id));
      
      const result = await window.electronAPI.installStorePlugin(
        plugin.id,
        plugin.manifestUrl || '',
        plugin.contentUrl || '',
        plugin.type,
        plugin.folderContentsUrl
      );
      
      if (result.success) {
        await loadPlugins();
        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadStore();
      } else {
        alert(`Error installing plugin: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      // Remove installing state
      setInstallingPlugins(prev => {
        const next = new Set(prev);
        next.delete(plugin.id);
        return next;
      });
    }
  };

  const handleExtensionWarningCancel = () => {
    setExtensionWarningDialog(null);
  };

  const handleInstallAccept = async (_grantedPermissions: string[]) => {
    if (!installDialog) return;
    
    const { plugin } = installDialog;
    setInstallDialog(null);
    
    try {
      if (!plugin.manifestUrl) {
        alert('Error: Missing manifest URL');
        return;
      }
      
      // Set installing state
      setInstallingPlugins(prev => new Set(prev).add(plugin.id));
      
      // Note: Store plugins install directly, permissions are handled by the backend
      const result = await window.electronAPI.installStorePlugin(
        plugin.id,
        plugin.manifestUrl || '',
        plugin.contentUrl || '',
        plugin.type,
        plugin.folderContentsUrl
      );
      
      if (result.success) {
        await loadPlugins();
        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadStore();
      } else {
        alert(`Error installing plugin: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      // Remove installing state
      setInstallingPlugins(prev => {
        const next = new Set(prev);
        next.delete(plugin.id);
        return next;
      });
    }
  };

  const handleInstallCancel = () => {
    setInstallDialog(null);
  };

  const handleUpdate = async (storePlugin: StorePlugin) => {
    if (!window.confirm(`Update ${storePlugin.name}?`)) return;
    
    try {
      if (!storePlugin.manifestUrl) {
        alert('Error: Missing manifest URL');
        return;
      }
      
      // Set installing state
      setInstallingPlugins(prev => new Set(prev).add(storePlugin.id));
      
      const result = await window.electronAPI.updateStorePlugin(
        storePlugin.id,
        storePlugin.manifestUrl || '',
        storePlugin.contentUrl || '',
        storePlugin.folderContentsUrl
      );
      
      if (result.success) {
        await loadPlugins();
        // Small delay to show success state
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadStore();
      } else {
        alert(`Error updating plugin: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      // Remove installing state
      setInstallingPlugins(prev => {
        const next = new Set(prev);
        next.delete(storePlugin.id);
        return next;
      });
    }
  };

  const handleUninstall = async (storePlugin: StorePlugin) => {
    if (!window.confirm(`Uninstall ${storePlugin.name}?`)) return;
    
    try {
      const result = await window.electronAPI.deletePlugin(storePlugin.id);
      if (result.success) {
        await loadPlugins();
        await loadStore();
      } else {
        alert(`Error uninstalling plugin: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'extension') return t.extension || 'Extension';
    if (type === 'web') return t.web || 'Web';
    return t.app || 'App';
  };

  return (
    <>
      {extensionWarningDialog && (
        <ExtensionWarningDialog
          plugin={extensionWarningDialog.plugin}
          manifest={extensionWarningDialog.manifest}
          onAccept={handleExtensionWarningAccept}
          onCancel={handleExtensionWarningCancel}
        />
      )}
      {installDialog && (
        <InstallDialog
          manifest={installDialog.manifest}
          onAccept={handleInstallAccept}
          onCancel={handleInstallCancel}
        />
      )}
      <div className="store-view">
        <div className="store-header">
          <h2 className="store-title">{t.store}</h2>
          <button className="store-reload-button" onClick={loadStore} disabled={loading}>
            {t.reload}
          </button>
        </div>

        {loading && (
          <div className="store-loading">
            <p>{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="store-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && (
          <div className="store-grid">
            {storePlugins.length === 0 && !error ? (
              <div className="store-empty">
                <p>{t.noStorePlugins}</p>
              </div>
            ) : storePlugins.length > 0 ? (
              storePlugins.map((plugin) => {
                const status = getPluginStatus(plugin);
                const isInstalling = installingPlugins.has(plugin.id);
                return (
                  <div key={plugin.id} className={`plugin-card ${isInstalling ? 'plugin-card-installing' : ''}`}>
                    <div className="plugin-card-icon">
                      <PluginIcon plugin={plugin as any} />
                    </div>
                    <div className="plugin-card-info">
                      <h3 className="plugin-card-name">{plugin.name}</h3>
                      <p className="plugin-card-type">
                        {t.type}: {getTypeLabel(plugin.type)}
                      </p>
                      {plugin.description && (
                        <p className="plugin-card-description">{plugin.description}</p>
                      )}
                      {plugin.version && (
                        <p className="plugin-card-version">v{plugin.version}</p>
                      )}
                    </div>
                    <div className="plugin-card-actions">
                      {status === 'install' && (
                        <button
                          className="plugin-card-button"
                          onClick={() => handleInstall(plugin)}
                          disabled={isInstalling}
                        >
                          {isInstalling ? t.loading || 'Installing...' : t.install}
                        </button>
                      )}
                      {status === 'update' && (
                        <>
                          <button
                            className="plugin-card-button"
                            onClick={() => handleUpdate(plugin)}
                            disabled={isInstalling}
                          >
                            {isInstalling ? t.loading || 'Updating...' : t.update}
                          </button>
                          <button
                            className="plugin-card-button plugin-card-button-danger"
                            onClick={() => handleUninstall(plugin)}
                            disabled={isInstalling}
                          >
                            {t.uninstall}
                          </button>
                        </>
                      )}
                      {status === 'uninstall' && (
                        <button
                          className="plugin-card-button plugin-card-button-danger"
                          onClick={() => handleUninstall(plugin)}
                          disabled={isInstalling}
                        >
                          {t.uninstall}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
