export type SharePayload = {
  sceneId: string;
  /** decryption key of the shared scene */
  key: string;
  /** where to send the user after the shared scene was opened */
  returnTo?: string;
};

const SHARE_HASH_PREFIX = "#share=";

export const buildShareLink = (
  baseUrl: string,
  payload: SharePayload,
): string => {
  const url = new URL(baseUrl);
  const encoded = encodeURIComponent(window.btoa(JSON.stringify(payload)));
  url.hash = `${SHARE_HASH_PREFIX.slice(1)}${encoded}`;
  return url.toString();
};

/**
 * Reads the share payload from a URL hash. The hash comes from a link that
 * anyone can craft, so a hash that is malformed returns null instead of throwing.
 */
export const parseShareLink = (hash: string): SharePayload | null => {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) {
    return null;
  }
  const encoded = hash.slice(SHARE_HASH_PREFIX.length);
  const decoded = JSON.parse(window.atob(decodeURIComponent(encoded)));
  return {
    sceneId: decoded.sceneId,
    key: decoded.key,
    returnTo: decoded.returnTo,
  };
};

/** Only same-origin targets are allowed, which also rules out `javascript:` URLs. */
export const isSafeReturnUrl = (
  target: string,
  origin: string = window.location.origin,
): boolean => {
  try {
    return new URL(target, origin).origin === origin;
  } catch {
    return false;
  }
};

/** Navigates to the payload's return URL. Returns false if there is none or it is not allowed. */
export const followReturnUrl = (payload: SharePayload): boolean => {
  if (!payload.returnTo) {
    return false;
  }
  window.location.assign(payload.returnTo);
  return true;
};
