import { create } from 'zustand';
import type { Plugin } from '@/types/electron';

interface PluginState {
  plugins: Plugin[];
  activePlugin: string | null;
  setPlugins: (plugins: Plugin[]) => void;
  addPlugin: (plugin: Plugin) => void;
  removePlugin: (pluginId: string) => void;
  updatePlugin: (pluginId: string, updates: Partial<Plugin>) => void;
  setActivePlugin: (pluginId: string | null) => void;
  loadPlugins: () => Promise<void>;
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: [],
  activePlugin: null,
  setPlugins: (plugins) => set({ plugins }),
  addPlugin: (plugin) => set((state) => ({ plugins: [...state.plugins, plugin] })),
  removePlugin: (pluginId) => set((state) => ({
    plugins: state.plugins.filter(p => p.id !== pluginId),
    activePlugin: state.activePlugin === pluginId ? null : state.activePlugin,
  })),
  updatePlugin: (pluginId, updates) => set((state) => ({
    plugins: state.plugins.map(p => p.id === pluginId ? { ...p, ...updates } : p),
  })),
  setActivePlugin: async (pluginId) => {
    set({ activePlugin: pluginId });
    await window.electronAPI.showPlugin(pluginId);
  },
  loadPlugins: async () => {
    const plugins = await window.electronAPI.getPlugins();
    set({ plugins });
  },
}));
