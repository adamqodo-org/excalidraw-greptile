import type { ExcalidrawElement } from "@excalidraw/element/types";

export type SceneSnapshot = {
  id: string;
  name: string;
  /** epoch timestamp in milliseconds */
  createdAt: number;
  elements: readonly ExcalidrawElement[];
};

export type SnapshotSummary = Pick<
  SceneSnapshot,
  "id" | "name" | "createdAt"
> & {
  elementCount: number;
};

export const SNAPSHOT_STORAGE_KEY = "excalidraw-scene-snapshots";
export const MAX_SNAPSHOTS = 20;
export const MAX_SNAPSHOT_NAME_LENGTH = 60;
export const DEFAULT_SNAPSHOT_NAME = "Untitled snapshot";
