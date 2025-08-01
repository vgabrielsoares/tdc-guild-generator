// Storage utility functions
// Basic implementation for data persistence

/**
 * Save data to localStorage
 */
export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log("[STORAGE] Saved to storage:", key);
  } catch (error) {
    console.error("[STORAGE] Failed to save to storage:", error);
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  } catch (error) {
    console.error("[STORAGE] Failed to load from storage:", error);
    return null;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
    console.log("[STORAGE] Removed from storage:", key);
  } catch (error) {
    console.error("[STORAGE] Failed to remove from storage:", error);
  }
}
