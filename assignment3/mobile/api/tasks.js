// api/tasks.js
// All task-related API calls (CRUD + filtering).

import client from './client';

/** Fetch all tasks for the logged-in user.
 * Supports optional filters: { search, status, categoryId }
 */
export async function fetchTasks(filters = {}) {
  const params = {};
  if (filters.search)     params.search     = filters.search;
  if (filters.status)     params.status     = filters.status;
  if (filters.categoryId) params.categoryId = filters.categoryId;

  const { data } = await client.get('/tasks', { params });
  return data.tasks;
}

/** Fetch a single task by ID. */
export async function fetchTaskById(id) {
  const { data } = await client.get(`/tasks/${id}`);
  return data.task;
}

/** Create a new task.
 * payload: { title, description, status, categoryId }
 */
export async function createTask(payload) {
  const { data } = await client.post('/tasks', payload);
  return data.task;
}

/** Update an existing task (partial update — only changed fields needed). */
export async function updateTask(id, payload) {
  const { data } = await client.patch(`/tasks/${id}`, payload);
  return data.task;
}

/** Delete a task by ID. */
export async function deleteTask(id) {
  const { data } = await client.delete(`/tasks/${id}`);
  return data;
}
