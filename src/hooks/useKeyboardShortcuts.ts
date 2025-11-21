/**
 * Keyboard Shortcuts Hook
 * Provides keyboard navigation throughout the app
 */

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export interface KeyboardShortcut {
  key: string;
  description: string;
  handler: () => void;
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const { keyboardShortcuts } = useSettingsStore();

  useEffect(() => {
    if (!keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const modifiersMatch =
          (!shortcut.modifiers?.ctrl || event.ctrlKey || event.metaKey) &&
          (!shortcut.modifiers?.shift || event.shiftKey) &&
          (!shortcut.modifiers?.alt || event.altKey);

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          modifiersMatch
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, keyboardShortcuts]);
}

/**
 * Global shortcuts available throughout the app
 */
export function useGlobalShortcuts(handlers: {
  onHelp?: () => void;
  onSettings?: () => void;
  onHome?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      handler: () => handlers.onHelp?.(),
    },
    {
      key: ',',
      description: 'Open settings',
      handler: () => handlers.onSettings?.(),
    },
    {
      key: 'h',
      description: 'Go to home',
      handler: () => handlers.onHome?.(),
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

/**
 * Study session shortcuts
 */
export function useStudyShortcuts(handlers: {
  onSubmit?: () => void;
  onNext?: () => void;
  onRating?: (quality: number) => void;
  onHint?: () => void;
  onQuit?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      description: 'Submit answer / Continue',
      handler: () => {
        handlers.onSubmit?.();
        handlers.onNext?.();
      },
    },
    {
      key: 'Enter',
      description: 'Submit answer / Continue',
      handler: () => {
        handlers.onSubmit?.();
        handlers.onNext?.();
      },
    },
    {
      key: '1',
      description: 'Rate: Again',
      handler: () => handlers.onRating?.(0),
    },
    {
      key: '2',
      description: 'Rate: Hard',
      handler: () => handlers.onRating?.(3),
    },
    {
      key: '3',
      description: 'Rate: Good',
      handler: () => handlers.onRating?.(4),
    },
    {
      key: '4',
      description: 'Rate: Easy',
      handler: () => handlers.onRating?.(5),
    },
    {
      key: 'h',
      description: 'Show hint',
      handler: () => handlers.onHint?.(),
    },
    {
      key: 'Escape',
      description: 'Quit session',
      handler: () => handlers.onQuit?.(),
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

/**
 * Navigation shortcuts
 */
export function useNavigationShortcuts(handlers: {
  onPrevious?: () => void;
  onNext?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ArrowLeft',
      description: 'Previous',
      handler: () => handlers.onPrevious?.(),
    },
    {
      key: 'ArrowRight',
      description: 'Next',
      handler: () => handlers.onNext?.(),
    },
    {
      key: 'Home',
      description: 'First item',
      handler: () => handlers.onFirst?.(),
    },
    {
      key: 'End',
      description: 'Last item',
      handler: () => handlers.onLast?.(),
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
