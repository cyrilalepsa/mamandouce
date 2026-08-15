/**
 * localStorage / sessionStorage peuvent lever en navigation privée (iOS Safari).
 * Jamais d'exception au boot.
 */

function storageGet(store, key) {
  try {
    if (typeof window === "undefined" || !store) return null;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(store, key, value) {
  try {
    if (typeof window === "undefined" || !store) return false;
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function storageRemove(store, key) {
  try {
    if (typeof window === "undefined" || !store) return false;
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function safeGet(key) {
  return storageGet(typeof localStorage !== "undefined" ? localStorage : null, key);
}

export function safeSet(key, value) {
  return storageSet(typeof localStorage !== "undefined" ? localStorage : null, key, value);
}

export function safeRemove(key) {
  return storageRemove(typeof localStorage !== "undefined" ? localStorage : null, key);
}
