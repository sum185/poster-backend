'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/dashboard'));

router.get('/dashboard', (req, res) => {
  const stats = {
    posters: db.prepare('SELECT COUNT(*) AS n FROM posters').get().n,
    published: db
      .prepare("SELECT COUNT(*) AS n FROM posters WHERE status = 'published'")
      .get().n,
    drafts: db.prepare("SELECT COUNT(*) AS n FROM posters WHERE status = 'draft'").get().n,
    admins: db.prepare('SELECT COUNT(*) AS n FROM admins').get().n,
  };

  const posters = db
    .prepare('SELECT * FROM posters ORDER BY datetime(created_at) DESC, id DESC LIMIT 6')
    .all();

  const activity = db
    .prepare('SELECT * FROM activity ORDER BY datetime(created_at) DESC, id DESC LIMIT 8')
    .all();

  const categories = db
    .prepare(
      `SELECT category, COUNT(*) AS n FROM posters
       GROUP BY category ORDER BY n DESC, category ASC`
    )
    .all();

  res.render('dashboard', {
    title: 'Dashboard',
    admin: req.session.admin,
    stats,
    posters,
    activity,
    categories,
    active: 'dashboard',
  });
});

module.exports = router;
