// components/ConfirmModal.js
import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable,
} from 'react-native';
import { COLORS } from '../utils/constants';

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      {/* Semi-transparent backdrop */}
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title || 'Are you sure?'}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.dark,
    fontWeight: '600',
    fontSize: 15,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
