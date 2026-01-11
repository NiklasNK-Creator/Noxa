import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'galaxy' | 'solarized-dark' | 'nord' | 'dracula' | 'cyberpunk' | 'forest' | 'ocean' | 'sunset' | string;
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ru' | 'pt' | 'it' | 'nl' | 'pl' | 'tr';

interface SettingsState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      language: 'en',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      setLanguage: (language) => {
        set({ language });
        document.documentElement.setAttribute('data-language', language);
      },
    }),
    {
      name: 'noxa-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
          document.documentElement.setAttribute('data-language', state.language);
        }
      },
    }
  )
);
