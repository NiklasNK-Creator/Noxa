import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { usePluginStore } from '../store/usePluginStore';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Settings',
    theme: 'Theme',
    language: 'Language',
    discord: 'Join Discord',
    dark: 'Dark',
    light: 'Light',
    blue: 'Blue',
    purple: 'Purple',
    green: 'Green',
    red: 'Red',
    orange: 'Orange',
    galaxy: 'Galaxy',
  },
  es: {
    title: 'Configuración',
    theme: 'Tema',
    language: 'Idioma',
    discord: 'Unirse a Discord',
    dark: 'Oscuro',
    light: 'Claro',
    blue: 'Azul',
    purple: 'Morado',
    green: 'Verde',
    red: 'Rojo',
    orange: 'Naranja',
    galaxy: 'Galaxia',
  },
  fr: {
    title: 'Paramètres',
    theme: 'Thème',
    language: 'Langue',
    discord: 'Rejoindre Discord',
    dark: 'Sombre',
    light: 'Clair',
    blue: 'Bleu',
    purple: 'Violet',
    green: 'Vert',
    red: 'Rouge',
    orange: 'Orange',
    galaxy: 'Galaxie',
  },
  de: {
    title: 'Einstellungen',
    theme: 'Design',
    language: 'Sprache',
    discord: 'Discord beitreten',
    dark: 'Dunkel',
    light: 'Hell',
    blue: 'Blau',
    purple: 'Lila',
    green: 'Grün',
    red: 'Rot',
    orange: 'Orange',
    galaxy: 'Galaxie',
  },
  ja: {
    title: '設定',
    theme: 'テーマ',
    language: '言語',
    discord: 'Discordに参加',
    dark: 'ダーク',
    light: 'ライト',
    blue: 'ブルー',
    purple: 'パープル',
    green: 'グリーン',
    red: 'レッド',
    orange: 'オレンジ',
    galaxy: 'ギャラクシー',
  },
  zh: {
    title: '设置',
    theme: '主题',
    language: '语言',
    discord: '加入 Discord',
    dark: '暗色',
    light: '亮色',
    blue: '蓝色',
    purple: '紫色',
    green: '绿色',
    red: '红色',
    orange: '橙色',
    galaxy: '银河',
  },
  ru: {
    title: 'Настройки',
    theme: 'Тема',
    language: 'Язык',
    discord: 'Присоединиться к Discord',
    dark: 'Тёмная',
    light: 'Светлая',
    blue: 'Синяя',
    purple: 'Фиолетовая',
    green: 'Зелёная',
    red: 'Красная',
    orange: 'Оранжевая',
    galaxy: 'Галактика',
  },
  pt: {
    title: 'Configurações',
    theme: 'Tema',
    language: 'Idioma',
    discord: 'Entrar no Discord',
    dark: 'Escuro',
    light: 'Claro',
    blue: 'Azul',
    purple: 'Roxo',
    green: 'Verde',
    red: 'Vermelho',
    orange: 'Laranja',
    galaxy: 'Galáxia',
  },
  it: {
    title: 'Impostazioni',
    theme: 'Tema',
    language: 'Lingua',
    discord: 'Unisciti a Discord',
    dark: 'Scuro',
    light: 'Chiaro',
    blue: 'Blu',
    purple: 'Viola',
    green: 'Verde',
    red: 'Rosso',
    orange: 'Arancione',
    galaxy: 'Galassia',
  },
  nl: {
    title: 'Instellingen',
    theme: 'Thema',
    language: 'Taal',
    discord: 'Discord joinen',
    dark: 'Donker',
    light: 'Licht',
    blue: 'Blauw',
    purple: 'Paars',
    green: 'Groen',
    red: 'Rood',
    orange: 'Oranje',
    galaxy: 'Melkweg',
  },
  pl: {
    title: 'Ustawienia',
    theme: 'Motyw',
    language: 'Język',
    discord: 'Dołącz do Discord',
    dark: 'Ciemny',
    light: 'Jasny',
    blue: 'Niebieski',
    purple: 'Fioletowy',
    green: 'Zielony',
    red: 'Czerwony',
    orange: 'Pomarańczowy',
    galaxy: 'Galaktyka',
  },
  tr: {
    title: 'Ayarlar',
    theme: 'Tema',
    language: 'Dil',
    discord: 'Discord\'a Katıl',
    dark: 'Koyu',
    light: 'Açık',
    blue: 'Mavi',
    purple: 'Mor',
    green: 'Yeşil',
    red: 'Kırmızı',
    orange: 'Turuncu',
    galaxy: 'Galaksi',
  },
};

export default function SettingsView() {
  const { theme, language, setTheme, setLanguage } = useSettingsStore();
  const { plugins } = usePluginStore();
  const t = translations[language] || translations.en;
  
  // Prüfe ob Theme Extensions aktiv sind
  const galaxyThemeActive = plugins.some(p => p.id === 'galaxy-theme' && p.enabled !== false && p.type === 'extension');
  const multiThemePackActive = plugins.some(p => p.id === 'multi-theme-pack' && p.enabled !== false && p.type === 'extension');
  
  // Multi-Theme Pack Themes
  const multiThemes = ['solarized-dark', 'nord', 'dracula', 'cyberpunk', 'forest', 'ocean', 'sunset'];
  
  // Wenn Theme Extension nicht aktiv ist, aber ein Theme ausgewählt ist, das von Extension kommt, wechsle zu Dark
  useEffect(() => {
    if (!galaxyThemeActive && theme === 'galaxy') {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (!multiThemePackActive && multiThemes.includes(theme)) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [galaxyThemeActive, multiThemePackActive, theme, setTheme]);

  const handleDiscordClick = () => {
    window.electronAPI.openDiscord();
  };

  return (
    <div className="settings-view">
      <div className="settings-container">
        <h1 className="settings-title">{t.title}</h1>

        <div className="settings-section">
          <label className="settings-label">{t.theme}</label>
          <select
            className="settings-select"
            value={
              (galaxyThemeActive || multiThemePackActive) 
                ? theme 
                : (theme === 'galaxy' || multiThemes.includes(theme) ? 'dark' : theme)
            }
            onChange={(e) => setTheme(e.target.value as any)}
          >
            <option value="dark">{t.dark}</option>
            <option value="light">{t.light}</option>
            <option value="blue">{t.blue}</option>
            <option value="purple">{t.purple}</option>
            <option value="green">{t.green}</option>
            <option value="red">{t.red}</option>
            <option value="orange">{t.orange}</option>
            {galaxyThemeActive && (
              <option value="galaxy">{t.galaxy || 'Galaxy'}</option>
            )}
            {multiThemePackActive && (
              <>
                <option value="solarized-dark">Solarized Dark</option>
                <option value="nord">Nord</option>
                <option value="dracula">Dracula</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="forest">Forest</option>
                <option value="ocean">Ocean</option>
                <option value="sunset">Sunset</option>
              </>
            )}
          </select>
        </div>

        <div className="settings-section">
          <label className="settings-label">{t.language}</label>
          <select
            className="settings-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
            <option value="pt">Português</option>
            <option value="it">Italiano</option>
            <option value="nl">Nederlands</option>
            <option value="pl">Polski</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>

        <div className="settings-section">
          <button className="settings-button" onClick={handleDiscordClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            {t.discord}
          </button>
        </div>
      </div>
    </div>
  );
}
