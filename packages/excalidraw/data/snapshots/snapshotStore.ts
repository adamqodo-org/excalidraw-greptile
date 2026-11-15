import type { ExcalidrawElement } from "@excalidraw/element/types";

import {
  createSnapshot,
  normalizeSnapshotName,
  parseSnapshots,
  serializeSnapshots,
} from "./snapshotSerializer";
import { MAX_SNAPSHOTS, SNAPSHOT_STORAGE_KEY } from "./types";

import type { SceneSnapshot, SnapshotSummary } from "./types";

/** In-memory copy of the stored list, so listing does not re-parse storage. */
let cache: SceneSnapshot[] | null = null;

const read = (): SceneSnapshot[] => {
  if (cache) {
    return cache;
  }
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
  } catch (error: any) {
    console.warn(`Could not read snapshots: ${error.message}`);
  }
  cache = parseSnapshots(raw);
  return cache;
};

/** Persists the list and refreshes the cache. Returns false if storage rejects it. */
const write = (snapshots: SceneSnapshot[]): boolean => {
  try {
    window.localStorage.setItem(
      SNAPSHOT_STORAGE_KEY,
      serializeSnapshots(snapshots),
    );
    cache = snapshots;
    return true;
  } catch (error: any) {
    console.warn(`Could not store snapshots: ${error.message}`);
    return false;
  }
};

const sortNewestFirst = (snapshots: readonly SceneSnapshot[]) =>
  [...snapshots].sort((a, b) => b.createdAt - a.createdAt);

/**
 * Saves the current scene as a named snapshot. Only the newest MAX_SNAPSHOTS
 * are kept. Returns null if the snapshot could not be stored.
 */
export const saveSnapshot = (
  name: string,
  elements: readonly ExcalidrawElement[],
): SceneSnapshot | null => {
  const snapshot = createSnapshot(name, elements);
  const next = sortNewestFirst([snapshot, ...read()]).slice(0, MAX_SNAPSHOTS);
  return write(next) ? snapshot : null;
};

export const listSnapshots = (): SnapshotSummary[] =>
  sortNewestFirst(read()).map(({ id, name, createdAt, elements }) => ({
    id,
    name,
    createdAt,
    elementCount: elements.length,
  }));

export const getSnapshot = (id: string): SceneSnapshot | null =>
  read().find((snapshot) => snapshot.id === id) ?? null;

export const getAllSnapshots = (): SceneSnapshot[] => sortNewestFirst(read());

export const replaceAllSnapshots = (snapshots: SceneSnapshot[]): boolean =>
  write(sortNewestFirst(snapshots).slice(0, MAX_SNAPSHOTS));

export const renameSnapshot = (id: string, name: string): boolean => {
  const snapshots = read();
  if (!snapshots.some((snapshot) => snapshot.id === id)) {
    return false;
  }
  return write(
    snapshots.map((snapshot) =>
      snapshot.id === id
        ? { ...snapshot, name: normalizeSnapshotName(name) }
        : snapshot,
    ),
  );
};

export const deleteSnapshot = (id: string): boolean => {
  const snapshots = read();
  const remaining = snapshots.filter((snapshot) => snapshot.id !== id);
  if (remaining.length === snapshots.length) {
    return false;
  }
  return write(remaining);
};

/** Drops the in-memory copy, e.g. after another tab changed storage. */
export const clearSnapshotCache = () => {
  cache = null;
};
