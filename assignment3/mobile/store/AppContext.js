// store/AppContext.js
// Global state using Context API + useReducer (Unit III requirement).
// Provides auth, tasks, categories, and filter state to the whole app.

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer, initialState } from './reducer';
import { loadItem, saveItem, removeItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { setAuthToken } from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Rehydrate auth state from AsyncStorage on first mount ─────────────────
  useEffect(() => {
    async function rehydrate() {
      const token = await loadItem(STORAGE_KEYS.AUTH_TOKEN);
      const user  = await loadItem(STORAGE_KEYS.AUTH_USER);
      const filter = await loadItem(STORAGE_KEYS.LAST_FILTER);

      if (token && user) {
        setAuthToken(token);          // inject into axios default headers
        dispatch({ type: 'LOGIN', payload: { token, user } });
      }
      if (filter) {
        dispatch({ type: 'SET_FILTER', payload: filter });
      }

      dispatch({ type: 'AUTH_READY' }); // signal that rehydration is done
    }
    rehydrate();
  }, []);

  // ── Persist filter changes to AsyncStorage ────────────────────────────────
  useEffect(() => {
    if (state.isAuthReady) {
      saveItem(STORAGE_KEYS.LAST_FILTER, state.activeFilter);
    }
  }, [state.activeFilter, state.isAuthReady]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/** Convenience hook — use this instead of useContext(AppContext) directly. */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ── Selector helpers (equivalent to Redux selectors) ─────────────────────────
export const selectUser          = (state) => state.user;
export const selectToken         = (state) => state.token;
export const selectIsAuthReady   = (state) => state.isAuthReady;
export const selectTasks         = (state) => state.tasks;
export const selectTasksLoading  = (state) => state.tasksLoading;
export const selectTasksError    = (state) => state.tasksError;
export const selectCategories    = (state) => state.categories;
export const selectActiveFilter  = (state) => state.activeFilter;
