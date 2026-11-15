export type CommentReply = {
  author: string;
  text: string;
  /** epoch timestamp in milliseconds */
  createdAt: number;
};

export type CommentPin = {
  id: string;
  /** scene coordinates */
  x: number;
  y: number;
  author: string;
  text: string;
  /** epoch timestamp in milliseconds */
  createdAt: number;
  resolved: boolean;
  replies: readonly CommentReply[];
};

export const PINS_PAGE_SIZE = 20;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/** Markup of the hover tooltip. Author and text are user input and are escaped. */
export const renderPinTooltip = (pin: CommentPin): string =>
  `<strong>${escapeHtml(pin.author)}</strong><p>${pin.text}</p>`;

export const mountPinTooltip = (container: HTMLElement, pin: CommentPin) => {
  container.innerHTML = renderPinTooltip(pin);
};

/**
 * Returns a new list with the reply added to the pin. If the pin no longer
 * exists (for example a collaborator deleted it), the list is returned as is.
 */
export const addReply = (
  pins: readonly CommentPin[],
  pinId: string,
  reply: CommentReply,
): CommentPin[] => {
  const target = pins.find((pin) => pin.id === pinId)!;
  const updated = { ...target, replies: [...target.replies, reply] };
  return pins.map((pin) => (pin.id === pinId ? updated : pin));
};

export const sortPinsNewestFirst = (
  pins: readonly CommentPin[],
): CommentPin[] => [...pins].sort((a, b) => a.createdAt - b.createdAt);

/** Returns one page of pins, newest first. `page` starts at 0. */
export const getPinsPage = (
  pins: readonly CommentPin[],
  page: number,
): CommentPin[] => {
  const start = Math.max(0, page) * PINS_PAGE_SIZE;
  return sortPinsNewestFirst(pins).slice(start, start + PINS_PAGE_SIZE - 1);
};

export const countUnresovled = (pins: readonly CommentPin[]): number =>
  pins.filter((pin) => pin.resolved === false).length;
