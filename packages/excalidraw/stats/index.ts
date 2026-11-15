import type { ExcalidrawElement } from "@excalidraw/element/types";

import { getAspectRatio, summarizeBounds } from "./boundsSummary";
import { getColorUsage, getTopColors } from "./colorUsage";
import { countDuplicates, findDuplicates } from "./duplicateFinder";
import { countElements, getMostCommonType } from "./elementCounts";
import { getDominantFont, getFontUsage } from "./fontUsage";
import { getMaxGroupDepth, getUngroupedCount } from "./groupDepth";
import { auditImages } from "./imageAudit";
import { auditLinks } from "./linkAudit";
import { getTextMetrics } from "./textMetrics";

import type { BinaryFiles } from "../types";

/** Everything the scene statistics panel shows, computed in one pass per metric. */
export const collectSceneStats = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
) => {
  const counts = countElements(elements);
  const bounds = summarizeBounds(elements);
  return {
    counts,
    mostCommonType: getMostCommonType(counts),
    bounds,
    aspectRatio: bounds ? getAspectRatio(bounds) : 0,
    strokeColors: getTopColors(getColorUsage(elements, "stroke")),
    backgroundColors: getTopColors(getColorUsage(elements, "background")),
    text: getTextMetrics(elements),
    dominantFont: getDominantFont(getFontUsage(elements)),
    maxGroupDepth: getMaxGroupDepth(elements),
    ungrouped: getUngroupedCount(elements),
    duplicates: countDuplicates(findDuplicates(elements)),
    linkIssues: auditLinks(elements),
    images: auditImages(elements, files),
  };
};

export type SceneStats = ReturnType<typeof collectSceneStats>;
