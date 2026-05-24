// screens/TaskListScreen.js
// Main screen: shows list of tasks with search, status filter, and FAB to create.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext, selectTasks, selectActiveFilter, selectTasksLoading, selectTasksError } from '../store/AppContext';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { fetchTasks } from '../api/tasks';
import { fetchCategories } from '../api/categories';
import { COLORS, TASK_STATUSES } from '../utils/constants';

export default function TaskListScreen({ navigation }) {
  const { state, dispatch } = useAppContext();
  const { user, logout } = useAuth();
  const tasks       = selectTasks(state);
  const filter      = selectActiveFilter(state);
  const loading     = selectTasksLoading(state);
  const error       = selectTasksError(state);

  const [search, setSearch] = useState(filter.search || '');
  const [refreshing, setRefreshing] = useState(false);

  // Load tasks from API and push to global state
  const loadTasks = useCallback(async () => {
    dispatch({ type: 'TASKS_LOADING' });
    try {
      const data = await fetchTasks({
        search:     filter.search,
        status:     filter.status,
        categoryId: filter.categoryId,
      });
      dispatch({ type: 'TASKS_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'TASKS_ERROR', payload: err.message });
    }
  }, [dispatch, filter.search, filter.status, filter.categoryId]);

  // Also load categories for filter UI
  const loadCategories = useCallback(async () => {
    dispatch({ type: 'CATEGORIES_LOADING' });
    try {
      const data = await fetchCategories();
      dispatch({ type: 'CATEGORIES_SUCCESS', payload: data });
    } catch {/* non-critical */}
  }, [dispatch]);

  // Reload when screen comes into focus (e.g. returning from create/edit)
  useFocusEffect(useCallback(() => {
    loadTasks();
    loadCategories();
  }, [loadTasks, loadCategories]));

  // Debounce search input → update filter in global state
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_FILTER', payload: { search } });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const setStatusFilter = (status) => {
    dispatch({ type: 'SET_FILTER', payload: { status: filter.status === status ? '' : status } });
  };

  if (loading && tasks.length === 0) return <LoadingSpinner message="Loading tasks…" />;

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subheading}>You have {tasks.length} task{tasks.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks…"
          placeholderTextColor={COLORS.border}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Status filter chips ─────────────────────────────────────────────── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {TASK_STATUSES.map((s) => {
          const active = filter.status === s.value;
          return (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, active && { backgroundColor: s.color }]}
              onPress={() => setStatusFilter(s.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error ? (
        <ErrorMessage message={error} onRetry={loadTasks} />
      ) : (
        /* ── Task list ──────────────────────────────────────────────────────── */
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={tasks.length === 0 ? styles.flex : styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="No tasks found"
              subtitle={
                filter.search || filter.status
                  ? 'Try clearing your filters.'
                  : 'Tap the + button to create your first task.'
              }
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}

      {/* ── FAB (Floating Action Button) ────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm', { mode: 'create' })}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  subheading: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
  logoutBtn: { padding: 8 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.dark, paddingVertical: 8 },
  filterBar: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipText: { fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});
