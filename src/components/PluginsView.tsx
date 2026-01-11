import { useState, useRef } from 'react';
import { usePluginStore } from '../store/usePluginStore';
import { useSettingsStore } from '../store/useSettingsStore';
import PluginIcon from './PluginIcon';
import InstallDialog from './InstallDialog';
import StoreView from './StoreView';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Plugins',
    install: 'Install Plugin',
    delete: 'Delete',
    enable: 'Enable',
    disable: 'Disable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    type: 'Type',
    web: 'Web',
    app: 'App',
    extension: 'Extension',
    installed: 'Installed',
    store: 'Store',
    noPlugins: 'No plugins installed',
    deleteConfirm: 'Are you sure you want to delete this plugin?',
    discordPrompt: 'Need more plugins? Click here to join our Discord',
  },
  de: {
    title: 'Plugins',
    install: 'Plugin installieren',
    delete: 'Löschen',
    enable: 'Aktivieren',
    disable: 'Deaktivieren',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
    type: 'Typ',
    web: 'Web',
    app: 'App',
    extension: 'Extension',
    installed: 'Installiert',
    store: 'Store',
    noPlugins: 'Keine Plugins installiert',
    deleteConfirm: 'Möchten Sie dieses Plugin wirklich löschen?',
    discordPrompt: 'Brauchst du mehr Plugins? Klicke hier, um unserem Discord beizutreten',
  },
  es: {
    title: 'Complementos',
    install: 'Instalar Complemento',
    delete: 'Eliminar',
    enable: 'Habilitar',
    disable: 'Deshabilitar',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    type: 'Tipo',
    web: 'Web',
    app: 'App',
    extension: 'Extensión',
    installed: 'Instalado',
    store: 'Tienda',
    noPlugins: 'No hay complementos instalados',
    deleteConfirm: '¿Está seguro de que desea eliminar este complemento?',
    discordPrompt: '¿Necesitas más complementos? Haz clic aquí para unirte a nuestro Discord',
  },
  fr: {
    title: 'Plugins',
    install: 'Installer un Plugin',
    delete: 'Supprimer',
    enable: 'Activer',
    disable: 'Désactiver',
    enabled: 'Activé',
    disabled: 'Désactivé',
    type: 'Type',
    web: 'Web',
    app: 'App',
    extension: 'Extension',
    installed: 'Installé',
    store: 'Boutique',
    noPlugins: 'Aucun plugin installé',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce plugin?',
    discordPrompt: 'Besoin de plus de plugins? Cliquez ici pour rejoindre notre Discord',
  },
  ja: {
    title: 'プラグイン',
    install: 'プラグインをインストール',
    delete: '削除',
    enable: '有効化',
    disable: '無効化',
    enabled: '有効',
    disabled: '無効',
    type: 'タイプ',
    web: 'Web',
    app: 'App',
    extension: '拡張機能',
    installed: 'インストール済み',
    store: 'ストア',
    noPlugins: 'インストールされたプラグインがありません',
    deleteConfirm: 'このプラグインを削除してもよろしいですか？',
    discordPrompt: 'もっとプラグインが必要？ここをクリックしてDiscordに参加',
  },
  zh: {
    title: '插件',
    install: '安装插件',
    delete: '删除',
    enable: '启用',
    disable: '禁用',
    enabled: '已启用',
    disabled: '已禁用',
    type: '类型',
    web: 'Web',
    app: 'App',
    extension: '扩展',
    installed: '已安装',
    store: '商店',
    noPlugins: '未安装插件',
    deleteConfirm: '您确定要删除此插件吗？',
    discordPrompt: '需要更多插件？点击这里加入我们的Discord',
  },
  ru: {
    title: 'Плагины',
    install: 'Установить плагин',
    delete: 'Удалить',
    enable: 'Включить',
    disable: 'Отключить',
    enabled: 'Включен',
    disabled: 'Отключен',
    type: 'Тип',
    web: 'Web',
    app: 'App',
    extension: 'Расширение',
    installed: 'Установлено',
    store: 'Магазин',
    noPlugins: 'Нет установленных плагинов',
    deleteConfirm: 'Вы уверены, что хотите удалить этот плагин?',
    discordPrompt: 'Нужно больше плагинов? Нажмите здесь, чтобы присоединиться к нашему Discord',
  },
  pt: {
    title: 'Plugins',
    install: 'Instalar Plugin',
    delete: 'Excluir',
    enable: 'Ativar',
    disable: 'Desativar',
    enabled: 'Ativado',
    disabled: 'Desativado',
    type: 'Tipo',
    web: 'Web',
    app: 'App',
    extension: 'Extensão',
    installed: 'Instalado',
    store: 'Loja',
    noPlugins: 'Nenhum plugin instalado',
    deleteConfirm: 'Tem certeza de que deseja excluir este plugin?',
    discordPrompt: 'Precisa de mais plugins? Clique aqui para entrar no nosso Discord',
  },
  it: {
    title: 'Plugin',
    install: 'Installa Plugin',
    delete: 'Elimina',
    enable: 'Abilita',
    disable: 'Disabilita',
    enabled: 'Abilitato',
    disabled: 'Disabilitato',
    type: 'Tipo',
    web: 'Web',
    app: 'App',
    extension: 'Estensione',
    installed: 'Installato',
    store: 'Negozio',
    noPlugins: 'Nessun plugin installato',
    deleteConfirm: 'Sei sicuro di voler eliminare questo plugin?',
    discordPrompt: 'Hai bisogno di più plugin? Clicca qui per unirti al nostro Discord',
  },
  nl: {
    title: 'Plugins',
    install: 'Plugin Installeren',
    delete: 'Verwijderen',
    enable: 'Inschakelen',
    disable: 'Uitschakelen',
    enabled: 'Ingeschakeld',
    disabled: 'Uitgeschakeld',
    type: 'Type',
    web: 'Web',
    app: 'App',
    extension: 'Extensie',
    installed: 'Geïnstalleerd',
    store: 'Winkel',
    noPlugins: 'Geen plugins geïnstalleerd',
    deleteConfirm: 'Weet je zeker dat je deze plugin wilt verwijderen?',
    discordPrompt: 'Meer plugins nodig? Klik hier om lid te worden van onze Discord',
  },
  pl: {
    title: 'Pluginy',
    install: 'Zainstaluj Plugin',
    delete: 'Usuń',
    enable: 'Włącz',
    disable: 'Wyłącz',
    enabled: 'Włączony',
    disabled: 'Wyłączony',
    type: 'Typ',
    web: 'Web',
    app: 'App',
    extension: 'Rozszerzenie',
    installed: 'Zainstalowano',
    store: 'Sklep',
    noPlugins: 'Brak zainstalowanych pluginów',
    deleteConfirm: 'Czy na pewno chcesz usunąć ten plugin?',
    discordPrompt: 'Potrzebujesz więcej pluginów? Kliknij tutaj, aby dołączyć do naszego Discorda',
  },
  tr: {
    title: 'Eklentiler',
    install: 'Eklenti Yükle',
    delete: 'Sil',
    enable: 'Etkinleştir',
    disable: 'Devre Dışı Bırak',
    enabled: 'Etkin',
    disabled: 'Devre Dışı',
    type: 'Tür',
    web: 'Web',
    app: 'App',
    extension: 'Uzantı',
    installed: 'Yüklü',
    store: 'Mağaza',
    noPlugins: 'Yüklü eklenti yok',
    deleteConfirm: 'Bu eklentiyi silmek istediğinizden emin misiniz?',
    discordPrompt: 'Daha fazla eklentiye mi ihtiyacınız var? Discord\'umuza katılmak için buraya tıklayın',
  },
};

