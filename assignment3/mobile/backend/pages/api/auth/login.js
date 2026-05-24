// pages/api/auth/login.js
// POST /api/auth/login  →  { token, user }

import bcrypt from 'bcryptjs';
import { readDb } from '../../../lib/db';
import { signToken } from '../../../lib/auth';

export default function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // --- Validation ---
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Sign token (never include password in payload)
  const token = signToken({ id: user.id, email: user.email, name: user.name });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
