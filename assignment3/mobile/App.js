// App.js
// Root component. Wraps everything in the global AppProvider so all screens
// have access to shared state via Context API + useReducer.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './store/AppContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AppProvider>
  );
}
