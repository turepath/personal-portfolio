
import { useState, useCallback } from 'react';

export interface MediaPreferences {
  camera: boolean;
  mic: boolean;
}

export interface PermissionSaveOptions extends MediaPreferences {
  rememberRoom?: boolean;
  rememberGlobal?: boolean;
  initialTasks?: string[];
}

const GLOBAL_KEY = 'entryPerm:global';
const ROOM_PREFIX = 'entryPerm:room:';

export const useEntryPermissions = () => {
  const getGlobal = (): MediaPreferences | null => {
    const saved = localStorage.getItem(GLOBAL_KEY);
    return saved ? JSON.parse(saved) : null;
  };

  const getForRoom = (roomId: string): MediaPreferences | null => {
    const global = getGlobal();
    if (global) return global;
    
    const saved = localStorage.getItem(`${ROOM_PREFIX}${roomId}`);
    return saved ? JSON.parse(saved) : null;
  };

  const savePermissions = (roomId: string, opts: PermissionSaveOptions) => {
    const prefs = { camera: opts.camera, mic: opts.mic };
    
    if (opts.rememberGlobal) {
      localStorage.setItem(GLOBAL_KEY, JSON.stringify(prefs));
    } else if (opts.rememberRoom) {
      localStorage.setItem(`${ROOM_PREFIX}${roomId}`, JSON.stringify(prefs));
    }
  };

  const clearAll = () => {
    localStorage.removeItem(GLOBAL_KEY);
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(ROOM_PREFIX)) localStorage.removeItem(key);
    });
  };

  const requestMedia = async (prefs: MediaPreferences): Promise<MediaStream | null> => {
    if (!prefs.camera && !prefs.mic) return null;
    
    return await navigator.mediaDevices.getUserMedia({
      video: prefs.camera,
      audio: prefs.mic
    });
  };

  return { getForRoom, getGlobal, savePermissions, clearAll, requestMedia };
};
