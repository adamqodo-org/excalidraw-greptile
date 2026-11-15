import { fileSave } from "../filesystem";

import { parseSnapshots, serializeSnapshots } from "./snapshotSerializer";
import { getAllSnapshots, replaceAllSnapshots } from "./snapshotStore";
import { MAX_SNAPSHOTS } from "./types";

import type { SceneSnapshot } from "./types";

/**
 * Downloads every stored snapshot as one JSON file.
 * Resolves to false when there is nothing to export.
 */
export const exportSnapshots = async (): Promise<boolean> => {
  const snapshots = getAllSnapshots();
  if (!snapshots.length) {
    return false;
  }
  const blob = new Blob([serializeSnapshots(snapshots)], {
    type: "application/json",
  });
  await fileSave(blob, {
    name: "excalidraw-snapshots",
    extension: "json",
    description: "Excalidraw scene snapshots",
  });
  return true;
};

/** Adds incoming snapshots to the existing ones. Existing ids win. */
export const mergeSnapshots = (
  existing: readonly SceneSnapshot[],
  incoming: readonly SceneSnapshot[],
): SceneSnapshot[] => {
  const byId = new Map(existing.map((snapshot) => [snapshot.id, snapshot]));
  for (const snapshot of incoming) {
    if (!byId.has(snapshot.id)) {
      byId.set(snapshot.id, snapshot);
    }
  }
  return [...byId.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_SNAPSHOTS);
};

/**
 * Imports snapshots from a previously exported file and merges them into the
 * stored list. Resolves to the number of snapshots found in the file.
 */
export const importSnapshots = async (file: Blob): Promise<number> => {
  const incoming = parseSnapshots(await file.text());
  if (!incoming.length) {
    return 0;
  }
  const merged = mergeSnapshots(getAllSnapshots(), incoming);
  return replaceAllSnapshots(merged) ? incoming.length : 0;
};
