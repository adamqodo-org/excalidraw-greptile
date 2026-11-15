/** Cells that start with one of these are run as formulas by spreadsheet apps. */
const FORMULA_PREFIX = /^[=+\-@]/;

const escapeCsvCell = (cell: string | number): string => {
  const text = String(cell);
  const safe = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const toCsvRow = (cells: readonly (string | number)[]): string =>
  cells.map(escapeCsvCell).join(",");

export const statsToCsv = (stats: Record<string, string | number>): string =>
  [
    toCsvRow(["metric", "value"]),
    ...Object.entries(stats).map(([metric, value]) =>
      toCsvRow([metric, value]),
    ),
  ].join("\n");

export const downloadCsv = (csv: string, filename = "scene-stats.csv") => {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
