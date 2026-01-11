import { useAppStore } from '../store/useAppStore';
import { usePluginStore } from '../store/usePluginStore';
import SettingsView from './SettingsView';
import PluginsView from './PluginsView';
import WelcomeView from './WelcomeView';

export default function MainArea() {
  const { currentView } = useAppStore();
  const { activePlugin } = usePluginStore();

  if (currentView === 'settings') {
    return <SettingsView />;
  }

  if (currentView === 'plugins') {
    return <PluginsView />;
  }

  // Wenn kein Plugin aktiv ist, zeige Welcome Screen
  if (!activePlugin) {
    return <WelcomeView />;
  }

  return <div className="main-area" />;
}
