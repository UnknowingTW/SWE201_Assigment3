// pages/api/categories/index.js
// GET  /api/categories  →  list all categories
// POST /api/categories  →  create a new category

import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const db = readDb();

  // ── GET /api/categories ───────────────────────────────────────────────────
  if (req.method === 'GET') {
    // Count tasks per category for this user
    const enriched = db.categories.map((cat) => ({
      ...cat,
      taskCount: db.tasks.filter(
        (t) => t.categoryId === cat.id && t.userId === user.id
      ).length,
    }));
    return res.status(200).json({ categories: enriched });
  }

  // ── POST /api/categories ──────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    if (name.trim().length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less' });
    }

    // Prevent duplicate names (case-insensitive)
    const duplicate = db.categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }

    const newCategory = {
      id:    uuidv4(),
      name:  name.trim(),
      color: color || '#8E8E93',
    };

    db.categories.push(newCategory);
    writeDb(db);

    return res.status(201).json({ category: { ...newCategory, taskCount: 0 } });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
