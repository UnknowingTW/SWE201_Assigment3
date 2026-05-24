// lib/auth.js
// JWT sign / verify helpers and an Express-style middleware for Next.js API routes.

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_in_prod';
const JWT_EXPIRES_IN = '7d';

/** Create a signed JWT for a user payload ({ id, email, name }). */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Verify a JWT and return the decoded payload, or null if invalid. */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract and verify the Bearer token from the Authorization header.
 * Returns the decoded user or sends a 401 response and returns null.
 */
export function requireAuth(req, res) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return decoded; // { id, email, name, iat, exp }
}
