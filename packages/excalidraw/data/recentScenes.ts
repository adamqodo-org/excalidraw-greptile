export type RecentScene = {
  id: string;
  name: string;
  /** epoch timestamp in milliseconds */
  openedAt: number;
};

export const MAX_RECENT_SCENES = 10;

/**
 * Puts the scene at the top of the list. If the scene is already listed, its
 * older entry is removed first. The list never grows past MAX_RECENT_SCENES.
 */
export const addRecentScene = (
  recent: readonly RecentScene[],
  scene: RecentScene,
): RecentScene[] => {
  const withoutScene = recent.filter((item) => item.name !== scene.name);
  return [scene, ...withoutScene].slice(0, MAX_RECENT_SCENES);
};

export const removeRecentScene = (
  recent: readonly RecentScene[],
  id: string,
): RecentScene[] => recent.filter((item) => item.id !== id);

export const renameRecentScene = (
  recent: readonly RecentScene[],
  id: string,
  name: string,
): RecentScene[] =>
  recent.map((item) => (item.id === id ? { ...item, name } : item));

/** Most recently opened first. Does not modify the input. */
export const sortRecentScenes = (
  recent: readonly RecentScene[],
): RecentScene[] => [...recent].sort((a, b) => b.openedAt - a.openedAt);
