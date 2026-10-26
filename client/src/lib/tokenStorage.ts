export const TOKEN_STORAGE_KEY = "token";

const LEGACY_AUTH_KEYS = ["username", "id_user", "role"] as const;

const getStorage = (): Storage | null => {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
};

export const readStoredToken = (): string | null => {
  try {
    return getStorage()?.getItem(TOKEN_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
};

export const writeStoredToken = (token: string): void => {
  try {
    getStorage()?.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
};

export const clearStoredAuth = (): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(TOKEN_STORAGE_KEY);
    LEGACY_AUTH_KEYS.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
};
