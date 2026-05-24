// hooks/useAuth.js
// Custom hook that handles login, register, and logout logic.
// Abstracts the auth flow so screens stay simple.

import { useCallback } from 'react';
import { useAppContext, selectUser } from '../store/AppContext';
import * as authApi from '../api/auth';
import { setAuthToken } from '../api/client';
import { saveItem, removeItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

export function useAuth() {
  const { state, dispatch } = useAppContext();
  const user = selectUser(state);

  /** Login: call API, persist token, update global state. */
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password); // throws on error
    const { token, user: authUser } = data;

    // Persist to AsyncStorage so session survives app restarts
    await saveItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await saveItem(STORAGE_KEYS.AUTH_USER, authUser);

    // Inject token into axios default headers
    setAuthToken(token);

    dispatch({ type: 'LOGIN', payload: { token, user: authUser } });
    return authUser;
  }, [dispatch]);

  /** Register: call API, persist token, update global state. */
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    const { token, user: authUser } = data;

    await saveItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await saveItem(STORAGE_KEYS.AUTH_USER, authUser);
    setAuthToken(token);

    dispatch({ type: 'LOGIN', payload: { token, user: authUser } });
    return authUser;
  }, [dispatch]);

  /** Logout: clear storage and reset global state. */
  const logout = useCallback(async () => {
    await removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await removeItem(STORAGE_KEYS.AUTH_USER);
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return { user, isLoggedIn: !!user, login, register, logout };
}
