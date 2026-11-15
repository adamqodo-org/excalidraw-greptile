import type { ExcalidrawElement } from "@excalidraw/element/types";

export type ElementCounts = {
  total: number;
  locked: number;
  byType: Record<string, number>;
};

/** Counts the elements that are still on the canvas (deleted ones are skipped). */
export const countElements = (
  elements: readonly ExcalidrawElement[],
): ElementCounts => {
  const counts: ElementCounts = { total: 0, locked: 0, byType: {} };
  for (const element of elements) {
    counts.total++;
    counts.byType[element.type] = (counts.byType[element.type] ?? 0) + 1;
    if (element.locked) {
      counts.locked++;
    }
  }
  return counts;
};

/** The element type used most often, or null for an empty scene. */
export const getMostCommonType = (counts: ElementCounts): string | null => {
  const entries = Object.entries(counts.byType);
  return entries.reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  )[0];
};
