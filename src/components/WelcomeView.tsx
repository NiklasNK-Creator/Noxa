import { useSettingsStore } from '../store/useSettingsStore';
import { usePluginStore } from '../store/usePluginStore';
import iconPath from '../../assets/icon.ico';

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome to Noxa',
    description: 'Select a plugin from the sidebar to get started',
    noPlugins: 'No plugins installed',
    installPlugin: 'Install your first plugin',
    pluginsCount: 'Plugins installed',
  },
  de: {
    welcome: 'Willkommen bei Noxa',
    description: 'Wähle ein Plugin aus der Seitenleiste aus, um zu beginnen',
    noPlugins: 'Keine Plugins installiert',
    installPlugin: 'Installiere dein erstes Plugin',
    pluginsCount: 'Plugins installiert',
  },
  es: {
    welcome: 'Bienvenido a Noxa',
    description: 'Selecciona un plugin de la barra lateral para comenzar',
    noPlugins: 'No hay complementos instalados',
    installPlugin: 'Instala tu primer complemento',
    pluginsCount: 'Complementos instalados',
  },
  fr: {
    welcome: 'Bienvenue sur Noxa',
    description: 'Sélectionnez un plugin dans la barre latérale pour commencer',
    noPlugins: 'Aucun plugin installé',
    installPlugin: 'Installez votre premier plugin',
    pluginsCount: 'Plugins installés',
  },
  ja: {
    welcome: 'Noxaへようこそ',
    description: 'サイドバーからプラグインを選択して開始してください',
    noPlugins: 'インストールされたプラグインがありません',
    installPlugin: '最初のプラグインをインストール',
    pluginsCount: 'インストールされたプラグイン',
  },
  zh: {
    welcome: '欢迎使用 Noxa',
    description: '从侧边栏选择一个插件开始',
    noPlugins: '未安装插件',
    installPlugin: '安装你的第一个插件',
    pluginsCount: '已安装插件',
  },
  ru: {
    welcome: 'Добро пожаловать в Noxa',
    description: 'Выберите плагин из боковой панели, чтобы начать',
    noPlugins: 'Нет установленных плагинов',
    installPlugin: 'Установите ваш первый плагин',
    pluginsCount: 'Установлено плагинов',
  },
  pt: {
    welcome: 'Bem-vindo ao Noxa',
    description: 'Selecione um plugin na barra lateral para começar',
    noPlugins: 'Nenhum plugin instalado',
    installPlugin: 'Instale seu primeiro plugin',
    pluginsCount: 'Plugins instalados',
  },
  it: {
    welcome: 'Benvenuto in Noxa',
    description: 'Seleziona un plugin dalla barra laterale per iniziare',
    noPlugins: 'Nessun plugin installato',
    installPlugin: 'Installa il tuo primo plugin',
    pluginsCount: 'Plugin installati',
  },
  nl: {
    welcome: 'Welkom bij Noxa',
    description: 'Selecteer een plugin uit de zijbalk om te beginnen',
    noPlugins: 'Geen plugins geïnstalleerd',
    installPlugin: 'Installeer je eerste plugin',
    pluginsCount: 'Plugins geïnstalleerd',
  },
  pl: {
    welcome: 'Witamy w Noxa',
    description: 'Wybierz plugin z paska bocznego, aby zacząć',
    noPlugins: 'Brak zainstalowanych pluginów',
    installPlugin: 'Zainstaluj swój pierwszy plugin',
    pluginsCount: 'Zainstalowane pluginy',
  },
  tr: {
    welcome: "Noxa'ya Hoş Geldiniz",
    description: 'Başlamak için kenar çubuğundan bir eklenti seçin',
    noPlugins: 'Yüklü eklenti yok',
    installPlugin: 'İlk eklentinizi yükleyin',
    pluginsCount: 'Yüklü eklentiler',
  },
};

export default function WelcomeView() {
  const { language } = useSettingsStore();
  const { plugins } = usePluginStore();
  const t = translations[language] || translations.en;

  const enabledPlugins = plugins.filter(p => p.enabled !== false);

  return (
    <div className="welcome-view">
      <div className="welcome-content">
        <div className="welcome-icon">
          <img src={iconPath} alt="Noxa" width={80} height={80} />
        </div>
        
        <h1 className="welcome-title">{t.welcome}</h1>
        <p className="welcome-description">{t.description}</p>

        {enabledPlugins.length > 0 ? (
          <div className="welcome-stats">
            <span>{t.pluginsCount}: {enabledPlugins.length}</span>
          </div>
        ) : (
          <div className="welcome-empty">
            <p>{t.noPlugins}</p>
            <p className="welcome-hint">{t.installPlugin}</p>
          </div>
        )}
      </div>
    </div>
  );
}
