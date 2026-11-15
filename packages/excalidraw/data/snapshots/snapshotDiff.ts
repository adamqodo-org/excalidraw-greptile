import type { SceneSnapshot } from "./types";

export type SnapshotDiff = {
  /** ids of elements that exist only in the newer snapshot */
  added: string[];
  /** ids of elements that exist only in the older snapshot */
  removed: string[];
  /** ids of elements that exist in both but were edited in between */
  changed: string[];
};

export const diffSnapshots = (
  before: SceneSnapshot,
  after: SceneSnapshot,
): SnapshotDiff => {
  const beforeById = new Map(
    before.elements.map((element) => [element.id, element]),
  );
  const afterById = new Map(
    after.elements.map((element) => [element.id, element]),
  );
  const diff: SnapshotDiff = { added: [], removed: [], changed: [] };

  for (const [id, element] of afterById) {
    const previous = beforeById.get(id);
    if (!previous) {
      diff.added.push(id);
    } else if (
      previous.version !== element.version ||
      previous.versionNonce !== element.versionNonce
    ) {
      diff.changed.push(id);
    }
  }
  for (const id of beforeById.keys()) {
    if (!afterById.has(id)) {
      diff.removed.push(id);
    }
  }
  return diff;
};

export const isEmptyDiff = (diff: SnapshotDiff): boolean =>
  diff.added.length + diff.removed.length + diff.changed.length === 0;

const countLabel = (count: number): string =>
  `${count} ${count === 1 ? "element" : "elements"}`;

/** One-line description for the snapshot list, e.g. "2 elements added, 1 element removed". */
export const summarizeDiff = (diff: SnapshotDiff): string => {
  if (isEmptyDiff(diff)) {
    return "No changes";
  }
  const parts: string[] = [];
  if (diff.added.length) {
    parts.push(`${countLabel(diff.added.length)} added`);
  }
  if (diff.removed.length) {
    parts.push(`${countLabel(diff.removed.length)} removed`);
  }
  if (diff.changed.length) {
    parts.push(`${countLabel(diff.changed.length)} changed`);
  }
  return parts.join(", ");
};
