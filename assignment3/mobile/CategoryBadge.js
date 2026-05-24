// components/CategoryBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <View style={[styles.badge, { backgroundColor: category.color + '22' }]}>
      <View style={[styles.dot, { backgroundColor: category.color }]} />
      <Text style={[styles.label, { color: category.color }]}>{category.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
