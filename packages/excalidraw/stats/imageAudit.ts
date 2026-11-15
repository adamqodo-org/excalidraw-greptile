import { isImageElement } from "@excalidraw/element";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import type { BinaryFiles } from "../types";

export type ImageAudit = {
  images: number;
  /** ids of image elements whose file is not loaded */
  missingFiles: string[];
  /** ids of files that no image element uses */
  unusedFiles: string[];
  totalBytes: number;
};

/** Approximate decoded size of a base64 data URL. */
export const estimateDataUrlBytes = (dataURL: string): number => {
  const comma = dataURL.indexOf(",");
  if (comma === -1) {
    return 0;
  }
  const base64 = dataURL.slice(comma + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

export const auditImages = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
): ImageAudit => {
  const used = new Set<string>();
  const missingFiles: string[] = [];
  let images = 0;
  for (const element of elements) {
    if (element.isDeleted || !isImageElement(element)) {
      continue;
    }
    images++;
    if (!element.fileId) {
      continue;
    }
    used.add(element.fileId);
  }
  let totalBytes = 0;
  for (const fileId of used) {
    totalBytes += estimateDataUrlBytes(files[fileId].dataURL);
  }
  return {
    images,
    missingFiles,
    unusedFiles: Object.keys(files).filter((fileId) => !used.has(fileId)),
    totalBytes,
  };
};
