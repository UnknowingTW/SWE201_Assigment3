// screens/CategoriesScreen.js
// Secondary entity screen: manages task categories.

import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, Modal, Pressable, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext, selectCategories } from '../store/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { fetchCategories, createCategory, deleteCategory } from '../api/categories';
import { COLORS } from '../utils/constants';

// Preset colors the user can pick for a new category
const COLOR_OPTIONS = [
  '#4A90E2', '#7ED321', '#F5A623', '#D0021B',
  '#9B59B6', '#1ABC9C', '#E74C3C', '#F39C12',
];

export default function CategoriesScreen() {
  const { state, dispatch } = useAppContext();
  const categories = selectCategories(state);

  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [newName, setNewName]         = useState('');
  const [newColor, setNewColor]       = useState(COLOR_OPTIONS[0]);
  const [saving, setSaving]           = useState(false);
  const [nameError, setNameError]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // category to confirm-delete

  const load = useCallback(async () => {
    dispatch({ type: 'CATEGORIES_LOADING' });
    try {
      const data = await fetchCategories();
      dispatch({ type: 'CATEGORIES_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'CATEGORIES_ERROR', payload: err.message });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openModal = () => {
    setNewName('');
    setNewColor(COLOR_OPTIONS[0]);
    setNameError('');
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!newName.trim()) { setNameError('Name is required'); return; }
    if (newName.trim().length > 50) { setNameError('Max 50 characters'); return; }
    setSaving(true);
    try {
      const cat = await createCategory({ name: newName.trim(), color: newColor });
      dispatch({ type: 'CATEGORY_ADD', payload: cat });
      setShowModal(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      dispatch({ type: 'CATEGORY_DELETE', payload: deleteTarget.id });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading categories…" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={categories.length === 0 ? styles.flex : styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="No categories yet"
            subtitle="Tap + to add your first category."
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{item.name}</Text>
              <Text style={styles.taskCount}>{item.taskCount} task{item.taskCount !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* ── Add Category Modal ────────────────────────────────────────────── */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New Category</Text>

            {/* Name input */}
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              placeholder="e.g. Study, Finance…"
              placeholderTextColor={COLORS.border}
              value={newName}
              onChangeText={(v) => { setNewName(v); setNameError(''); }}
              maxLength={50}
              autoFocus
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            {/* Color picker */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorOption, { backgroundColor: c }, newColor === c && styles.colorSelected]}
                  onPress={() => setNewColor(c)}
                >
                  {newColor === c && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, saving && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={saving}
              >
                <Text style={styles.createText}>{saving ? 'Saving…' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Category"
        message={`"${deleteTarget?.name}" will be removed. Tasks will be uncategorised.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1 },
  container:   { flex: 1, backgroundColor: COLORS.background },
  list:        { padding: 16, paddingBottom: 100 },
  header:      { fontSize: 13, fontWeight: '600', color: COLORS.gray, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  colorDot:    { width: 16, height: 16, borderRadius: 8 },
  catInfo:     { flex: 1 },
  catName:     { fontSize: 15, fontWeight: '600', color: COLORS.dark },
  taskCount:   { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  deleteBtn:   { padding: 6 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6,
  },
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle:  { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 20 },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: COLORS.dark, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.dark,
  },
  inputError:  { borderColor: COLORS.danger },
  errorText:   { fontSize: 12, color: COLORS.danger, marginTop: 4 },
  colorRow:    { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorOption: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  colorSelected: { borderWidth: 3, borderColor: COLORS.dark },
  modalActions:  { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  cancelText:  { fontSize: 15, fontWeight: '600', color: COLORS.dark },
  createBtn:   { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  createText:  { fontSize: 15, fontWeight: '700', color: COLORS.white },
  btnDisabled: { opacity: 0.6 },
});
