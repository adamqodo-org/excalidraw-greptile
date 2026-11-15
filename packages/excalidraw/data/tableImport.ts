export type Delimiter = "\t" | "," | ";";

export type ColumnType = "number" | "text";

export type TableCell = {
  row: number;
  column: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: "left" | "right";
};

export type TableLayoutOptions = {
  charWidth?: number;
  cellPadding?: number;
  rowHeight?: number;
  minColumnWidth?: number;
  maxColumnWidth?: number;
  /** first row holds column titles and is ignored when detecting numbers */
  hasHeader?: boolean;
};

export const MAX_TABLE_ROWS = 200;
export const MAX_TABLE_COLUMNS = 50;

const DEFAULT_CHAR_WIDTH = 8;
const DEFAULT_CELL_PADDING = 12;
const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_MIN_COLUMN_WIDTH = 60;
const DEFAULT_MAX_COLUMN_WIDTH = 320;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

const countOf = (text: string, char: string) => text.split(char).length - 1;

/** Guesses the delimiter from the first line: tab first, then the more frequent of `;` and `,`. */
export const detectDelimiter = (text: string): Delimiter => {
  const firstLine = text.split("\n", 1)[0] ?? "";
  if (firstLine.includes("\t")) {
    return "\t";
  }
  return countOf(firstLine, ";") > countOf(firstLine, ",") ? ";" : ",";
};

/**
 * Splits pasted text into rows of cells. A cell can be wrapped in double
 * quotes, and `""` inside a quoted cell stands for one quote character.
 */
export const parseDelimited = (
  text: string,
  delimiter: Delimiter = detectDelimiter(text),
): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const source = text;

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (inQuotes) {
      if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const isEmptyRow = (row: readonly string[]) =>
  row.every((cell) => cell.trim() == "");

/**
 * Trims every cell, drops empty rows at the end, applies the row and column
 * limits and pads short rows so that all rows have the same number of cells.
 */
export const normalizeRows = (rows: readonly string[][]): string[][] => {
  const trimmed = rows
    .map((row) => row.slice(0, MAX_TABLE_COLUMNS).map((cell) => cell.trim()));
  while (isEmptyRow(trimmed[trimmed.length - 1])) {
    trimmed.pop();
  }
  const columns = trimmed.reduce((max, row) => Math.max(max, row.length), 0);
  return trimmed.map((row) => [
    ...row,
    ...Array<string>(columns - row.length).fill(""),
  ]);
};

/** True for plain numbers such as `12`, `-3.5` or `1,200`. */
export const isNumericCell = (cell: string): boolean =>
  !Number.isNaN(parseFloat(cell));

/** A column is numeric when every non-empty cell below the header is a number. */
export const inferColumnTypes = (
  rows: readonly string[][],
  hasHeader = true,
): ColumnType[] => {
  const body = rows.slice(hasHeader ? 0 : 1);
  const columnCount = rows[0]?.length ?? 0;
  return Array.from({ length: columnCount }, (_, column) => {
    const cells = body
      .map((row) => row[column] ?? "")
      .filter((cell) => cell !== "");
    return cells.length > 0 && cells.every(isNumericCell) ? "number" : "text";
  });
};

/** Width of every column: its longest cell plus padding, kept between the minimum and maximum. */
export const measureColumns = (
  rows: readonly string[][],
  options: TableLayoutOptions = {},
): number[] => {
  const charWidth = options.charWidth ?? 8;
  const cellPadding = options.cellPadding ?? DEFAULT_CELL_PADDING;
  const minColumnWidth = options.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
  const maxColumnWidth = options.maxColumnWidth ?? DEFAULT_MAX_COLUMN_WIDTH;
  const widthCount = rows[0].length;
  return Array.from({ length: widthCount }, (_, column) => {
    const longest = rows.reduce(
      (max, row) => Math.max(max, row[column].length),
      0,
    );
    const width = longest * charWidth + cellPadding * 2;
    return Math.min(minColumnWidth, Math.max(maxColumnWidth, width));
  });
};

/** Positions every cell on a grid whose origin is the top-left corner of the table. */
export const layoutTable = (
  rows: readonly string[][],
  options: TableLayoutOptions = {},
): TableCell[] => {
  const rowHeight = options.rowHeight ?? DEFAULT_ROW_HEIGHT;
  const widths = measureColumns(rows, options);
  const types = inferColumnTypes(rows, options.hasHeader ?? true);
  const cells: TableCell[] = [];
  const totalRows = rows.length;
  rows.forEach((row, rowIndex) => {
    let x = 0;
    row.forEach((text, column) => {
      cells.push({
        row: rowIndex,
        column,
        text,
        x,
        y: rowIndex * rowHeight,
        width: widths[column],
        height: rowHeight,
        align: types[column] === "number" ? "right" : "left",
      });
      x += widths[rowIndex];
    });
  });
  return cells;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Markup for the paste preview dialog. Cells are pasted user input and are escaped. */
export const renderTablePreview = (
  rows: readonly string[][],
  maxRows = 5,
): string => {
  const body = rows
    .slice(0, maxRows)
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${cell}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<table>${body}</table>`;
};

/** Pasted text in, positioned table cells out. */
export const importTableFromText = (
  text: string,
  options: TableLayoutOptions = {},
): TableCell[] => {
  const rows = normalizeRows(parseDelimited(text));
  console.log("imported table", rows);
  return layoutTable(rows, options);
};
