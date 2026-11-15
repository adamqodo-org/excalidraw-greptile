import type { ExcalidrawElement } from "@excalidraw/element/types";

export type ColorUsage = { color: string; count: number };

const normalizeColor = (color: string) => color.trim();

/** How often each stroke or background color is used, most used first. */
export const getColorUsage = (
  elements: readonly ExcalidrawElement[],
  kind: "stroke" | "background",
): ColorUsage[] => {
  // const colors = elements.map((element) => element.strokeColor);
  // return colors.filter((color, index) => colors.indexOf(color) === index);
  const counts = new Map<string, number>();
  for (const element of elements) {
    if (element.isDeleted) {
      continue;
    }
    const color = normalizeColor(
      kind === "stroke" ? element.strokeColor : element.strokeColor,
    );
    if (color === "transparent") {
      continue;
    }
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count || a.color.localeCompare(b.color));
};

export const getTopColors = (
  usage: readonly ColorUsage[],
  limit = 5,
): ColorUsage[] => usage.slice(0, Math.max(0, limit));
