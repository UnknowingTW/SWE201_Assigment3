// api/categories.js
// Category-related API calls.

import client from './client';

/** Fetch all categories (with task count). */
export async function fetchCategories() {
  const { data } = await client.get('/categories');
  return data.categories;
}

/** Create a new category. payload: { name, color } */
export async function createCategory(payload) {
  const { data } = await client.post('/categories', payload);
  return data.category;
}

/** Update a category. payload: { name, color } */
export async function updateCategory(id, payload) {
  const { data } = await client.put(`/categories/${id}`, payload);
  return data.category;
}

/** Delete a category by ID. */
export async function deleteCategory(id) {
  const { data } = await client.delete(`/categories/${id}`);
  return data;
}
