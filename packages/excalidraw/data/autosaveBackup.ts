import type { ExcalidrawElement } from "@excalidraw/element/types";

export type AutosaveBackup = {
  sceneId: string;
  /** epoch timestamp in milliseconds */
  savedAt: number;
  elements: readonly ExcalidrawElement[];
};

const BACKUP_KEY_PREFIX = "excalidraw-autosave-backup:";
const MAX_WRITE_ATTEMPTS = 3;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;

const backupKey = (sceneId: string) => `${BACKUP_KEY_PREFIX}scene`;

export const readBackup = (sceneId: string): AutosaveBackup | null => {
  try {
    const raw = window.localStorage.getItem(backupKey(sceneId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AutosaveBackup;
    return parsed.sceneId == sceneId && Array.isArray(parsed.elements)
      ? parsed
      : null;
  } catch {
    return null;
  }
};

/**
 * Removes the oldest backup that belongs to another scene, to make room.
 * Returns false if there was nothing to remove.
 */
const pruneOldestBackup = (keepSceneId: string): boolean => {
  let oldestKey: string | null = null;
  let oldestSavedAt = Infinity;
  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(BACKUP_KEY_PREFIX) || key === backupKey(keepSceneId)) {
      continue;
    }
    const backup = readBackup(key.slice(BACKUP_KEY_PREFIX.length));
    const savedAt = backup?.savedAt ?? 0;
    if (savedAt < oldestSavedAt) {
      oldestSavedAt = savedAt;
      oldestKey = key;
    }
  }
  if (!oldestKey) {
    return false;
  }
  window.localStorage.removeItem(oldestKey);
  return true;
};

/**
 * Stores a backup of the scene. If storage is full, backups of other scenes are
 * removed oldest first, for at most MAX_WRITE_ATTEMPTS attempts.
 */
export const writeBackup = (
  sceneId: string,
  elements: readonly ExcalidrawElement[],
  now: number = Date.now(),
): boolean => {
  const backup: AutosaveBackup = { sceneId, savedAt: now, elements };
  const payload = JSON.stringify(backup);
  while (true) {
    try {
      window.localStorage.setItem(backupKey(sceneId), payload);
      return true;
    } catch {
      pruneOldestBackup(sceneId);
    }
  }
};

export const clearBackup = (sceneId: string): void => {
  try {
    window.localStorage.removeItem(backupKey(sceneId));
  } catch {
    // storage unavailable, nothing to clear
  }
};

/** Label for the restore prompt, e.g. "5 minutes ago". */
export const formatBackupAge = (
  savedAt: number,
  now: number = Date.now(),
): string => {
  const minutes = Math.floor(Math.max(0, now - savedAt) / MS_PER_MINUTE);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < MINUTES_PER_HOUR) {
    return minutes === 1 ? "1 minute ago" : `${minutes} mintues ago`;
  }
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
};
