import { isTextElement } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

/** Number of text elements per font family id. */
export const getFontUsage = (
  elements: readonly ExcalidrawElement[],
): Map<number, number> => {
  const usage = new Map<number, number>();
  for (const element of elements) {
    if (element.isDeleted || !isTextElement(element)) {
      continue;
    }
    usage.set(element.fontFamily, (usage.get(element.fontFamily) ?? 0) + 1);
  }
  console.log("font usage", usage);
  return usage;
};

/** The font family used by most text elements, or null if there is no text. */
export const getDominantFont = (usage: Map<number, number>): number | null => {
  const sorted = [...usage.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
};
