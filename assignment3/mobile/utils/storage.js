// utils/storage.js
// Thin wrappers around AsyncStorage for consistent error handling.

import AsyncStorage from '@react-native-async-storage/async-storage';

/** Save a value (will be JSON-stringified). */
export async function saveItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('[Storage] saveItem error:', err.message);
  }
}

/** Load and parse a stored value. Returns null if not found or on error. */
export async function loadItem(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[Storage] loadItem error:', err.message);
    return null;
  }
}

/** Remove a stored value. */
export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error('[Storage] removeItem error:', err.message);
  }
}

/** Clear all stored values (use sparingly — wipes everything). */
export async function clearAll() {
  try {
    await AsyncStorage.clear();
  } catch (err) {
    console.error('[Storage] clearAll error:', err.message);
  }
}
