'use strict';

const db = require('./db');
const auth = require('./auth');
const config = require('./config');

function logActivity(actor, action) {
  db.prepare('INSERT INTO activity (actor, action) VALUES (?, ?)').run(actor, action);
}

function seed() {
  const adminCount = db.prepare('SELECT COUNT(*) AS n FROM admins').get().n;
  if (adminCount === 0) {
    auth.createAdmin(config.defaultAdmin);
    console.log(
      `[seed] Created default admin: ${config.defaultAdmin.email} / ${config.defaultAdmin.password}`
    );
  }

  const posterCount = db.prepare('SELECT COUNT(*) AS n FROM posters').get().n;
  if (posterCount === 0) {
    const insert = db.prepare(
      'INSERT INTO posters (title, category, status) VALUES (?, ?, ?)'
    );
    const rows = [
      ['Summer Sale 2026', 'Promotion', 'published'],
      ['New Product Launch', 'Announcement', 'published'],
      ['Diwali Offer', 'Festival', 'draft'],
      ['Weekend Mega Discount', 'Promotion', 'published'],
      ['Hiring: Graphic Designer', 'Careers', 'archived'],
    ];
    for (const r of rows) insert.run(...r);

    logActivity(config.defaultAdmin.name, 'Seeded sample posters');
    logActivity(config.defaultAdmin.name, 'Logged in');
  }
}

seed();

module.exports = { seed, logActivity };
