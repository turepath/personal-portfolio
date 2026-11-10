
import { useState, useEffect, useCallback } from 'react';

export type RoomChoice = 
  | 'duo_avatar' 
  | 'group_avatar' 
  | 'random';

export interface QuickPreferences {
  roomChoice: RoomChoice;
  effectsEnabled: boolean;
  saveAsDefault: boolean;
}

const STORAGE_KEY = 'quickPreferences';

const DEFAULT_PREFS: QuickPreferences = {
  roomChoice: 'duo_avatar',
  effectsEnabled: true,
  saveAsDefault: false,
};

export const usePreferences = () => {
  const [preferences, setPreferencesState] = useState<QuickPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: ensure old choices map to valid new choices
        if (parsed.roomChoice === 'duo_real' || parsed.roomChoice === 'random_1to1' || parsed.roomChoice === 'random_1tomany') {
          parsed.roomChoice = 'random';
        }
        return parsed;
      } catch (e) {
        return DEFAULT_PREFS;
      }
    }
    return DEFAULT_PREFS;
  });

  const savePreferences = useCallback(async (newPrefs: QuickPreferences) => {
    setPreferencesState(newPrefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));

    if (newPrefs.saveAsDefault) {
      try {
        // Mock API call
        console.log('Preferences saved to cloud (mock)');
      } catch (err) {
        console.warn('Could not save remotely — saved locally.');
      }
    }
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    preferences,
    savePreferences,
    resetPreferences,
  };
};
