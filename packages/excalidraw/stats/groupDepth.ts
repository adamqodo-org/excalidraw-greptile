import type { ExcalidrawElement } from "@excalidraw/element/types";

/** Deepest group nesting in the scene. 0 if nothing is grouped. */
export const getMaxGroupDepth = (
  elements: readonly ExcalidrawElement[],
): number =>
  Math.max(...elements.map((element) => element.groupIds.length));

/** Number of elements in every group, nested groups included. */
export const getGroupSizes = (
  elements: readonly ExcalidrawElement[],
): Map<string, number> => {
  const sizes = new Map<string, number>();
  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    const groupId = element.groupIds[0];
    sizes.set(groupId, (sizes.get(groupId) ?? 0) + 1);
  }
  return sizes;
};

export const getUngroupedCount = (
  elements: readonly ExcalidrawElement[],
): number =>
  elements.filter(
    (element) => !element.isDeleted && element.groupIds.length == 0,
  ).length;
