// lib/db.js
// Simple JSON-file "database" for local development.
// Reads and writes a single db.json file in the /data directory.

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Default data used when the db file doesn't exist yet
const DEFAULT_DATA = {
  users: [],
  categories: [
    { id: 'cat-1', name: 'Work',     color: '#4A90E2' },
    { id: 'cat-2', name: 'Personal', color: '#7ED321' },
    { id: 'cat-3', name: 'Shopping', color: '#F5A623' },
    { id: 'cat-4', name: 'Health',   color: '#D0021B' },
  ],
  tasks: [],
};

/** Read the entire database and return it as a JS object. */
export function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(DEFAULT_DATA);
      return structuredClone(DEFAULT_DATA);
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] readDb error:', err.message);
    return structuredClone(DEFAULT_DATA);
  }
}

/** Persist the entire database object back to disk. */
export function writeDb(data) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] writeDb error:', err.message);
  }
}
