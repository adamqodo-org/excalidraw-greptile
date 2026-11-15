import type { ExcalidrawElement } from "@excalidraw/element/types";

export type LinkIssue = {
  elementId: string;
  link: string;
  reason: "invalid" | "unsafe" | "insecure";
};

// eslint-disable-next-line no-script-url
const UNSAFE_PROTOCOLS = ["javascript:", "data:", "vbscript:"];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Lists element links that cannot be parsed, run script, or use plain http. */
export const auditLinks = (
  elements: readonly ExcalidrawElement[],
): LinkIssue[] => {
  const issues: LinkIssue[] = [];
  for (const element of elements) {
    if (element.isDeleted || !element.link) {
      continue;
    }
    const base = { elementId: element.id, link: element.link };
    let url: URL;
    try {
      url = new URL(element.link);
    } catch {
      issues.push({ ...base, reason: "invalid" });
      continue;
    }
    if (UNSAFE_PROTOCOLS.includes(url.protocol)) {
      issues.push({ ...base, reason: "unsafe" });
    } else if (url.protocol === "http:") {
      issues.push({ ...base, reason: "insecure" });
    }
  }
  return issues;
};

/** List items for the audit panel. Links are user input and are escaped. */
export const renderLinkReport = (issues: readonly LinkIssue[]): string =>
  issues
    .map((issue) => `<li>${escapeHtml(issue.link)} (${issue.reason})</li>`)
    .join("");
