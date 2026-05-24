// pages/api/tasks/index.js
// GET  /api/tasks        →  list (supports ?search=, ?status=, ?categoryId=)
// POST /api/tasks        →  create a new task

import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // All task routes require authentication
  const user = requireAuth(req, res);
  if (!user) return;

  const db = readDb();

  // ── GET /api/tasks ────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    let tasks = db.tasks.filter((t) => t.userId === user.id);

    // Optional search filter (case-insensitive match on title or description)
    const { search, status, categoryId } = req.query;
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
      );
    }
    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }
    if (categoryId) {
      tasks = tasks.filter((t) => t.categoryId === categoryId);
    }

    // Sort newest first
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Enrich each task with its category object
    const categories = db.categories;
    const enriched = tasks.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.categoryId) || null,
    }));

    return res.status(200).json({ tasks: enriched, total: enriched.length });
  }

  // ── POST /api/tasks ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { title, description, status, categoryId } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'Title must be 100 characters or less' });
    }

    const validStatuses = ['todo', 'in-progress', 'done'];
    const taskStatus = status && validStatuses.includes(status) ? status : 'todo';

    const now = new Date().toISOString();
    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: (description || '').trim(),
      status: taskStatus,
      categoryId: categoryId || null,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
    };

    db.tasks.push(newTask);
    writeDb(db);

    // Return enriched task
    const category = db.categories.find((c) => c.id === newTask.categoryId) || null;
    return res.status(201).json({ task: { ...newTask, category } });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
