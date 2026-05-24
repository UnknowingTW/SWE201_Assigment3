// screens/TaskDetailScreen.js
// Shows full details of a single task with Edit and Delete actions.

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../store/AppContext';
import CategoryBadge from '../components/CategoryBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { fetchTaskById, deleteTask } from '../api/tasks';
import { COLORS, getStatusInfo } from '../utils/constants';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { dispatch } = useAppContext();

  const [task, setTask]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [deleting, setDeleting]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load task details on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchTaskById(taskId);
        setTask(data);
      } catch (err) {
        Alert.alert('Error', err.message, [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId]);

  // Set navigation header buttons
  useEffect(() => {
    if (!task) return;
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('TaskForm', { mode: 'edit', task })}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowConfirm(true)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [task, navigation]);

  const handleDelete = async () => {
    setShowConfirm(false);
    setDeleting(true);
    try {
      await deleteTask(taskId);
      dispatch({ type: 'TASK_DELETE', payload: taskId });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Delete Failed', err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading || deleting) return <LoadingSpinner message={deleting ? 'Deleting…' : 'Loading…'} />;
  if (!task) return null;

  const status = getStatusInfo(task.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Status + Category row */}
      <View style={styles.metaRow}>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
          <Ionicons name="ellipse" size={10} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <CategoryBadge category={task.category} />
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Description</Text>
        <Text style={styles.cardBody}>
          {task.description?.trim() || 'No description provided.'}
        </Text>
      </View>

      {/* Timestamps */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Timeline</Text>
        <View style={styles.timestampRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.gray} />
          <Text style={styles.timestamp}>
            Created: {new Date(task.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.timestampRow}>
          <Ionicons name="time-outline" size={15} color={COLORS.gray} />
          <Text style={styles.timestamp}>
            Updated: {new Date(task.updatedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('TaskForm', { mode: 'edit', task })}
        >
          <Ionicons name="pencil-outline" size={18} color={COLORS.white} />
          <Text style={styles.editBtnText}>Edit Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowConfirm(true)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Delete confirmation modal */}
      <ConfirmModal
        visible={showConfirm}
        title="Delete Task"
        message={`"${task.title}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: 20, gap: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.dark, lineHeight: 30 },
  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statusText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardBody:  { fontSize: 15, color: COLORS.dark, lineHeight: 22 },
  timestampRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timestamp: { fontSize: 14, color: COLORS.gray },
  actions:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13,
  },
  editBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: COLORS.danger, borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 20,
  },
  deleteBtnText: { color: COLORS.danger, fontWeight: '600', fontSize: 15 },
  headerBtn: { padding: 6 },
});
