// utils/constants.js
// Shared constants used across the app.

export const COLORS = {
  primary:    '#4A90E2',
  secondary:  '#7ED321',
  danger:     '#D0021B',
  warning:    '#F5A623',
  dark:       '#1C1C1E',
  gray:       '#8E8E93',
  lightGray:  '#F2F2F7',
  border:     '#C6C6C8',
  white:      '#FFFFFF',
  background: '#F8F9FA',
};

export const TASK_STATUSES = [
  { value: 'todo',        label: 'To Do',       color: '#8E8E93' },
  { value: 'in-progress', label: 'In Progress',  color: '#F5A623' },
  { value: 'done',        label: 'Done',         color: '#7ED321' },
];

export const getStatusInfo = (status) =>
  TASK_STATUSES.find((s) => s.value === status) || TASK_STATUSES[0];

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@taskmanager:auth_token',
  AUTH_USER:  '@taskmanager:auth_user',
  LAST_FILTER:'@taskmanager:last_filter',
};
