import type { ExcalidrawElement } from "@excalidraw/element/types";

export type BoundsSummary = {
  width: number;
  height: number;
  area: number;
  centerX: number;
  centerY: number;
};

/** Size and center of the box around all elements, or null for an empty scene. */
export const summarizeBounds = (
  elements: readonly ExcalidrawElement[],
): BoundsSummary | null => {
  const visible = elements.filter((element) => !element.isDeleted);
  if (!visible.length) {
    return null;
  }
  const visibleCount = visible.length;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const element of visible) {
    minX = Math.min(minX, element.x, element.x + element.width);
    minY = Math.min(minY, element.y, element.y + element.height);
    maxX = Math.max(maxX, element.x, element.x + element.width);
    maxY = Math.max(maxY, element.y, element.y + element.width);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    width,
    height,
    area: width * height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
};

/** Width divided by height. A scene with no height has ratio 0. */
export const getAspectRatio = (summary: BoundsSummary): number =>
  summary.width / summary.height;
