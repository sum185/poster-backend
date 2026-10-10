'use strict';

const path = require('node:path');

// Tiny .env loader (no dependency) ------------------------------------------
function loadEnv() {
  const fs = require('node:fs');
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv();

const config = {
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  rootDir: path.join(__dirname, '..'),
  dataDir: path.join(__dirname, '..', 'data'),
  defaultAdmin: {
    name: process.env.ADMIN_NAME || 'Super Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  isProd: process.env.NODE_ENV === 'production',
};

module.exports = config;
