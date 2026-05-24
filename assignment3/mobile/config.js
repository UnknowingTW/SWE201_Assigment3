// config.js
// ─────────────────────────────────────────────────────────────────────────────
// Central configuration for the app.
//
// HOW TO SET THE API URL:
//   1. Create a .env file (copy .env.example).
//   2. Set EXPO_PUBLIC_API_URL to your backend URL.
//   3. If testing on a physical device via Expo Go, use your machine's LAN IP,
//      e.g. http://192.168.1.10:3001/api  (NOT localhost — the phone can't reach it).
//   4. Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your LAN IP.
// ─────────────────────────────────────────────────────────────────────────────

import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

function getDevHost() {
  const scriptUrl = NativeModules.SourceCode?.scriptURL || Constants.expoConfig?.hostUri;

  if (!scriptUrl) {
    return null;
  }

  const match = scriptUrl.match(/^[a-z]+:\/\/([^:/]+)/i);
  return match ? match[1] : null;
}

function getDefaultApiBaseUrl() {
  if (Platform.OS === 'web') {
    return '/api';
  }

  if (__DEV__) {
    const devHost = getDevHost();
    if (devHost) {
      return `http://${devHost}:3001/api`;
    }
  }

  return 'http://localhost:3001/api';
}

const config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || getDefaultApiBaseUrl(),
};

export default config;
