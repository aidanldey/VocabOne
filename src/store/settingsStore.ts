/**
 * Settings Store
 * Manages application settings with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Learning settings
  dailyGoal: number;
  autoAdvanceCards: boolean;

  // UI settings
  theme: 'light' | 'dark' | 'system';
  soundEffects: boolean;

  // Keyboard shortcuts enabled
  keyboardShortcuts: boolean;

  // Actions
  setDailyGoal: (goal: number) => void;
  setAutoAdvanceCards: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSoundEffects: (enabled: boolean) => void;
  setKeyboardShortcuts: (enabled: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  dailyGoal: 20,
  autoAdvanceCards: false,
  theme: 'system' as const,
  soundEffects: true,
  keyboardShortcuts: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      ...DEFAULT_SETTINGS,

      // Actions
      setDailyGoal: (goal: number) => {
        if (goal < 1 || goal > 500) {
          console.warn('Daily goal must be between 1 and 500');
          return;
        }
        set({ dailyGoal: goal });
      },

      setAutoAdvanceCards: (enabled: boolean) => {
        set({ autoAdvanceCards: enabled });
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        applyTheme(theme);
      },

      setSoundEffects: (enabled: boolean) => {
        set({ soundEffects: enabled });
      },

      setKeyboardShortcuts: (enabled: boolean) => {
        set({ keyboardShortcuts: enabled });
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
      },
    }),
    {
      name: 'vocabone-settings',
      version: 1,
    }
  )
);

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme() {
  const settings = useSettingsStore.getState();
  applyTheme(settings.theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const settings = useSettingsStore.getState();
    if (settings.theme === 'system') {
      applyTheme('system');
    }
  });
}

/**
 * Play sound effect if enabled
 */
export function playSound(soundType: 'correct' | 'incorrect' | 'complete' | 'click') {
  const { soundEffects } = useSettingsStore.getState();

  if (!soundEffects) return;

  // Create audio context for sound effects
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configure sound based on type
  switch (soundType) {
    case 'correct':
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;

    case 'incorrect':
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;

    case 'complete':
      // Play ascending notes
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.15);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.15);
      });
      break;

    case 'click':
      oscillator.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
  }
}
