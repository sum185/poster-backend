'use strict';

const crypto = require('node:crypto');
const db = require('./db');

const KEYLEN = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const parts = String(stored).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const expected = Buffer.from(hash, 'hex');
  const derived = crypto.scryptSync(String(password), salt, KEYLEN);
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

function findAdminByEmail(email) {
  return db
    .prepare('SELECT * FROM admins WHERE email = ?')
    .get(String(email || '').toLowerCase());
}

function findAdminById(id) {
  return db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
}

function createAdmin({ name, email, password, role = 'admin' }) {
  const stmt = db.prepare(
    'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(name, String(email).toLowerCase(), hashPassword(password), role);
  return findAdminById(info.lastInsertRowid);
}

// Express middleware: block unauthenticated access -------------------------
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl || '/'));
}

// Express middleware: don't show login page to logged-in admins ------------
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.admin) return res.redirect('/dashboard');
  return next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  findAdminByEmail,
  findAdminById,
  createAdmin,
  requireAuth,
  redirectIfAuth,
};
