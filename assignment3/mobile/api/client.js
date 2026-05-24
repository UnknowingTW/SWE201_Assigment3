// api/client.js
// Centralized Axios instance.
// All API calls go through this client so auth headers and base URL are applied
// automatically — no duplication across API modules.

import axios from 'axios';
import config from '../config';

const client = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: log outgoing calls during development ────────────────
client.interceptors.request.use((req) => {
  console.log(`[API] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
  return req;
});

// ── Response interceptor: normalize error messages ────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Check your connection.'));
    }
    if (!error.response) {
      return Promise.reject(
        new Error('Network error. Make sure the backend server is running.')
      );
    }
    // Surface the server's error message when available
    const serverMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      `Server error (${error.response?.status})`;
    return Promise.reject(new Error(serverMsg));
  }
);

/** Inject or remove the JWT Bearer token in default headers. */
export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
}

export default client;
