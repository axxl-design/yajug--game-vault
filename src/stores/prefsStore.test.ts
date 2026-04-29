import { beforeEach, describe, expect, test } from 'vitest';
import { usePrefsStore } from './prefsStore';

beforeEach(() => {
  usePrefsStore.setState({
    theme: 'dark',
    lastNickname: '',
    hasSeenOnboarding: false,
    soundEnabled: true,
  });
});

describe('prefsStore', () => {
  test('defaults', () => {
    const s = usePrefsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.lastNickname).toBe('');
    expect(s.hasSeenOnboarding).toBe(false);
    expect(s.soundEnabled).toBe(true);
  });

  test('setTheme y toggleTheme', () => {
    usePrefsStore.getState().setTheme('light');
    expect(usePrefsStore.getState().theme).toBe('light');
    usePrefsStore.getState().toggleTheme();
    expect(usePrefsStore.getState().theme).toBe('dark');
    usePrefsStore.getState().toggleTheme();
    expect(usePrefsStore.getState().theme).toBe('light');
  });

  test('setLastNickname', () => {
    usePrefsStore.getState().setLastNickname('Alice');
    expect(usePrefsStore.getState().lastNickname).toBe('Alice');
  });

  test('setHasSeenOnboarding', () => {
    usePrefsStore.getState().setHasSeenOnboarding(true);
    expect(usePrefsStore.getState().hasSeenOnboarding).toBe(true);
  });

  test('setSoundEnabled y toggleSound', () => {
    usePrefsStore.getState().setSoundEnabled(false);
    expect(usePrefsStore.getState().soundEnabled).toBe(false);
    usePrefsStore.getState().toggleSound();
    expect(usePrefsStore.getState().soundEnabled).toBe(true);
  });
});
