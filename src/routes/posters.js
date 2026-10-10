'use strict';

const express = require('express');
const db = require('../db');
const { logActivity } = require('../seed');

const router = express.Router();

const STATUSES = ['draft', 'published', 'archived'];

router.get('/posters', (req, res) => {
  const q = String(req.query.q || '').trim();
  let posters;
  if (q) {
    posters = db
      .prepare(
        `SELECT * FROM posters
         WHERE title LIKE ? OR category LIKE ? OR status LIKE ?
         ORDER BY id DESC`
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    posters = db.prepare('SELECT * FROM posters ORDER BY id DESC').all();
  }

  res.render('posters', {
    title: 'Posters',
    admin: req.session.admin,
    posters,
    q,
    statuses: STATUSES,
    active: 'posters',
  });
});

router.post('/posters', (req, res) => {
  const title = String(req.body.title || '').trim();
  const category = String(req.body.category || 'General').trim() || 'General';
  let status = String(req.body.status || 'draft').trim();
  if (!STATUSES.includes(status)) status = 'draft';

  if (!title) return res.redirect('/posters');

  db.prepare('INSERT INTO posters (title, category, status) VALUES (?, ?, ?)').run(
    title,
    category,
    status
  );
  logActivity(req.session.admin.name, `Created poster "${title}"`);
  res.redirect('/posters');
});

router.post('/posters/:id/status', (req, res) => {
  let status = String(req.body.status || '').trim();
  if (!STATUSES.includes(status)) status = 'draft';
  const poster = db.prepare('SELECT * FROM posters WHERE id = ?').get(req.params.id);
  if (poster) {
    db.prepare('UPDATE posters SET status = ? WHERE id = ?').run(status, poster.id);
    logActivity(req.session.admin.name, `Set "${poster.title}" to ${status}`);
  }
  res.redirect('/posters');
});

router.post('/posters/:id/delete', (req, res) => {
  const poster = db.prepare('SELECT * FROM posters WHERE id = ?').get(req.params.id);
  if (poster) {
    db.prepare('DELETE FROM posters WHERE id = ?').run(poster.id);
    logActivity(req.session.admin.name, `Deleted poster "${poster.title}"`);
  }
  res.redirect('/posters');
});

module.exports = router;
