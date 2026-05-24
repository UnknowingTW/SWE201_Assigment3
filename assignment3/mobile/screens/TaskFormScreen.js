// screens/TaskFormScreen.js
// Used for both CREATE and EDIT modes (mode is passed via route.params).

import React, { useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext, selectCategories } from '../store/AppContext';
import { useForm } from '../hooks/useForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { createTask, updateTask } from '../api/tasks';
import { COLORS, TASK_STATUSES } from '../utils/constants';

// Client-side validation for the task form
function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  else if (values.title.trim().length > 100) errors.title = 'Title must be 100 characters or less';
  return errors;
}

export default function TaskFormScreen({ route, navigation }) {
  const { mode, task } = route.params; // mode: 'create' | 'edit'
  const isEdit = mode === 'edit';

  const { state, dispatch } = useAppContext();
  const categories = selectCategories(state);

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, setValues } =
    useForm(
      {
        title:       isEdit ? task.title       : '',
        description: isEdit ? task.description : '',
        status:      isEdit ? task.status      : 'todo',
        categoryId:  isEdit ? task.categoryId  : null,
      },
      validate
    );

  // Set header title based on mode
  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Task' : 'New Task' });
  }, [isEdit, navigation]);

  const onSubmit = () => {
    handleSubmit(async (vals) => {
      try {
        if (isEdit) {
          const updated = await updateTask(task.id, vals);
          dispatch({ type: 'TASK_UPDATE', payload: updated });
          Alert.alert('Saved!', 'Task updated successfully.');
        } else {
          const created = await createTask(vals);
          dispatch({ type: 'TASK_ADD', payload: created });
          Alert.alert('Created!', 'Task created successfully.');
        }
        navigation.goBack();
      } catch (err) {
        // Show server-returned error to the user
        Alert.alert('Error', err.message);
      }
    });
  };

  if (submitting) return <LoadingSpinner message={isEdit ? 'Saving…' : 'Creating…'} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Title ──────────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, touched.title && errors.title && styles.inputError]}
            placeholder="What needs to be done?"
            placeholderTextColor={COLORS.border}
            value={values.title}
            onChangeText={(v) => handleChange('title', v)}
            onBlur={() => handleBlur('title')}
            maxLength={100}
          />
          {touched.title && errors.title ? (
            <Text style={styles.errorText}>{errors.title}</Text>
          ) : null}
          <Text style={styles.charCount}>{values.title.length}/100</Text>
        </View>

        {/* ── Description ────────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Add more details…"
            placeholderTextColor={COLORS.border}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={values.description}
            onChangeText={(v) => handleChange('description', v)}
          />
        </View>

        {/* ── Status picker ──────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.optionRow}>
            {TASK_STATUSES.map((s) => {
              const selected = values.status === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.optionChip,
                    selected && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => handleChange('status', s.value)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Category picker ────────────────────────────────────────────────── */}
        <View style={styles.field}>
          <Text style={styles.label}>Category (optional)</Text>
          <View style={styles.optionRow}>
            {/* "None" option */}
            <TouchableOpacity
              style={[styles.optionChip, !values.categoryId && styles.optionChipActive]}
              onPress={() => handleChange('categoryId', null)}
            >
              <Text style={[styles.optionText, !values.categoryId && styles.optionTextActive]}>
                None
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const selected = values.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.optionChip,
                    selected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() => handleChange('categoryId', cat.id)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Submit button ──────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
          <Ionicons name={isEdit ? 'save-outline' : 'add-circle-outline'} size={20} color={COLORS.white} />
          <Text style={styles.submitText}>{isEdit ? 'Save Changes' : 'Create Task'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content:   { padding: 20, gap: 20, paddingBottom: 40 },
  field:     { gap: 6 },
  label:     { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  required:  { color: COLORS.danger },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.dark,
  },
  inputError:  { borderColor: COLORS.danger },
  textarea:    { minHeight: 100 },
  errorText:   { fontSize: 12, color: COLORS.danger },
  charCount:   { fontSize: 11, color: COLORS.gray, textAlign: 'right' },
  optionRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  optionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText:       { fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  optionTextActive: { color: COLORS.white, fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 8,
  },
  submitText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
