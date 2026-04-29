import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface PrefsState {
  theme: Theme;
  lastNickname: string;
  hasSeenOnboarding: boolean;
  soundEnabled: boolean;

  // Pendientes de fases siguientes — descomentar al implementar:
  // density: 'compact' | 'regular' | 'comfy';

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLastNickname: (nickname: string) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  toggleSound: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lastNickname: '',
      hasSeenOnboarding: false,
      soundEnabled: true,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLastNickname: (lastNickname) => set({ lastNickname }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'yajuga-prefs',
      version: 1,
    },
  ),
);
