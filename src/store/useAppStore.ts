import { create } from 'zustand';

type View = 'plugin' | 'settings' | 'plugins';

interface AppState {
  currentView: View;
  setView: (view: View) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'plugin',
  setView: (view) => set({ currentView: view }),
}));
