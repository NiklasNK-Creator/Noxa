import { useEffect } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import { usePluginStore } from './store/usePluginStore';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';
import MainArea from './components/MainArea';
import './styles/global.css';
import './styles/components.css';

function App() {
  const { theme, language } = useSettingsStore();
  const { loadPlugins, setPlugins } = usePluginStore();
  const { setView } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-language', language);
  }, [theme, language]);

  useEffect(() => {
    const loadInitialPlugins = async () => {
      await loadPlugins();
      window.electronAPI.onPluginsLoaded((plugins) => {
        setPlugins(plugins);
      });
    };

    loadInitialPlugins();
  }, [loadPlugins, setPlugins]);

  useEffect(() => {
    setView('plugin');
  }, [setView]);

  return (
    <div className="app">
      <TitleBar />
      <div className="app-content">
        <Sidebar />
        <MainArea />
      </div>
    </div>
  );
}

export default App;
