// The reader's ticks, kept in the browser only, shared by /undo and /undo/all through one key.

export const STORAGE_KEY = 'undo-signed-v1';

export function readSigned(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function writeSigned(ids: string[] | null) {
  try {
    if (ids === null || ids.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage is a convenience. The page works the same without it.
  }
}

export function safeId(id: string): string {
  return id.replace(/[^\w-]/g, '_');
}