export default function PluginsView() {
  const { plugins, loadPlugins, removePlugin, updatePlugin, setPlugins } = usePluginStore();
  const { language } = useSettingsStore();
  const t = translations[language] || translations.en;
  const [installDialog, setInstallDialog] = useState<{ manifest: any; filePath: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
  const [draggedPlugin, setDraggedPlugin] = useState<string | null>(null);
  const [dragOverPlugin, setDragOverPlugin] = useState<string | null>(null);
  const dragRef = useRef<{ pluginId: string; startIndex: number } | null>(null);

  // Sort plugins by order if available (Extensions werden auch angezeigt, aber nicht in Sidebar)
  const sortedPlugins = [...plugins].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  const handleInstallClick = async () => {
    const filePath = await window.electronAPI.openFileDialog();
    if (!filePath) return;

    const result = await window.electronAPI.readPluginManifest(filePath);

    if (result.success && result.manifest) {
      setInstallDialog({ manifest: result.manifest, filePath });
    } else {
      alert(`Error reading plugin: ${result.error || 'Invalid plugin package'}`);
    }
  };

  const handleInstallAccept = async (grantedPermissions: string[]) => {
    if (!installDialog) return;

    const result = await window.electronAPI.confirmInstallPlugin(
      installDialog.filePath,
      grantedPermissions
    );

    setInstallDialog(null);

    if (result.success) {
      await loadPlugins();
    } else {
      alert(`Error installing plugin: ${result.error}`);
    }
  };

  const handleInstallCancel = () => {
    setInstallDialog(null);
  };

  const handleDelete = async (pluginId: string) => {
    if (window.confirm(t.deleteConfirm)) {
      const result = await window.electronAPI.deletePlugin(pluginId);
      if (result.success) {
        removePlugin(pluginId);
      } else {
        alert(`Error deleting plugin: ${result.error}`);
      }
    }
  };

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    const result = await window.electronAPI.togglePlugin(pluginId, enabled);
    if (result.success) {
      updatePlugin(pluginId, { enabled });
      await loadPlugins();
    } else {
      alert(`Error toggling plugin: ${result.error}`);
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'extension') return t.extension;
    if (type === 'web') return t.web;
    return t.app;
  };

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
    const newPlugins = [...sortedPlugins];
    const [removed] = newPlugins.splice(sourceIndex, 1);
    newPlugins.splice(targetIndex, 0, removed);

    // Update order property
    const updatedPlugins = newPlugins.map((plugin, index) => ({
      ...plugin,
      order: index,
    }));

    // Update local state
    setPlugins(updatedPlugins);

    // Save to backend
    try {
      const pluginOrders = updatedPlugins.map((p, idx) => ({ id: p.id, order: idx }));
      const result = await window.electronAPI.updatePluginOrder(pluginOrders);
      if (!result.success) {
        alert(`Error updating plugin order: ${result.error}`);
        await loadPlugins(); // Revert on error
      }
    } catch (err) {
      alert(`Error: ${err}`);
      await loadPlugins(); // Revert on error
    }
  };

  const handleDragEnd = () => {
    setDraggedPlugin(null);
    setDragOverPlugin(null);
    dragRef.current = null;
  };

  return (
    <>
      {installDialog && (
        <InstallDialog
          manifest={installDialog.manifest}
          onAccept={handleInstallAccept}
          onCancel={handleInstallCancel}
        />
      )}
      <div className="plugins-view">
        <div className="plugins-container">
          <div className="plugins-header">
            <h1 className="plugins-title">{t.title}</h1>
            {activeTab === 'installed' && (
              <button className="plugins-install-button" onClick={handleInstallClick}>
                {t.install}
              </button>
            )}
          </div>

          <div className="plugins-tabs">
            <button
              className={`plugins-tab ${activeTab === 'installed' ? 'active' : ''}`}
              onClick={() => setActiveTab('installed')}
            >
              {t.installed}
            </button>
            <button
              className={`plugins-tab ${activeTab === 'store' ? 'active' : ''}`}
              onClick={() => setActiveTab('store')}
            >
              {t.store}
            </button>
          </div>

          {activeTab === 'installed' ? (
            <div className="plugins-grid">
              {sortedPlugins.length === 0 ? (
                <div className="plugins-empty">
                  <p>{t.noPlugins}</p>
                </div>
              ) : (
                sortedPlugins.map((plugin, index) => (
                  <div
                    key={plugin.id}
                    className={`plugin-card ${draggedPlugin === plugin.id ? 'dragging' : ''} ${dragOverPlugin === plugin.id ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, plugin.id, index)}
                    onDragOver={(e) => handleDragOver(e, plugin.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, plugin.id, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="plugin-card-icon">
                      <PluginIcon plugin={plugin} />
                    </div>
                    <div className="plugin-card-info">
                      <h3 className="plugin-card-name">{plugin.name}</h3>
                      <p className="plugin-card-type">
                        {t.type}: {getTypeLabel(plugin.type)}
                      </p>
                      <p className="plugin-card-status">
                        {plugin.enabled !== false ? t.enabled : t.disabled}
                      </p>
                    </div>
                    <div className="plugin-card-actions">
                      <button
                        className="plugin-card-button"
                        onClick={() => handleToggle(plugin.id, plugin.enabled === false)}
                      >
                        {plugin.enabled === false ? t.enable : t.disable}
                      </button>
                      <button
                        className="plugin-card-button plugin-card-button-danger"
                        onClick={() => handleDelete(plugin.id)}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <StoreView />
          )}

          {activeTab === 'installed' && (
            <div className="plugins-discord-section">
              <button className="plugins-discord-button" onClick={() => window.electronAPI.openDiscord()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {t.discordPrompt}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
