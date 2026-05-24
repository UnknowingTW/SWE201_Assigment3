// pages/api/tasks/[id].js
// GET    /api/tasks/:id  →  single task detail
// PUT    /api/tasks/:id  →  full update
// PATCH  /api/tasks/:id  →  partial update
// DELETE /api/tasks/:id  →  delete

import { readDb, writeDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const db = readDb();

  // Find the task and verify ownership
  const taskIndex = db.tasks.findIndex((t) => t.id === id && t.userId === user.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = db.tasks[taskIndex];
  const category = db.categories.find((c) => c.id === task.categoryId) || null;

  // ── GET /api/tasks/:id ────────────────────────────────────────────────────
  if (req.method === 'GET') {
    return res.status(200).json({ task: { ...task, category } });
  }

  // ── PUT or PATCH /api/tasks/:id ───────────────────────────────────────────
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { title, description, status, categoryId } = req.body;

    // Validate title if provided
    if (title !== undefined) {
      if (!title || title.trim().length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
      }
      if (title.trim().length > 100) {
        return res.status(400).json({ error: 'Title must be 100 characters or less' });
      }
    }

    const validStatuses = ['todo', 'in-progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Merge changes
    const updated = {
      ...task,
      title:       title       !== undefined ? title.trim()       : task.title,
      description: description !== undefined ? description.trim() : task.description,
      status:      status      !== undefined ? status             : task.status,
      categoryId:  categoryId  !== undefined ? categoryId         : task.categoryId,
      updatedAt:   new Date().toISOString(),
    };

    db.tasks[taskIndex] = updated;
    writeDb(db);

    const updatedCategory = db.categories.find((c) => c.id === updated.categoryId) || null;
    return res.status(200).json({ task: { ...updated, category: updatedCategory } });
  }

  // ── DELETE /api/tasks/:id ─────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    db.tasks.splice(taskIndex, 1);
    writeDb(db);
    return res.status(200).json({ message: 'Task deleted successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
