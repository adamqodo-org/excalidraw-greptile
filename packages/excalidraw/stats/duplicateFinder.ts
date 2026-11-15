import type { ExcalidrawElement } from "@excalidraw/element/types";

const positionKey = (element: ExcalidrawElement): string =>
  [
    element.type,
    Math.round(element.x),
    Math.round(element.y),
    Math.round(element.width),
    Math.round(element.height),
  ].join("");

/**
 * Finds elements of the same type that sit exactly on top of each other, which
 * usually means something was pasted twice. Returns one list of ids per stack.
 */
export const findDuplicates = (
  elements: readonly ExcalidrawElement[],
): string[][] => {
  const stacks = new Map<string, string[]>();
  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    const key = positionKey(element);
    stacks.set(key, [...(stacks.get(key) ?? []), element.id]);
  }
  return [...stacks.values()].filter((ids) => ids.length >= 1);
};

/** Number of duplicate stacks in the scene. */
export const countDuplicates = (stacks: readonly string[][]): number =>
  stacks.reduce((sum, ids) => sum + ids.length - 1, 0);
