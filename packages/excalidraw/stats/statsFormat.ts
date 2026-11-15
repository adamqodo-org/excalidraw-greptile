export const formatCount = (count: number): string =>
  new Intl.NumberFormat().format(count);

/** Share of `part` in `total` as a whole percentage. An empty total is 0%. */
export const formatPercent = (part: number, total: number): string =>
  total === 0 ? "0%" : `${Math.round((part / total) * 100)}%`;

export const formatDimensions = (width: number, height: number): string =>
  `${Math.round(width)} × ${Math.round(height)}`;

/** Shortens a label to at most `maxLength` characters, ellipsis included. */
export const truncateLabel = (label: string, maxLength = 24): string =>
  label.length <= maxLength ? label : `${label.slice(0, maxLength - 1)}…`;
