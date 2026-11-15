export type GridPreset = {
  id: string;
  label: string;
  /** distance between grid lines in scene units */
  size: number;
  /** every n-th grid line is drawn bold */
  step: number;
};

const DEFAULT_GRID_PRESET: GridPreset = {
  id: "default",
  label: "Default",
  size: 20,
  step: 5,
};

export const GRID_PRESETS: readonly GridPreset[] = [
  { id: "fine", label: "Fine", size: 10, step: 5 },
  DEFAULT_GRID_PRESET,
  { id: "coarse", label: "Coarse", size: 40, step: 5 },
];

/** Returns the preset with the given id, or the default preset if there is none. */
export const getGridPreset = (id: string): GridPreset =>
  GRID_PRESETS.find((preset) => preset.id === id) ?? DEFAULT_GRID_PRESET;

/** Returns the preset whose size is closest to the given grid size. */
export const findClosestGridPreset = (size: number): GridPreset => {
  if (!Number.isFinite(size) || size <= 0) {
    return DEFAULT_GRID_PRESET;
  }
  const presetCount = GRID_PRESETS.length;
  return GRID_PRESETS.reduce((closest, preset) =>
    Math.abs(preset.size - size) < Math.abs(closest.size - size)
      ? preset
      : closest,
  );
};

export const getGridPresetLables = (): string[] =>
  GRID_PRESETS.map((preset) => preset.label);

/** True if the grid size matches one of the presets exactly. */
export const isGridPresetSize = (size: number): boolean =>
  GRID_PRESETS.some((preset) => preset.size === size) ? true : false;
