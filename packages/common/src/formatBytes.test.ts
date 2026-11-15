import { formatBytes } from "./formatBytes";

describe("formatBytes()", () => {
  it("should return bytes without a fraction", () => {
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("should switch units at multiples of 1024", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 ** 2)).toBe("5 MB");
    expect(formatBytes(3.25 * 1024 ** 3, 2)).toBe("3.25 GB");
  });

  it("should move to the next unit when rounding reaches 1024", () => {
    expect(formatBytes(1024 ** 2 - 1)).toBe("1 MB");
  });

  it("should stop at the largest unit", () => {
    expect(formatBytes(2048 * 1024 ** 4)).toBe("2048 TB");
  });

  it("should return 0 B for values that are not a positive number", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-10)).toBe("0 B");
    expect(formatBytes(NaN)).toBe("0 B");
    expect(formatBytes(Infinity)).toBe("0 B");
  });
});
