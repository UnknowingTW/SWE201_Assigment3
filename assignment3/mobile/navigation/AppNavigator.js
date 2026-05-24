// navigation/AppNavigator.js
// Root navigator: shows Auth stack when logged out, Main stack when logged in.
// Reacts automatically to changes in global auth state.

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext, selectIsAuthReady } from '../store/AppContext';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../utils/constants';

// Screens
import LoginScreen      from '../screens/LoginScreen';
import RegisterScreen   from '../screens/RegisterScreen';
import TaskListScreen   from '../screens/TaskListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen   from '../screens/TaskFormScreen';
import CategoriesScreen from '../screens/CategoriesScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Bottom Tab Navigator (Tasks + Categories) ────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          backgroundColor: COLORS.white,
          paddingBottom: 5,
          height: 58,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Tasks:      focused ? 'checkmark-circle'   : 'checkmark-circle-outline',
            Categories: focused ? 'folder'              : 'folder-outline',
          };
          return <Ionicons name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks"      component={TaskListScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

// ── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Main Stack (wraps tabs + detail/form screens) ────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: COLORS.white },
        headerTintColor:  COLORS.dark,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle:     { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home"       component={MainTabs}        options={{ headerShown: false }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
      <Stack.Screen name="TaskForm"   component={TaskFormScreen}   options={{ title: 'New Task' }} />
    </Stack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { state } = useAppContext();
  const isAuthReady = selectIsAuthReady(state);
  const { isLoggedIn } = useAuth();

  // Show a splash/loading indicator while AsyncStorage is being read
  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
