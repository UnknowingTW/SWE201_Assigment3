// api/auth.js
// Auth-related API calls (login, register).

import client from './client';

/**
 * Login with email and password.
 * Returns { token, user }.
 */
export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data; // { token, user }
}

/**
 * Register a new account.
 * Returns { token, user }.
 */
export async function register(name, email, password) {
  const { data } = await client.post('/auth/register', { name, email, password });
  return data; // { token, user }
}
