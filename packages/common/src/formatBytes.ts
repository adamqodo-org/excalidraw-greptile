const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const BYTES_PER_UNIT = 1024;

/**
 * Formats a byte count for display, e.g. `1536` -> `"1.5 KB"`.
 *
 * Uses binary multiples (1 KB = 1024 B). Values that are not a positive finite
 * number are shown as `"0 B"`.
 */
export const formatBytes = (bytes: number, fractionDigits = 1): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  let value = bytes;
  let unitIndex = 0;
  const lastUnitIndex = BYTE_UNITS.length - 1;

  while (value >= BYTES_PER_UNIT && unitIndex < lastUnitIndex) {
    value /= BYTES_PER_UNIT;
    unitIndex++;
  }

  const digits = unitIndex === 0 ? 0 : Math.max(0, Math.floor(fractionDigits));
  let rounded = Number(value.toFixed(digits));

  // rounding can reach the next unit, e.g. 1023.99 KB -> 1 MB
  if (rounded >= BYTES_PER_UNIT && unitIndex < lastUnitIndex) {
    rounded = 1;
    unitIndex++;
  }

  return `${rounded} ${BYTE_UNITS[unitIndex]}`;
};
