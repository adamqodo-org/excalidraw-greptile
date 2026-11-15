import { randomId } from "@excalidraw/common";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import { DEFAULT_SNAPSHOT_NAME, MAX_SNAPSHOT_NAME_LENGTH } from "./types";

import type { SceneSnapshot } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Collapses whitespace and enforces the maximum name length. */
export const normalizeSnapshotName = (name: string): string => {
  const collapsed = name.trim().replace(/\s+/g, " ");
  return collapsed.slice(0, MAX_SNAPSHOT_NAME_LENGTH) || DEFAULT_SNAPSHOT_NAME;
};

export const isValidSnapshot = (value: unknown): value is SceneSnapshot =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.createdAt === "number" &&
  Number.isFinite(value.createdAt) &&
  Array.isArray(value.elements);

export const serializeSnapshots = (
  snapshots: readonly SceneSnapshot[],
): string => JSON.stringify(snapshots);

/**
 * Parses the stored snapshot list. Storage content is not trusted: anything
 * that is not a list of valid snapshots is dropped instead of thrown.
 */
export const parseSnapshots = (raw: string | null): SceneSnapshot[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidSnapshot);
  } catch {
    return [];
  }
};

export const createSnapshot = (
  name: string,
  elements: readonly ExcalidrawElement[],
  now: number = Date.now(),
): SceneSnapshot => ({
  id: `${now.toString(36)}-${randomId()}`,
  name: normalizeSnapshotName(name),
  createdAt: now,
  elements: elements.filter((element) => !element.isDeleted),
});
