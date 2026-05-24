// pages/api/auth/register.js
// POST /api/auth/register  →  { token, user }

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../../../lib/db';
import { signToken } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  // --- Validation ---
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const db = readDb();

  // Check for duplicate email
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  // Hash password and save new user
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name });

  return res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
}
