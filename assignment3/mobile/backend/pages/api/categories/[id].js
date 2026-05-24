// pages/api/categories/[id].js
// GET    /api/categories/:id  →  single category
// PUT    /api/categories/:id  →  update
// DELETE /api/categories/:id  →  delete

import { readDb, writeDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const db = readDb();

  const catIndex = db.categories.findIndex((c) => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const category = db.categories[catIndex];

  // ── GET /api/categories/:id ───────────────────────────────────────────────
  if (req.method === 'GET') {
    const taskCount = db.tasks.filter(
      (t) => t.categoryId === id && t.userId === user.id
    ).length;
    return res.status(200).json({ category: { ...category, taskCount } });
  }

  // ── PUT /api/categories/:id ───────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { name, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check for duplicate name (exclude self)
    const duplicate = db.categories.find(
      (c) => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }

    const updated = {
      ...category,
      name:  name.trim(),
      color: color || category.color,
    };

    db.categories[catIndex] = updated;
    writeDb(db);

    return res.status(200).json({ category: updated });
  }

  // ── DELETE /api/categories/:id ────────────────────────────────────────────
  if (req.method === 'DELETE') {
    db.categories.splice(catIndex, 1);

    // Unlink tasks that belonged to this category
    db.tasks = db.tasks.map((t) =>
      t.categoryId === id ? { ...t, categoryId: null } : t
    );

    writeDb(db);
    return res.status(200).json({ message: 'Category deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
